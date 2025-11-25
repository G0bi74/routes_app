# Routes App - Dokumentacja Kompletna

## Spis treści
1. [Opis aplikacji](#opis-aplikacji)
2. [Architektura](#architektura)
3. [Główne funkcjonalności](#główne-funkcjonalności)
4. [Workflow użytkownika](#workflow-użytkownika)
5. [Komponenty i struktura](#komponenty-i-struktura)
6. [Integracje zewnętrzne](#integracje-zewnętrzne)
7. [Bezpieczeństwo i przechowywanie danych](#bezpieczeństwo-i-przechowywanie-danych)
8. [Instrukcja konfiguracji](#instrukcja-konfiguracji)

---

## Opis aplikacji

**Routes App** to mobilna aplikacja React Native (Expo) do zarządzania trasami samochodowymi z automatycznym rozpoznawaniem stanu licznika pojazdu (OCR). Aplikacja umożliwia:
- Tworzenie tras ręcznie (podając adresy) lub automatycznie (GPS)
- Robienie zdjęć licznika na początku i końcu trasy
- Automatyczne rozpoznawanie przebiegu z licznika za pomocą OCR
- Obliczanie odległości na podstawie stanów licznika lub GPS
- Generowanie raportów PDF z trasami (tygodniowe/miesięczne)
- Statystyki zużycia paliwa i kosztów

### Główne cechy
- ✅ **OCR licznika** - automatyczne wykrywanie przebiegu ze zdjęć
- ✅ **Tryb GPS na żywo** - rozpocznij trasę teraz, zakończ później
- ✅ **Tryb manualny** - wprowadź adresy ręcznie (np. dla starych tras)
- ✅ **Raporty PDF** - profesjonalne zestawienia z osadzonymi zdjęciami
- ✅ **Statystyki paliwowe** - obliczanie zużycia i kosztów
- ✅ **Własne zdjęcia licznika** - aparat z galerią w jednym miejscu

---

## Architektura

### Stack technologiczny
- **Framework**: React Native (Expo SDK 52)
- **Nawigacja**: Expo Router (file-based routing)
- **Backend**: Firebase (Authentication, Firestore)
- **Geokodowanie**: Nominatim (OpenStreetMap)
- **Routing**: OSRM (Open Source Routing Machine)
- **OCR**: OCR.space API (darmowe, 25k żądań/miesiąc)
- **PDF**: expo-print + expo-sharing
- **Storage**: AsyncStorage (lokalne ustawienia)

### Struktura projektu
```
routes_app/
├── app/                          # Ekrany aplikacji (Expo Router)
│   ├── _layout.jsx              # Root layout z providerami
│   ├── index.jsx                # Strona główna
│   ├── (auth)/                  # Autoryzacja
│   │   ├── login.jsx
│   │   └── register.jsx
│   └── (dashboard)/             # Główna część aplikacji
│       ├── create.jsx           # Tworzenie tras
│       ├── history.jsx          # Lista tras
│       ├── profile.jsx          # Profil + raporty + statystyki paliwa
│       └── routes/[id].jsx      # Szczegóły trasy
├── components/                   # Komponenty wielokrotnego użytku
│   ├── ImagePickerWithCrop.jsx # Custom aparat + galeria + crop
│   ├── Themed*.jsx              # Komponenty obsługujące ciemny motyw
│   └── auth/                    # Komponenty autoryzacji (GuestsOnly, UserOnly)
├── context/                      # React Context API
│   ├── UserContext.jsx          # Autoryzacja użytkownika
│   ├── RoutesContext.jsx        # CRUD tras + GPS
│   └── OcrContext.jsx           # Rozpoznawanie tekstu ze zdjęć
├── hooks/                        # Custom hooks
│   ├── useUser.js
│   ├── useRoutes.js
│   └── useOcr.js
├── lib/                          # Biblioteki pomocnicze
│   ├── firebase.js              # Konfiguracja Firebase
│   ├── geocoding.js             # Zamiana adresów na współrzędne
│   ├── routing.js               # Obliczanie odległości drogowej
│   └── location.js              # Pobieranie lokalizacji GPS
└── constants/
    └── Colors.js                # Kolory dla motywu jasnego/ciemnego
```

---

## Główne funkcjonalności

### 1. Autoryzacja (Firebase Authentication)
- **Rejestracja**: Email + hasło (min. 6 znaków)
- **Logowanie**: Email + hasło
- **Wylogowanie**: Dostępne w profilu
- **Persistencja**: Automatyczne zalogowanie przy powrocie do aplikacji

**Komponenty**:
- `UserContext.jsx` - zarządzanie stanem użytkownika
- `GuestsOnly.jsx` - przekierowanie zalogowanych do dashboard
- `UserOnly.jsx` - przekierowanie niezalogowanych do login

### 2. Tworzenie tras

#### A) Tryb GPS (Live Route)
**Workflow**:
1. Użytkownik klika "📍 Rozpocznij trasę"
2. Otwiera się aparat (ImagePickerWithCrop)
3. Robi zdjęcie licznika (np. 125450 km)
4. OCR rozpoznaje stan licznika początkowy
5. GPS pobiera lokalizację i zamienia na adres
6. Trasa zapisuje się ze statusem `in-progress`
7. Później: "✓ Zakończ trasę" → zdjęcie końca + OCR + GPS
8. Obliczenie odległości: `endMileage - startMileage`
9. Trasa zapisuje się ze statusem `completed`

**Dane zapisywane**:
```javascript
{
  startAddress: "ul. Przykładowa 1, Warszawa, PL",
  endAddress: "ul. Docelowa 10, Kraków, PL",
  startCoordinates: { lat: 52.2297, lon: 21.0122 },
  endCoordinates: { lat: 50.0647, lon: 19.9450 },
  distance: 292.5,                    // km (z licznika lub GPS)
  distanceMeters: 292500,
  duration: 210,                      // minuty (szacowane)
  startImageUri: "file://...",        // Lokalne zdjęcie
  endImageUri: "file://...",
  startMileage: 125450,               // OCR z początku
  endMileage: 125742,                 // OCR z końca
  mileageDistance: 292,               // Różnica liczników
  status: "completed",
  userId: "firebase_uid",
  createdAt: Timestamp,
  startedAt: Timestamp,
  completedAt: Timestamp
}
```

**Funkcje**:
- `startLiveRoute(photoUri, mileageOcr)` - rozpoczyna trasę
- `endLiveRoute(routeId, photoUri, mileageOcr)` - kończy trasę

#### B) Tryb manualny
**Workflow**:
1. Użytkownik klika "Utwórz ręcznie"
2. Wprowadza adresy początku i końca
3. Opcjonalnie: data i godziny (dla starych tras)
4. Geokodowanie obu adresów (Nominatim)
5. Obliczenie odległości drogowej (OSRM)
6. Zapis do Firestore

**Funkcje**:
- `geocodeBothAddresses(start, end)` - zamiana adresów na współrzędne
- `getRouteInfo(startCoords, endCoords)` - obliczanie odległości
- `createRoute(data)` - zapis trasy

### 3. OCR - Rozpoznawanie licznika

**Wykorzystanie**: OCR.space API
- **Darmowy limit**: 25,000 żądań/miesiąc
- **Silnik**: OCR Engine 2 (zoptymalizowany dla liczb)
- **Język**: Polski (pol)

**Proces**:
1. Konwersja zdjęcia do Base64
2. Wysłanie do `https://api.ocr.space/parse/image`
3. Parsowanie odpowiedzi i wyciągnięcie liczb
4. Heurystyka: szukanie największej liczby w zakresie 100-999999 km
5. Zwrot wyniku: `{ success, fullText, numbers, mileage }`

**Funkcje**:
- `recognizeText(imageUri)` - rozpoznaje tekst ze zdjęcia
- `extractNumbers(text)` - wyciąga wszystkie liczby
- `detectMileage(text, numbers)` - wykrywa przebieg

**Przykład użycia**:
```javascript
const { recognizeText } = useOcr();
const result = await recognizeText(photoUri);

if (result.success && result.mileage) {
  console.log(`Przebieg: ${result.mileage} km`);
}
```

### 4. Historia tras

**Funkcjonalność**:
- Lista wszystkich tras użytkownika
- Sortowanie chronologiczne (najnowsze pierwsze)
- Badge "W TRAKCIE" dla tras GPS nie zakończonych
- Skrócone adresy (pierwsze 2 części)
- Formatowana data i odległość
- Kliknięcie → szczegóły trasy

**Komponenty**:
- `history.jsx` - lista tras
- `routes/[id].jsx` - szczegóły pojedynczej trasy

### 5. Szczegóły trasy

**Wyświetlane informacje**:
- Punkt początkowy i końcowy (adresy)
- Odległość (z licznika lub GPS)
- Stan licznika początkowy i końcowy
- Różnica przebiegów (jeśli dostępne)
- Przewidywany czas jazdy
- Data, godzina rozpoczęcia i zakończenia
- Zdjęcia licznika (początek i koniec)

**Akcje**:
- Zakończenie trasy (dla tras `in-progress`)
- Usunięcie trasy

### 6. Profil użytkownika

**Sekcje**:

#### A) Statystyki ogólne
- Liczba zakończonych tras
- Łączna przejechana odległość

#### B) Parametry paliwa (zapisywane w AsyncStorage)
- Średnie spalanie (l/100km)
- Cena paliwa (zł/litr)

**Obliczenia**:
```javascript
totalFuelLiters = (totalKm / 100) * consumption
totalFuelCost = totalFuelLiters * price
```

#### C) Raporty PDF

**Typy raportów**:
- Tygodniowy (ostatnie 7 dni)
- Miesięczny (ostatnie 30 dni)

**Zawartość raportu**:
- Tabela tras z:
  - Lp., Data
  - Trasa (skrócone adresy)
  - Godziny rozpoczęcia/zakończenia
  - Odległość (km)
  - Zdjęcia licznika (Base64, osadzone w PDF)
- Podsumowanie:
  - Liczba tras
  - Łączna odległość
- Statystyki paliwowe (jeśli parametry wypełnione):
  - Średnie spalanie i cena
  - Zużycie paliwa (litry)
  - Koszt paliwa (zł)

**Proces generowania**:
1. Filtrowanie tras po zakresie dat
2. Konwersja zdjęć do Base64
3. Generowanie HTML z osadzonymi obrazami
4. `expo-print.printToFileAsync(html)` → PDF
5. `expo-sharing.shareAsync(uri)` → zapisanie/udostępnienie

**Funkcje**:
- `generateReportHTML(routes, title, dateRange, fuelConsumption, fuelPrice)`
- `generateReport(type)` - 'week' lub 'month'

### 7. Aparat z galerią (ImagePickerWithCrop)

**Komponenty**:
- `ImagePickerWithCrop.jsx` - custom aparat + modal do kadrowania

**Funkcjonalność**:
- **Aparat**: CameraView z kontrolkami na dole
- **Galeria**: Przycisk 4-kwadratowa siatka (lewy dolny róg)
- **Crop**: Manualne kadrowanie (przeciąganie i zmiana rozmiaru)
- **Kompresja**: JPEG 0.8

**UI**:
- Przycisk X (zamknij) - lewy górny róg
- Ikona galerii (4 kwadraty) - lewy dolny róg
- Przycisk spustu (biały krąg) - środek dołu

---

## Workflow użytkownika

### Scenariusz 1: Nowa trasa GPS
```
1. Użytkownik otwiera zakładkę "Utwórz"
2. Klika "📍 Rozpocznij trasę"
3. Aparat się otwiera
4. Robi zdjęcie licznika pokazującego 125450 km
5. OCR wykrywa: "Stan licznika: 125450 km"
6. Alert: "Trasa rozpoczęta! Stan licznika: 125450 km"
7. Użytkownik jedzie...
8. W dowolnym momencie klika "✓ Zakończ trasę"
9. Robi zdjęcie licznika pokazującego 125742 km
10. OCR wykrywa: "Stan licznika: 125742 km"
11. Alert: "Trasa zakończona! Przejechano: 292 km"
12. Przekierowanie do historii
```

### Scenariusz 2: Stara trasa (ręczna)
```
1. Użytkownik otwiera "Utwórz"
2. Klika "Utwórz ręcznie"
3. Wpisuje:
   - Start: "Warszawa, ul. Marszałkowska 1"
   - Koniec: "Kraków, Rynek Główny 1"
   - Data: "20.11.2025"
   - Godzina start: "08:00"
   - Godzina koniec: "11:30"
4. Klika "Utwórz trasę"
5. Geokodowanie + obliczanie odległości
6. Trasa zapisana, przekierowanie do historii
```

### Scenariusz 3: Raport PDF
```
1. Użytkownik otwiera zakładkę "Profil"
2. Wpisuje:
   - Średnie spalanie: 7.5 l/100km
   - Cena paliwa: 6.50 zł/l
3. Przewija do sekcji "Raporty PDF"
4. Klika "Generuj" przy "Raport Miesięczny"
5. System:
   - Filtruje trasy (ostatnie 30 dni)
   - Konwertuje zdjęcia do Base64
   - Generuje HTML z osadzonymi obrazami
   - Tworzy PDF
6. Dialog "Zapisz" pojawia się
7. Użytkownik zapisuje PDF w telefonie
```

---

## Komponenty i struktura

### Contexty

#### UserContext
**Odpowiedzialność**: Autoryzacja użytkownika

**Stan**:
- `user` - obiekt użytkownika Firebase
- `loading` - stan ładowania

**Funkcje**:
- `login(email, password)` - logowanie
- `register(email, password)` - rejestracja
- `logout()` - wylogowanie

#### RoutesContext
**Odpowiedzialność**: Zarządzanie trasami

**Stan**:
- `routes` - tablica wszystkich tras użytkownika (real-time)

**Funkcje**:
- `fetchRouteById(id)` - pobiera pojedynczą trasę
- `createRoute(data)` - tworzy trasę ręcznie
- `startLiveRoute(photoUri, mileageOcr)` - rozpoczyna trasę GPS
- `endLiveRoute(routeId, photoUri, mileageOcr)` - kończy trasę GPS
- `deleteRoute(id)` - usuwa trasę

**Real-time listener**: Automatycznie aktualizuje `routes` przy zmianach w Firestore

#### OcrContext
**Odpowiedzialność**: Rozpoznawanie tekstu ze zdjęć

**Stan**:
- `isProcessing` - czy trwa rozpoznawanie

**Funkcje**:
- `recognizeText(imageUri)` - główna funkcja OCR
- `recognizeAndShowAlert(imageUri)` - do testowania

### Komponenty UI

#### Themed Components
Komponenty obsługujące jasny/ciemny motyw:
- `ThemedView` - View z tłem
- `ThemedText` - Text z kolorem tekstu
- `ThemedCard` - Karta z cieniem
- `ThemedButton` - Przycisk
- `ThemedTextInput` - Input
- `ThemedLoader` - Spinner ładowania
- `ThemedLogo` - Logo aplikacji

**Użycie**:
```javascript
import ThemedText from '../../components/ThemedText';

<ThemedText title={true}>Nagłówek</ThemedText>
<ThemedText style={styles.label}>Tekst</ThemedText>
```

#### ImagePickerWithCrop
**Funkcjonalność**:
- Custom modal z aparatem
- Przycisk galerii w rogu
- Manual crop po zrobieniu zdjęcia
- Callback z URI skadrowanego obrazu

**Props**:
- `onImageSelected(uri)` - callback po wybraniu zdjęcia
- `buttonText` - tekst przycisku otwierającego aparat

**Użycie**:
```javascript
<ImagePickerWithCrop 
  onImageSelected={(uri) => handleStartLiveRoute(uri)}
  buttonText="📍 Rozpocznij trasę"
/>
```

### Biblioteki pomocnicze

#### lib/firebase.js
```javascript
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

#### lib/geocoding.js
**Funkcje**:
- `geocode(address)` - adres → współrzędne
- `reverseGeocode(lat, lon)` - współrzędne → adres
- `geocodeBothAddresses(start, end)` - geocode dwóch adresów naraz

**API**: Nominatim (OpenStreetMap)

#### lib/routing.js
**Funkcje**:
- `getRouteInfo(startCoords, endCoords)` - oblicza odległość drogową

**API**: OSRM (Open Source Routing Machine)

**Zwraca**:
```javascript
{
  distance: 292.5,        // km
  distanceMeters: 292500, // metry
  duration: 210           // minuty
}
```

#### lib/location.js
**Funkcje**:
- `getCurrentLocation()` - pobiera aktualną lokalizację GPS

**Wymaga**: Pozwolenia `Location.requestForegroundPermissionsAsync()`

---

## Integracje zewnętrzne

### 1. Firebase

#### Authentication
- Email/Password provider
- Persistencja sesji
- Auto-login

#### Firestore
**Kolekcja**: `routes`

**Struktura dokumentu**:
```javascript
{
  // Adresy
  startAddress: string,
  endAddress: string,
  startAddressFormatted: string,
  endAddressFormatted: string,
  
  // Współrzędne
  startCoordinates: { lat: number, lon: number },
  endCoordinates: { lat: number, lon: number },
  
  // Odległość
  distance: number,           // km
  distanceMeters: number,
  duration: number,           // minuty
  
  // Zdjęcia
  startImageUri: string | null,
  endImageUri: string | null,
  
  // OCR - stan licznika
  startMileage: number | null,
  endMileage: number | null,
  mileageDistance: number | null,
  
  // Status
  status: "in-progress" | "completed",
  
  // Metadane
  userId: string,
  createdAt: Timestamp,
  startedAt: Timestamp | null,
  completedAt: Timestamp | null
}
```

**Reguły bezpieczeństwa**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /routes/{routeId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 2. Nominatim (Geokodowanie)

**Endpoint**: `https://nominatim.openstreetmap.org/`

**Rate limit**: 1 żądanie/sekundę

**Użycie**:
- Zamiana adresu na współrzędne (geocoding)
- Zamiana współrzędnych na adres (reverse geocoding)

### 3. OSRM (Routing)

**Endpoint**: `http://router.project-osrm.org/`

**Użycie**: Obliczanie odległości drogowej między dwoma punktami

### 4. OCR.space

**Endpoint**: `https://api.ocr.space/parse/image`

**Klucz API**: Darmowy lub własny (w `.env`)

**Limity**:
- 25,000 żądań/miesiąc (darmowy)
- Max rozmiar: 1MB
- Rate limit: 10 żądań/10 sekund

**Parametry**:
- `language: 'pol'` - język polski
- `OCREngine: 2` - lepszy dla liczb
- `detectOrientation: true` - auto-rotacja
- `scale: true` - auto-skalowanie

---

## Bezpieczeństwo i przechowywanie danych

### Dane lokalne (AsyncStorage)
- `fuelConsumption` - średnie spalanie
- `fuelPrice` - cena paliwa

### Dane w Firebase
- Trasy użytkownika (Firestore)
- Reguły: każdy użytkownik widzi tylko swoje trasy

### Zdjęcia
- Przechowywane lokalnie jako URI (`file://...`)
- **Uwaga**: Zdjęcia mogą zostać usunięte przy czyszczeniu cache aplikacji
- Opcjonalne: integracja z Firebase Storage (zakomentowana w kodzie)

### Klucze API
**Plik `.env`**:
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_OCR_SPACE_API_KEY=K87899142388957
```

**⚠️ Bezpieczeństwo**:
- `.env` dodany do `.gitignore`
- Nigdy nie commitować kluczy API
- W produkcji: używać Firebase Functions jako proxy dla OCR

---

## Instrukcja konfiguracji

### 1. Wymagania
- Node.js 18+
- npm lub yarn
- Expo CLI: `npm install -g expo-cli`
- Konto Firebase
- (Opcjonalnie) Konto OCR.space dla własnego klucza API

### 2. Instalacja

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd routes_app

# Instalacja zależności
npm install

# Skopiowanie pliku .env
cp .env.example .env
```

### 3. Konfiguracja Firebase

1. Utwórz projekt w [Firebase Console](https://console.firebase.google.com/)
2. Włącz Authentication → Email/Password
3. Utwórz bazę Firestore
4. Skopiuj dane konfiguracyjne do `.env`
5. Wdróż reguły bezpieczeństwa:

```bash
firebase deploy --only firestore:rules
```

### 4. Uruchomienie

```bash
# Development
npm start

# Android
npm run android

# iOS
npm run ios
```

### 5. Build produkcyjny

```bash
# Android APK
eas build --platform android --profile preview

# Android AAB (Google Play)
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## Znane ograniczenia

1. **Zdjęcia przechowywane lokalnie** - mogą zostać usunięte przy czyszczeniu cache
2. **OCR nie jest 100% dokładny** - zależy od jakości zdjęcia i oświetlenia
3. **Rate limity**:
   - Nominatim: 1 żądanie/sekundę
   - OCR.space: 10 żądań/10 sekund (darmowy)
4. **Brak offline mode** - wymaga internetu do geokodowania i OCR
5. **Brak backupu zdjęć** - brak automatycznej synchronizacji do chmury

---

## Możliwe rozszerzenia

### Krótkoterminowe
- [ ] Eksport tras do Excel/CSV
- [ ] Filtrowanie tras po dacie
- [ ] Wyszukiwanie tras po adresie
- [ ] Edycja tras (zmiana adresów, daty)
- [ ] Tryb ciemny wymuszony (niezależnie od systemu)

### Średnioterminowe
- [ ] Firebase Storage dla zdjęć (backup w chmurze)
- [ ] Współdzielenie tras z innymi użytkownikami
- [ ] Wykresy statystyk (wykres liniowy km/miesiąc)
- [ ] Notifications dla tras w trakcie
- [ ] Import tras z pliku

### Długoterminowe
- [ ] Offline mode (lokalny cache tras)
- [ ] Synchronizacja między urządzeniami
- [ ] Integracja z Google Maps
- [ ] Rozpoznawanie tablic rejestracyjnych
- [ ] AI - automatyczna kategoryzacja tras (służbowe/prywatne)
- [ ] Multi-tenant (firmy z wieloma kierowcami)

---

## Wsparcie i kontakt

- **Dokumentacja techniczna**: `ARCHITEKTURA.md`
- **Quick start**: `QUICKSTART.md`
- **OCR guide**: `lib/README_OCR.md`
- **Firebase issues**: `FIREBASE_PERMISSIONS_FIX.md`
- **GPS guide**: `GPS_FEATURE_GUIDE.md`

---

**Wersja dokumentacji**: 2.0  
**Data aktualizacji**: 25 listopada 2025  
**Kompatybilność**: Expo SDK 52, React Native 0.76
