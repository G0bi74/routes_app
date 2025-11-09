# Routes App - Aplikacja do zarządzania trasami

Prosta aplikacja mobilna do zarządzania trasami zbudowana z **React Native**, **Expo Router** i **Firebase**.

## 📚 Dokumentacja

- **[QUICKSTART.md](QUICKSTART.md)** - 🚀 Szybki start (5 minut)
- **[ARCHITEKTURA.md](ARCHITEKTURA.md)** - 🏗️ Jak działa aplikacja (dla początkujących)
- **[POROWNANIE.md](POROWNANIE.md)** - 🔄 Firebase vs Appwrite
- **[CHECKLIST.md](CHECKLIST.md)** - ✅ Lista kontrolna
- **[DOKUMENTACJA_PEŁNA.md](DOKUMENTACJA_PEŁNA.md)** - 📦 Pełne podsumowanie

## 📱 O aplikacji

Aplikacja pozwala użytkownikom na:
- ✅ Rejestrację i logowanie (Firebase Authentication)
- ✅ Tworzenie nowych tras z szczegółowymi informacjami
- ✅ Przeglądanie historii swoich tras
- ✅ Wyświetlanie szczegółów każdej trasy
- ✅ Usuwanie tras
- ✅ Automatyczną synchronizację danych w czasie rzeczywistym

## 🏗️ Struktura projektu

```
routes_app/
├── app/                          # Ekrany aplikacji (Expo Router)
│   ├── (auth)/                   # Grupa tras dla niezalogowanych
│   │   ├── _layout.jsx          # Layout z ochroną GuestsOnly
│   │   ├── login.jsx            # Ekran logowania
│   │   └── register.jsx         # Ekran rejestracji
│   ├── (dashboard)/             # Grupa tras dla zalogowanych
│   │   ├── _layout.jsx          # Layout z nawigacją tabs i ochroną UserOnly
│   │   ├── profile.jsx          # Profil użytkownika
│   │   ├── create.jsx           # Tworzenie nowej trasy
│   │   ├── history.jsx          # Lista wszystkich tras
│   │   └── routes/
│   │       └── [id].jsx         # Szczegóły pojedynczej trasy
│   ├── _layout.jsx              # Główny layout aplikacji
│   └── index.jsx                # Strona główna
├── components/                   # Komponenty wielokrotnego użytku
│   ├── auth/                    # Komponenty ochrony tras
│   │   ├── GuestsOnly.jsx      # Ochrona dla niezalogowanych
│   │   └── UserOnly.jsx        # Ochrona dla zalogowanych
│   ├── Spacer.jsx              # Komponent odstępu
│   ├── ThemedButton.jsx        # Przycisk z motywem
│   ├── ThemedCard.jsx          # Karta z motywem
│   ├── ThemedLoader.jsx        # Spinner ładowania
│   ├── ThemedLogo.jsx          # Logo aplikacji
│   ├── ThemedText.jsx          # Tekst z motywem
│   ├── ThemedTextInput.jsx     # Pole tekstowe z motywem
│   └── ThemedView.jsx          # Kontener z motywem
├── context/                     # Konteksty React (stan globalny)
│   ├── UserContext.jsx         # Kontekst użytkownika (auth)
│   └── RoutesContext.jsx       # Kontekst tras (CRUD)
├── hooks/                       # Custom hooks
│   ├── useUser.js              # Hook do kontekstu użytkownika
│   └── useRoutes.js            # Hook do kontekstu tras
├── lib/                         # Biblioteki i konfiguracja
│   └── firebase.js             # Konfiguracja Firebase
├── constants/                   # Stałe aplikacji
│   └── Colors.js               # Paleta kolorów
├── assets/                      # Zasoby (obrazy, czcionki)
│   └── img/                    # Obrazy
├── package.json                # Zależności projektu
└── app.json                    # Konfiguracja Expo
```

## 🔥 Firebase - Struktura danych

### Kolekcja: `routes`

Każda trasa zawiera następujące pola:

```javascript
{
  id: "auto-generated-id",           // Automatyczne ID dokumentu
  userId: "user-uid",                // ID użytkownika (właściciela)
  startAdress: "ul. Przykładowa 1",  // Adres początku trasy
  startTime: "08:00",                // Godzina rozpoczęcia
  date: "2024-01-15",                // Data
  endAdress: "ul. Końcowa 10",       // Adres końca trasy
  endTime: "10:30",                  // Godzina zakończenia
  description: "Opis trasy...",      // Opis trasy
  createdAt: Timestamp               // Data utworzenia
}
```

## 🚀 Instalacja i uruchomienie

### 1. Wymagania wstępne

- Node.js (v16 lub nowszy)
- npm lub yarn
- Expo CLI: `npm install -g expo-cli`
- Konto Firebase

### 2. Instalacja zależności

```bash
cd routes_app
npm install
```

### 3. Konfiguracja Firebase

#### Krok 1: Utwórz projekt Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com)
2. Kliknij "Add project" (Dodaj projekt)
3. Podaj nazwę projektu i zakończ konfigurację

#### Krok 2: Włącz Authentication

1. W Firebase Console przejdź do **Authentication**
2. Kliknij "Get started"
3. Włącz metodę **Email/Password**

#### Krok 3: Utwórz bazę Firestore

1. W Firebase Console przejdź do **Firestore Database**
2. Kliknij "Create database"
3. Wybierz tryb "Start in test mode" (dla rozwoju)
4. Wybierz lokalizację serwera

#### Krok 4: Dodaj aplikację Web

1. W Firebase Console przejdź do **Project settings**
2. Przewiń do "Your apps" i kliknij ikonę Web (</>)
3. Zarejestruj aplikację
4. Skopiuj konfigurację Firebase

#### Krok 5: Zaktualizuj konfigurację

Otwórz plik `lib/firebase.js` i zastąp wartości konfiguracji swoimi:

```javascript
const firebaseConfig = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "TWOJ_PROJECT.firebaseapp.com",
  projectId: "TWOJ_PROJECT_ID",
  storageBucket: "TWOJ_PROJECT.appspot.com",
  messagingSenderId: "TWOJ_SENDER_ID",
  appId: "TWOJA_APP_ID"
};
```

### 4. Uruchomienie aplikacji

```bash
# Uruchomienie serwera deweloperskiego
npm start

# Uruchomienie na Androidzie
npm run android

# Uruchomienie na iOS
npm run ios

# Uruchomienie w przeglądarce
npm run web
```

## 📚 Jak działa aplikacja?

### 1. Uwierzytelnianie (Authentication)

- **UserContext** (`context/UserContext.jsx`) zarządza stanem użytkownika
- Funkcje: `login()`, `register()`, `logout()`
- Automatyczne sprawdzanie stanu przy starcie aplikacji
- Hook `useUser()` udostępnia funkcje w całej aplikacji

### 2. Zarządzanie trasami (Routes Management)

- **RoutesContext** (`context/RoutesContext.jsx`) zarządza trasami
- Funkcje: `createRoute()`, `deleteRoute()`, `fetchRouteById()`
- Automatyczna synchronizacja w czasie rzeczywistym (onSnapshot)
- Hook `useRoutes()` udostępnia funkcje w całej aplikacji

### 3. Ochrona tras (Route Guards)

- **GuestsOnly**: Przepuszcza tylko niezalogowanych (login, register)
- **UserOnly**: Przepuszcza tylko zalogowanych (dashboard)
- Automatyczne przekierowania

### 4. Motywy (Theming)

- Wszystkie komponenty UI automatycznie dostosowują się do motywu systemowego
- Paleta kolorów w `constants/Colors.js`
- Wsparcie dla jasnego i ciemnego motywu

## 🎨 Komponenty UI

### Themed Components

Wszystkie komponenty automatycznie dostosowują się do motywu:

- `<ThemedView>` - Kontener z tłem
- `<ThemedText>` - Tekst z kolorem
- `<ThemedButton>` - Przycisk
- `<ThemedTextInput>` - Pole tekstowe
- `<ThemedCard>` - Karta do wyświetlania danych
- `<ThemedLoader>` - Spinner ładowania
- `<ThemedLogo>` - Logo (automatyczny wybór jasne/ciemne)

### Pomocnicze

- `<Spacer>` - Odstęp między elementami

## 🔐 Zasady bezpieczeństwa Firebase

### Firestore Rules (dla produkcji)

Zastąp reguły testowe tymi zasadami w Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Użytkownik może czytać, tworzyć, aktualizować i usuwać tylko swoje trasy
    match /routes/{routeId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 📖 Przykładowe użycie

### Tworzenie nowej trasy

```javascript
import { useRoutes } from '../hooks/useRoutes';

function CreateRoute() {
  const { createRoute } = useRoutes();
  
  const handleSubmit = async () => {
    await createRoute({
      startAdress: "ul. Główna 1",
      startTime: "08:00",
      date: "2024-01-15",
      endAdress: "ul. Końcowa 10",
      endTime: "10:30",
      description: "Trasa do pracy"
    });
  };
}
```

### Pobieranie tras

```javascript
import { useRoutes } from '../hooks/useRoutes';

function RoutesList() {
  const { routes } = useRoutes();
  
  return (
    <FlatList
      data={routes}
      renderItem={({item}) => (
        <View>
          <Text>{item.startAdress} → {item.endAdress}</Text>
        </View>
      )}
    />
  );
}
```

## 🛠️ Rozszerzanie aplikacji

### Dodawanie nowych pól do trasy

1. Dodaj pole w formularzu (`app/(dashboard)/create.jsx`)
2. Zaktualizuj funkcję `createRoute()` w `RoutesContext.jsx`
3. Zaktualizuj wyświetlanie w `history.jsx` i `routes/[id].jsx`

### Dodawanie nowego ekranu

1. Utwórz plik w folderze `app/`
2. Dodaj layout jeśli potrzebny
3. Użyj `useUser()` lub `useRoutes()` do dostępu do danych

### Dodawanie nowej funkcjonalności

1. Dodaj funkcję do odpowiedniego Context (`UserContext` lub `RoutesContext`)
2. Funkcja automatycznie będzie dostępna przez hook (`useUser` lub `useRoutes`)

## 🐛 Rozwiązywanie problemów

### Błąd połączenia z Firebase

- Sprawdź czy konfiguracja Firebase jest poprawna
- Upewnij się że włączyłeś Authentication i Firestore
- Sprawdź połączenie internetowe

### Błędy podczas instalacji

```bash
# Wyczyść cache
npm cache clean --force

# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules
npm install
```

### Aplikacja się nie uruchamia

```bash
# Zresetuj projekt Expo
expo start -c
```

## 📝 Licencja

Projekt open-source, możesz go modyfikować i używać zgodnie z potrzebami.

## 👨‍💻 Autorzy

Aplikacja stworzona jako prosty przykład użycia React Native, Expo Router i Firebase.

## 🤝 Wsparcie

W razie pytań lub problemów:
1. Sprawdź dokumentację Firebase: https://firebase.google.com/docs
2. Sprawdź dokumentację Expo: https://docs.expo.dev
3. Sprawdź dokumentację React Native: https://reactnative.dev

---

**Miłej nauki i kodowania! 🚀**
