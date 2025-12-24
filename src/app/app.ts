import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

type Phase = 'phase1' | 'video' | 'phase2' | 'done';

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

type StoredPhase = {
  answers?: Record<string, string>;
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

const DEFAULT_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree'
];

const QUESTIONS: Question[] = Array.from({ length: 15 }, (_, index) => ({
  id: `q${index + 1}`,
  prompt: `Question ${index + 1}`,
  options: DEFAULT_OPTIONS
}));

const VIDEO_OPTIONS = [
  { id: 'a', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { id: 'b', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
] as const;

type VideoChoice = (typeof VIDEO_OPTIONS)[number];

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly questions = QUESTIONS;
  protected uid: string | null = null;
  protected phase: Phase = 'phase1';
  protected loading = true;
  protected isSaving = false;
  protected errorMessage = '';
  protected statusMessage = '';
  protected phase1Answers: Record<string, string> = {};
  protected phase2Answers: Record<string, string> = {};
  protected videoWatched = false;
  protected selectedVideo: VideoChoice | null = null;

  async ngOnInit(): Promise<void> {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
        return;
      }

      this.uid = user.uid;
      await this.loadExistingResponse(user.uid);
      this.loading = false;
    });
  }

  protected answeredCount(answers: Record<string, string>): number {
    return this.questions.filter((question) => answers[question.id]).length;
  }

  protected totalQuestions(): number {
    return this.questions.length;
  }

  protected isComplete(answers: Record<string, string>): boolean {
    return this.answeredCount(answers) === this.totalQuestions();
  }

  protected async submitPhase1(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.isComplete(this.phase1Answers)) {
      this.errorMessage = 'Please answer every question before continuing.';
      return;
    }

    await this.savePhase('phase1', this.phase1Answers);
    this.phase = 'video';
    await this.ensureVideoAssignment();
    this.statusMessage = 'Phase 1 saved. Watch the video to continue.';
  }

  protected async markVideoWatched(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    await this.ensureVideoAssignment();
    await this.saveVideoProgress();
    this.videoWatched = true;

    if (Object.keys(this.phase2Answers).length === 0) {
      this.phase2Answers = { ...this.phase1Answers };
    }

    this.phase = 'phase2';
    this.statusMessage = 'Phase 2 unlocked. Re-answer the same questions.';
  }

  protected async submitPhase2(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.isComplete(this.phase2Answers)) {
      this.errorMessage = 'Please answer every question before finishing.';
      return;
    }

    await this.savePhase('phase2', this.phase2Answers);
    this.phase = 'done';
    this.statusMessage = 'Thanks! Your responses are saved.';
  }

  protected changedQuestions(): Question[] {
    return this.questions.filter((question) => {
      const initial = this.phase1Answers[question.id];
      const after = this.phase2Answers[question.id];

      return initial && after && initial !== after;
    });
  }

  private async loadExistingResponse(uid: string): Promise<void> {
    const snapshot = await getDoc(doc(db, 'responses', uid));

    if (!snapshot.exists()) {
      this.phase = 'phase1';
      return;
    }

    const data = snapshot.data() as StoredResponse;

    this.phase1Answers = data.phase1?.answers ?? {};
    this.phase2Answers = data.phase2?.answers ?? {};
    this.videoWatched = Boolean(data.video?.watchedAt);
    this.selectedVideo = this.getVideoChoice(data.video?.variant, data.video?.url);

    if (data.phase2?.completedAt) {
      this.phase = 'done';
    } else if (this.videoWatched) {
      this.phase = 'phase2';
    } else if (data.phase1?.completedAt) {
      this.phase = 'video';
    } else {
      this.phase = 'phase1';
    }

    if (this.phase === 'video' && !this.selectedVideo) {
      await this.ensureVideoAssignment();
    }
  }

  private async savePhase(phase: 'phase1' | 'phase2', answers: Record<string, string>): Promise<void> {
    if (!this.uid) {
      this.errorMessage = 'Signing in... please try again.';
      return;
    }

    this.isSaving = true;
    const reference = doc(db, 'responses', this.uid);
    const snapshot = await getDoc(reference);
    const createdAt = snapshot.exists()
      ? (snapshot.data()['createdAt'] ?? serverTimestamp())
      : serverTimestamp();

    try {
      await setDoc(
        reference,
        {
          uid: this.uid,
          updatedAt: serverTimestamp(),
          createdAt,
          [phase]: {
            answers,
            completedAt: serverTimestamp()
          }
        },
        { merge: true }
      );
    } finally {
      this.isSaving = false;
    }
  }

  private async saveVideoProgress(): Promise<void> {
    if (!this.uid) {
      this.errorMessage = 'Signing in... please try again.';
      return;
    }

    this.isSaving = true;
    const reference = doc(db, 'responses', this.uid);
    const snapshot = await getDoc(reference);
    const createdAt = snapshot.exists()
      ? (snapshot.data()['createdAt'] ?? serverTimestamp())
      : serverTimestamp();

    try {
      await setDoc(
        reference,
        {
          uid: this.uid,
          updatedAt: serverTimestamp(),
          createdAt,
          video: {
            watchedAt: serverTimestamp(),
            variant: this.selectedVideo?.id ?? null,
            url: this.selectedVideo?.url ?? null
          }
        },
        { merge: true }
      );
    } finally {
      this.isSaving = false;
    }
  }

  private getVideoChoice(variant?: string, url?: string): VideoChoice | null {
    if (variant) {
      const match = VIDEO_OPTIONS.find((option) => option.id === variant);
      if (match) {
        return match;
      }
    }

    if (url) {
      const match = VIDEO_OPTIONS.find((option) => option.url === url);
      if (match) {
        return match;
      }
    }

    return null;
  }

  private async ensureVideoAssignment(): Promise<void> {
    if (this.selectedVideo || !this.uid) {
      return;
    }

    const choice = VIDEO_OPTIONS[Math.floor(Math.random() * VIDEO_OPTIONS.length)];
    this.selectedVideo = choice;

    await this.saveVideoAssignment(choice);
  }

  private async saveVideoAssignment(choice: VideoChoice): Promise<void> {
    const reference = doc(db, 'responses', this.uid!);
    const snapshot = await getDoc(reference);
    const createdAt = snapshot.exists()
      ? (snapshot.data()['createdAt'] ?? serverTimestamp())
      : serverTimestamp();

    await setDoc(
      reference,
      {
        uid: this.uid,
        updatedAt: serverTimestamp(),
        createdAt,
        video: {
          variant: choice.id,
          url: choice.url
        }
      },
      { merge: true }
    );
  }
}
