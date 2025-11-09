# 🚀 Szybki Start - Routes App

## ⚡ 5 minut do działającej aplikacji

### Krok 1: Zainstaluj zależności (1 min)

```bash
cd routes_app
npm install
```

### Krok 2: Konfiguracja Firebase (3 min)

#### 2.1. Utwórz projekt Firebase

1. Przejdź do https://console.firebase.google.com
2. Kliknij **"Dodaj projekt"**
3. Nazwij projekt: `routes-app` (lub dowolnie)
4. Wyłącz Google Analytics (opcjonalnie)
5. Kliknij **"Utwórz projekt"**

#### 2.2. Włącz Authentication

1. W lewym menu kliknij **Authentication**
2. Kliknij **"Rozpocznij"**
3. Wybierz **"Email/Password"**
4. Włącz pierwszą opcję (Email/Password)
5. Kliknij **"Zapisz"**

#### 2.3. Utwórz Firestore

1. W lewym menu kliknij **Firestore Database**
2. Kliknij **"Utwórz bazę danych"**
3. Wybierz **"Rozpocznij w trybie testowym"**
4. Wybierz lokalizację (np. europe-west)
5. Kliknij **"Włącz"**

#### 2.4. Pobierz konfigurację

1. Kliknij ikonę koła zębatego → **"Ustawienia projektu"**
2. Przewiń w dół do sekcji **"Twoje aplikacje"**
3. Kliknij ikonę **Web** `</>`
4. Nazwij aplikację: `routes-app-web`
5. NIE zaznaczaj Firebase Hosting
6. Kliknij **"Zarejestruj aplikację"**
7. **SKOPIUJ** wartości z `firebaseConfig`

#### 2.5. Zaktualizuj konfigurację w projekcie

Otwórz plik `lib/firebase.js` i wklej swoje wartości:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",      // ← Twój klucz
  authDomain: "routes-app-xxxxx.firebaseapp.com",    // ← Twoja domena
  projectId: "routes-app-xxxxx",                     // ← Twoje ID
  storageBucket: "routes-app-xxxxx.appspot.com",     // ← Twój bucket
  messagingSenderId: "123456789012",                 // ← Twoje ID
  appId: "1:123456789012:web:xxxxxxxxxxxx"          // ← Twoje App ID
};
```

### Krok 3: Uruchom aplikację (1 min)

```bash
npm start
```

Wybierz platformę:
- **w** - Otwórz w przeglądarce (najszybsze dla testów)
- **a** - Otwórz na Androidzie (wymaga emulatora lub urządzenia)
- **i** - Otwórz na iOS (tylko macOS)

## ✅ Pierwsze kroki w aplikacji

### 1. Zarejestruj się

1. Kliknij **"Strona Rejestracji"**
2. Wprowadź email: `test@test.com`
3. Wprowadź hasło: `test123` (min. 6 znaków)
4. Kliknij **"Zarejestruj"**

### 2. Utwórz pierwszą trasę

1. Przejdź do zakładki **"Utwórz"** (ikona +)
2. Wypełnij formularz:
   - Adres początku: `ul. Główna 1, Warszawa`
   - Godzina rozpoczęcia: `08:00`
   - Data: `2024-01-15`
   - Adres końca: `ul. Końcowa 10, Warszawa`
   - Godzina zakończenia: `10:30`
   - Opis: `Pierwsza testowa trasa`
3. Kliknij **"Tworzenie Trasy"**

### 3. Zobacz trasę w historii

1. Przejdź do zakładki **"Historia"**
2. Zobaczysz swoją trasę na liście
3. Kliknij na trasę aby zobaczyć szczegóły

### 4. Usuń trasę (opcjonalnie)

1. Otwórz szczegóły trasy
2. Kliknij **"Usuń Trasę"**

## 🔧 Rozwiązywanie problemów

### Błąd: "Module not found"

```bash
# Wyczyść cache i zainstaluj ponownie
rm -rf node_modules
npm install
npm start -- --clear
```

### Błąd: Firebase configuration

- Sprawdź czy skopiowałeś WSZYSTKIE wartości z Firebase Console
- Sprawdź czy nie ma cudzysłowów w cudzysłowach
- Sprawdź czy wszystkie przecinki są na swoim miejscu

### Błąd przy logowaniu: "auth/invalid-email"

- Upewnij się że email jest prawidłowy (zawiera @)
- Sprawdź czy włączyłeś Email/Password w Firebase Authentication

### Błąd przy tworzeniu trasy: "Permission denied"

- Upewnij się że Firestore jest w trybie testowym
- Sprawdź czy użytkownik jest zalogowany

### Aplikacja się nie uruchamia

```bash
# Zresetuj wszystko
expo start -c
```

### Brak logo

- To normalne! Logo jest opcjonalne
- Zobacz `assets/README.md` jak dodać logo
- Możesz usunąć komponent `<ThemedLogo/>` z `app/index.jsx`

## 📱 Testowanie na prawdziwym urządzeniu

### Android / iOS

1. Zainstaluj aplikację **Expo Go** z Play Store / App Store
2. Uruchom `npm start`
3. Zeskanuj kod QR w aplikacji Expo Go

### Przeglądarka

1. Uruchom `npm start`
2. Naciśnij **w**
3. Otwórz w Chrome/Firefox

## 🎓 Następne kroki

1. **Przeczytaj README.md** - Pełna dokumentacja
2. **Przeczytaj ARCHITEKTURA.md** - Zrozum jak działa aplikacja
3. **Eksperymentuj!** - Zmień kolory w `constants/Colors.js`
4. **Dodaj nowe pola** - Zobacz jak rozszerzyć formularz

## 📚 Przydatne linki

- [Dokumentacja Firebase](https://firebase.google.com/docs)
- [Dokumentacja Expo](https://docs.expo.dev)
- [Dokumentacja React Native](https://reactnative.dev)
- [Expo Router](https://expo.github.io/router/docs)

## 💬 Potrzebujesz pomocy?

1. Sprawdź błędy w konsoli (Ctrl + Shift + I w przeglądarce)
2. Sprawdź Firebase Console → Authentication → Users
3. Sprawdź Firebase Console → Firestore → Data
4. Przeczytaj komunikaty błędów (często są bardzo pomocne!)

---

**Powodzenia! 🚀 Teraz możesz zacząć tworzyć swoją aplikację!**
