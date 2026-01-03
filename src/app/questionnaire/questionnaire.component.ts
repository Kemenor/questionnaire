import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PHASE1_QUESTIONS, PHASE2_QUESTIONS, Question, OPTION_SCORES } from './questions';

type Phase = 'phase1' | 'video' | 'phase2' | 'done';

type StoredPhase = {
  answers?: Record<string, number>;
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

const VIDEO_OPTIONS = [
  { id: 'a', url: '/Hohe_Auspragung.mp4' },
  { id: 'b', url: '/Niedrige_Auspragung.mp4' }
] as const;

type VideoChoice = (typeof VIDEO_OPTIONS)[number];

@Component({
  selector: 'app-questionnaire',
  imports: [CommonModule, FormsModule],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.scss'
})
export class QuestionnaireComponent implements OnInit {
  protected readonly phase1Questions = PHASE1_QUESTIONS;
  protected readonly phase2Questions = PHASE2_QUESTIONS;
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

      if (!user.isAnonymous) {
        await signOut(auth);
        await signInAnonymously(auth);
        return;
      }

      this.uid = user.uid;
      await this.loadExistingResponse(user.uid);
      this.loading = false;
    });
  }

  protected answeredCount(answers: Record<string, string>, questions: Question[]): number {
    return questions.filter((question) => answers[question.id]).length;
  }

  protected totalQuestions(questions: Question[]): number {
    return questions.length;
  }

  protected isComplete(answers: Record<string, string>, questions: Question[]): boolean {
    return this.answeredCount(answers, questions) === this.totalQuestions(questions);
  }

  protected async submitPhase1(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.isComplete(this.phase1Answers, this.phase1Questions)) {
      this.errorMessage = 'Please answer every question before continuing.';
      return;
    }

    await this.savePhase('phase1', this.mapAnswersToScores(this.phase1Answers, this.phase1Questions));
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

    this.phase = 'phase2';
    this.statusMessage = 'Phase 2 unlocked. Re-answer the same questions.';
  }

  protected async submitPhase2(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    if (!this.isComplete(this.phase2Answers, this.phase2Questions)) {
      this.errorMessage = 'Please answer every question before finishing.';
      return;
    }

    await this.savePhase('phase2', this.mapAnswersToScores(this.phase2Answers, this.phase2Questions));
    this.phase = 'done';
    this.statusMessage = 'Thanks! Your responses are saved.';
  }

  protected changedQuestions(): Question[] {
    return this.phase2Questions.filter((question) => {
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

    this.phase1Answers = this.restoreAnswers(data.phase1?.answers);
    this.phase2Answers = this.restoreAnswers(data.phase2?.answers);
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

  private async savePhase(phase: 'phase1' | 'phase2', answers: Record<string, number>): Promise<void> {
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

  private mapAnswersToScores(
    answers: Record<string, string>,
    questions: Question[]
  ): Record<string, number> {
    const saveableIds = new Set(
      questions.filter((question) => question.save !== false).map((question) => question.id)
    );
    return Object.fromEntries(
      Object.entries(answers)
        .filter(([questionId]) => saveableIds.has(questionId))
        .map(([questionId, value]) => {
          if (OPTION_SCORES[value] !== undefined) {
            return [questionId, OPTION_SCORES[value]];
          }
          const numericValue = Number(value);
          return [questionId, Number.isNaN(numericValue) ? 0 : numericValue];
        })
    );
  }

  private restoreAnswers(answers?: Record<string, number>): Record<string, string> {
    if (!answers) {
      return {};
    }

    const optionMap = new Map(PHASE1_QUESTIONS.map((question) => [question.id, question.options]));
    return Object.fromEntries(
      Object.entries(answers).map(([questionId, value]) => {
        const options = optionMap.get(questionId);
        const numericValue = typeof value === 'number' ? value : Number(value);
        if (options && Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 5) {
          return [questionId, options[numericValue - 1]];
        }

        return [questionId, String(value)];
      })
    );
  }
}
