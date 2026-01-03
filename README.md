# Questionnaire

Angular + Firebase questionnaire app with anonymous auth, Firestore storage, and an admin export view.

## Setup

1. Add your Firebase web API key in `src/app/firebase.ts` (`apiKey`).
2. Enable **Anonymous** auth in the Firebase console.
3. Enable **Email/Password** auth for the admin account.
4. Enable **Firestore** in the Firebase console.

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

## Routes

- `/` questionnaire flow for anonymous users
- `/admin` admin console with email/password login and CSV export

## Firestore data shape

Each user writes to `responses/{uid}` and stores:

- `phase1.answers`
- `phase2.answers`
- `video.variant`, `video.url`, `video.watchedAt`
- `createdAt`, `updatedAt`
