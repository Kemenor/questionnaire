import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { QUESTIONS, optionToScore } from '../questionnaire/questions';

type StoredPhase = {
  answers?: Record<string, number | string>;
  completedAt?: unknown;
};

type StoredResponse = {
  uid?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  phase1?: StoredPhase;
  phase2?: StoredPhase;
  video?: { watchedAt?: unknown; variant?: string; url?: string };
};

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  protected email = '';
  protected password = '';
  protected adminUser: User | null = null;
  protected loading = true;
  protected isWorking = false;
  protected errorMessage = '';
  protected statusMessage = '';
  protected responses: StoredResponse[] = [];

  async ngOnInit(): Promise<void> {
    onAuthStateChanged(auth, async (user) => {
      this.adminUser = user && !user.isAnonymous ? user : null;
      this.loading = false;

      if (this.adminUser) {
        await this.fetchResponses();
      }
    });
  }

  protected async login(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Enter your admin email and password.';
      return;
    }

    this.isWorking = true;
    try {
      await signInWithEmailAndPassword(auth, this.email, this.password);
      this.statusMessage = 'Signed in.';
    } catch (error) {
      this.errorMessage = (error as Error).message;
    } finally {
      this.isWorking = false;
    }
  }

  protected async logout(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';
    this.isWorking = true;

    try {
      await signOut(auth);
      this.responses = [];
      this.statusMessage = 'Signed out.';
    } catch (error) {
      this.errorMessage = (error as Error).message;
    } finally {
      this.isWorking = false;
    }
  }

  protected async refresh(): Promise<void> {
    await this.fetchResponses();
  }

  protected exportCsv(): void {
    const headers = this.buildHeaders();
    const rows = this.responses.map((response) => this.buildRow(response, headers));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questionnaire-responses-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected responseCount(): number {
    return this.responses.length;
  }

  private buildHeaders(): string[] {
    return [
      'uid',
      'createdAt',
      'updatedAt',
      'videoVariant',
      'videoUrl',
      'videoWatchedAt',
      ...QUESTIONS.map((question) => `phase1_${question.id}`),
      ...QUESTIONS.map((question) => `phase2_${question.id}`)
    ];
  }

  private buildRow(response: StoredResponse, headers: string[]): string[] {
    const row: Record<string, string> = {
      uid: response.uid ?? '',
      createdAt: this.formatTimestamp(response.createdAt),
      updatedAt: this.formatTimestamp(response.updatedAt),
      videoVariant: response.video?.variant ?? '',
      videoUrl: response.video?.url ?? '',
      videoWatchedAt: this.formatTimestamp(response.video?.watchedAt)
    };

    for (const question of QUESTIONS) {
      row[`phase1_${question.id}`] = this.normalizeAnswer(response.phase1?.answers?.[question.id]);
      row[`phase2_${question.id}`] = this.normalizeAnswer(response.phase2?.answers?.[question.id]);
    }

    return headers.map((header) => this.escapeCsv(row[header] ?? ''));
  }

  private escapeCsv(value: string): string {
    const shouldQuote = value.includes(',') || value.includes('"') || value.includes('\n');
    const escaped = value.replace(/"/g, '""');
    return shouldQuote ? `"${escaped}"` : escaped;
  }

  private normalizeAnswer(answer: number | string | undefined): string {
    if (answer === undefined || answer === null) {
      return '';
    }

    if (typeof answer === 'number') {
      return String(answer);
    }

    const score = optionToScore(answer);
    return score ? String(score) : answer;
  }

  private formatTimestamp(timestamp: unknown): string {
    if (!timestamp) {
      return '';
    }

    const maybeTimestamp = timestamp as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === 'function') {
      return maybeTimestamp.toDate().toISOString();
    }

    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }

    return String(timestamp);
  }

  private async fetchResponses(): Promise<void> {
    if (!this.adminUser) {
      this.responses = [];
      return;
    }

    this.isWorking = true;
    this.errorMessage = '';

    try {
      const snapshot = await getDocs(collection(db, 'responses'));
      this.responses = snapshot.docs.map((docSnap) => docSnap.data() as StoredResponse);
    } catch (error) {
      this.errorMessage = (error as Error).message;
    } finally {
      this.isWorking = false;
    }
  }
}
