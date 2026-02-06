/**
 * Konfiguracja Firebase dla aplikacji
 * 
 * Ten plik zawiera konfigurację Firebase oraz eksportuje główne moduły:
 * - auth: do obsługi uwierzytelniania użytkowników z persistencją
 * - db: do obsługi bazy danych Firestore
 * 
 * UWAGA: Storage przeniesiony do Appwrite (lib/appwrite.js)
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Konfiguracja Firebase z zmiennych środowiskowych
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicjalizacja aplikacji Firebase
const app = initializeApp(firebaseConfig);

// Eksport modułu uwierzytelniania z persistencją AsyncStorage
// Używany do logowania, rejestracji i wylogowywania użytkowników
// AsyncStorage zapewnia że użytkownik pozostaje zalogowany po zamknięciu aplikacji
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Eksport modułu Firestore (baza danych)
// Używany do przechowywania i pobierania danych o trasach
export const db = getFirestore(app);

// UWAGA: Storage przeniesiony do Appwrite
// Import funkcji uploadRouteImage z lib/appwrite.js
// import { uploadRouteImage } from './appwrite';
