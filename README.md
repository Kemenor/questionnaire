# Questionnaire

Angular + Firebase questionnaire app with anonymous auth and Firestore storage.

## Setup

1. Add your Firebase web API key in `src/app/firebase.ts` (`apiKey`).
2. Enable **Anonymous** auth in the Firebase console.
3. Enable **Firestore** in the Firebase console.

## Development server

```bash
ng serve
```

## Build

```bash
ng build
```

## Firebase Hosting deploy

```bash
firebase use questionnaire-72c7e
firebase deploy
```

## Firestore data shape

Each user writes to `responses/{uid}` and stores:

- `phase1.answers`
- `phase2.answers`
- `video.watchedAt`
- `createdAt`, `updatedAt`
