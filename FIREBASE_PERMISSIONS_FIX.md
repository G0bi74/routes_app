# 🔒 Instrukcja naprawy błędu uprawnień Firebase

## Problem
```
ERROR: Missing or insufficient permissions
```

Ten błąd oznacza, że reguły bezpieczeństwa Firestore blokują zapis danych. Musisz zaktualizować reguły w konsoli Firebase.

## ✅ Rozwiązanie - Aktualizacja reguł Firestore

### Krok 1: Przejdź do konsoli Firebase

1. Otwórz https://console.firebase.google.com/
2. Wybierz projekt **routesapp-55bb2**
3. W menu po lewej stronie kliknij **Firestore Database**
4. Przejdź do zakładki **Reguły** (Rules)

### Krok 2: Zastąp reguły

Usuń wszystkie obecne reguły i wklej poniższe:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funkcja pomocnicza - sprawdza czy użytkownik jest zalogowany
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Funkcja pomocnicza - sprawdza czy użytkownik jest właścicielem dokumentu
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Reguły dla kolekcji 'routes'
    match /routes/{routeId} {
      
      // Odczyt (read) - użytkownik może czytać tylko swoje trasy
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      
      // Tworzenie (create) - użytkownik może tworzyć trasy tylko dla siebie
      allow create: if isSignedIn() 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.userId is string
                    && request.resource.data.createdAt is timestamp;
      
      // Aktualizacja (update) - użytkownik może aktualizować tylko swoje trasy
      allow update: if isSignedIn() 
                    && isOwner(resource.data.userId)
                    && request.resource.data.userId == resource.data.userId;
      
      // Usuwanie (delete) - użytkownik może usuwać tylko swoje trasy
      allow delete: if isSignedIn() && isOwner(resource.data.userId);
    }
    
    // Domyślnie blokuj dostęp do wszystkich innych kolekcji
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Krok 3: Publikuj reguły

1. Kliknij przycisk **Publikuj** (Publish) na górze
2. Poczekaj na potwierdzenie (kilka sekund)

### Krok 4: Przetestuj aplikację

1. Zamknij i uruchom ponownie aplikację
2. Zaloguj się
3. Spróbuj utworzyć trasę GPS

## 📝 Co robią te reguły?

### ✅ Pozwalają na:
- **Czytanie** - użytkownik widzi tylko swoje trasy
- **Tworzenie** - użytkownik może tworzyć trasy z własnym `userId`
- **Aktualizacja** - użytkownik może aktualizować tylko swoje trasy
- **Usuwanie** - użytkownik może usuwać tylko swoje trasy

### ❌ Blokują:
- Dostęp do tras innych użytkowników
- Tworzenie tras bez zalogowania
- Zmianę `userId` w istniejących trasach
- Dostęp do innych kolekcji

## 🔍 Weryfikacja reguł

W konsoli Firebase możesz przetestować reguły:

1. W zakładce **Reguły** kliknij **Symulator reguł**
2. Wybierz operację (np. "create")
3. Ustaw ścieżkę: `/routes/test123`
4. Zaznacz "Authenticated"
5. Ustaw `auth.uid`: `testUserId`
6. W polu "Data" wklej:
```json
{
  "userId": "testUserId",
  "startAddress": "Test",
  "createdAt": "2024-01-01T00:00:00Z"
}
```
7. Kliknij **Uruchom** - powinno pokazać "Permitted" ✅

## 🚨 Alternatywa (tylko do testów!)

Jeśli chcesz **tymczasowo** pozwolić wszystkim na zapis (NIE POLECANE w produkcji):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **UWAGA**: Te reguły są mniej bezpieczne - każdy zalogowany użytkownik może edytować trasy innych!

## 📚 Więcej informacji

- [Dokumentacja reguł Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Testowanie reguł](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

## ✅ Gotowe!

Po zaktualizowaniu reguł, aplikacja powinna działać poprawnie. Błąd "insufficient permissions" zniknie.
