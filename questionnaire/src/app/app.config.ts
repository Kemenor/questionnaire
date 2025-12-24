import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({ projectId: "questionnaire-72c7e", appId: "1:187267928880:web:35cf871933965a19b0eef5", storageBucket: "questionnaire-72c7e.firebasestorage.app", apiKey: "AIzaSyCwMIzsYzLVx7q3WIcqHTt1j1rKPZMyo1s", authDomain: "questionnaire-72c7e.firebaseapp.com", messagingSenderId: "187267928880", measurementId: "G-YW4CPBMDX0" })),
    provideAnalytics(() => getAnalytics()), ScreenTrackingService, provideFirebaseApp(() => initializeApp({ projectId: "questionnaire-72c7e", appId: "1:187267928880:web:35cf871933965a19b0eef5", storageBucket: "questionnaire-72c7e.firebasestorage.app", apiKey: "AIzaSyCwMIzsYzLVx7q3WIcqHTt1j1rKPZMyo1s", authDomain: "questionnaire-72c7e.firebaseapp.com", messagingSenderId: "187267928880", measurementId: "G-YW4CPBMDX0", projectNumber: "187267928880", version: "2" })), provideAnalytics(() => getAnalytics()), ScreenTrackingService, provideFirestore(() => getFirestore())
  ]
};
