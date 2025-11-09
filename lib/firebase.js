/**
 * Konfiguracja Firebase dla aplikacji
 * 
 * Ten plik zawiera konfigurację Firebase oraz eksportuje główne moduły:
 * - auth: do obsługi uwierzytelniania użytkowników
 * - db: do obsługi bazy danych Firestore
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDSZ5EQKc-a9vVwwdnH8u7DJfYDpbUEL1s",    // Klucz API z Firebase
  authDomain: "routesapp-55bb2.firebaseapp.com",        // Domena autoryzacji
  projectId: "routesapp-55bb2",                         // ID projektu
  storageBucket: "routesapp-55bb2.firebasestorage.app", // Bucket do przechowywania plików
  messagingSenderId: "1001288712594",                   // ID dla Cloud Messaging
  appId: "1:1001288712594:web:062f69f7f905f6313f814b"   // ID aplikacji
};

// Inicjalizacja aplikacji Firebase
const app = initializeApp(firebaseConfig);

// Eksport modułu uwierzytelniania
// Używany do logowania, rejestracji i wylogowywania użytkowników
export const auth = getAuth(app);

// Eksport modułu Firestore (baza danych)
// Używany do przechowywania i pobierania danych o trasach
export const db = getFirestore(app);
