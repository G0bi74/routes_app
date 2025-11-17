/**
 * Narzędzie diagnostyczne - sprawdzanie uprawnień Firebase
 * 
 * Użyj tego skryptu aby zdiagnozować problemy z uprawnieniami.
 * Uruchom w konsoli przeglądarki lub jako osobny skrypt.
 */

import { db } from './lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth } from './lib/firebase';

/**
 * Test uprawnień Firestore
 */
export async function testFirestorePermissions() {
    console.log('🔍 Sprawdzanie uprawnień Firestore...\n');

    // Sprawdź czy użytkownik jest zalogowany
    const user = auth.currentUser;
    if (!user) {
        console.error('❌ Użytkownik nie jest zalogowany!');
        console.log('Zaloguj się przed uruchomieniem testu.');
        return;
    }

    console.log('✅ Użytkownik zalogowany:', user.email);
    console.log('   UID:', user.uid);
    console.log('');

    // Test 1: Odczyt
    try {
        console.log('📖 Test 1: Odczyt tras...');
        const routesRef = collection(db, 'routes');
        const snapshot = await getDocs(routesRef);
        console.log('✅ Odczyt dozwolony - znaleziono', snapshot.size, 'tras');
    } catch (error) {
        console.error('❌ Odczyt zablokowany:', error.message);
    }

    // Test 2: Tworzenie
    try {
        console.log('\n📝 Test 2: Tworzenie testowej trasy...');
        const testRoute = {
            userId: user.uid,
            startAddress: 'Test Start',
            endAddress: 'Test End',
            description: 'Test trasy - uprawnień',
            createdAt: new Date(),
            distance: 10,
            status: 'completed'
        };
        
        const docRef = await addDoc(collection(db, 'routes'), testRoute);
        console.log('✅ Tworzenie dozwolone - ID:', docRef.id);
        
        // Test 3: Aktualizacja
        try {
            console.log('\n✏️  Test 3: Aktualizacja testowej trasy...');
            await updateDoc(doc(db, 'routes', docRef.id), {
                description: 'Test aktualizacji'
            });
            console.log('✅ Aktualizacja dozwolona');
        } catch (error) {
            console.error('❌ Aktualizacja zablokowana:', error.message);
        }

        // Test 4: Usuwanie
        try {
            console.log('\n🗑️  Test 4: Usuwanie testowej trasy...');
            await deleteDoc(doc(db, 'routes', docRef.id));
            console.log('✅ Usuwanie dozwolone');
        } catch (error) {
            console.error('❌ Usuwanie zablokowane:', error.message);
        }

    } catch (error) {
        console.error('❌ Tworzenie zablokowane:', error.message);
        console.log('\n💡 Najprawdopodobniej problem z regułami Firestore!');
        console.log('   Sprawdź plik: FIREBASE_PERMISSIONS_FIX.md');
    }

    console.log('\n✅ Test zakończony');
}

/**
 * Sprawdza obecne reguły bezpieczeństwa (wymaga dostępu admin)
 */
export function showCurrentRules() {
    console.log('📋 Aktualne reguły Firestore:');
    console.log('Przejdź do: https://console.firebase.google.com/');
    console.log('Projekt: routesapp-55bb2');
    console.log('Firestore Database > Reguły');
}

/**
 * Wyświetla przykładowe poprawne reguły
 */
export function showCorrectRules() {
    console.log('✅ Poprawne reguły Firestore:\n');
    console.log(`
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    match /routes/{routeId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() 
                    && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow delete: if isSignedIn() && isOwner(resource.data.userId);
    }
  }
}
    `);
}

// Eksport funkcji diagnostycznych
export default {
    testFirestorePermissions,
    showCurrentRules,
    showCorrectRules
};
