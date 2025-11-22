/**
 * Konfiguracja Firebase dla aplikacji
 * 
 * Ten plik zawiera konfigurację Firebase oraz eksportuje główne moduły:
 * - auth: do obsługi uwierzytelniania użytkowników z persistencją
 * - db: do obsługi bazy danych Firestore
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

// Eksport modułu uwierzytelniania z persistencją AsyncStorage
// Używany do logowania, rejestracji i wylogowywania użytkowników
// AsyncStorage zapewnia że użytkownik pozostaje zalogowany po zamknięciu aplikacji
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Eksport modułu Firestore (baza danych)
// Używany do przechowywania i pobierania danych o trasach
export const db = getFirestore(app);

// Eksport modułu Storage (przechowywanie plików)
// Używany do przechowywania zdjęć tras
export const storage = getStorage(app);

/**
 * Uploaduje zdjęcie trasy do Firebase Storage
 * @param {string} userId - ID użytkownika
 * @param {string} routeId - ID trasy
 * @param {string} imageUri - Lokalna ścieżka do zdjęcia (file://)
 * @param {string} type - Typ zdjęcia ('start' lub 'end')
 * @returns {Promise<string>} - URL do pobranego zdjęcia
 */
export async function uploadRouteImage(userId, routeId, imageUri, type) {
  try {
    // Pobranie pliku jako blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Utworzenie ścieżki w Storage: route-images/{userId}/{routeId}/{type}.jpg
    const storageRef = ref(storage, `route-images/${userId}/${routeId}/${type}.jpg`);
    
    // Upload pliku
    await uploadBytes(storageRef, blob);
    
    // Pobranie publicznego URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading route image:', error);
    throw new Error('Nie udało się przesłać zdjęcia');
  }
}
