# Biblioteka Serwisów Aplikacji

Ten folder zawiera moduły odpowiedzialne za różne funkcjonalności aplikacji.

## 📂 Struktura

### `firebase.js`
Konfiguracja Firebase i eksport modułów:
- `auth` - Uwierzytelnianie użytkowników
- `db` - Baza danych Firestore

### `geocoding.js`
Serwis geokodowania - zamiana adresów na współrzędne i vice versa:

**Funkcje:**
- `geocodeAddress(address)` - Zamienia adres tekstowy na współrzędne GPS
- `reverseGeocode(lat, lon)` - Zamienia współrzędne GPS na adres (nowa funkcja!)
- `geocodeBothAddresses(startAddress, endAddress)` - Geokoduje dwa adresy równolegle
- `validateApiKey()` - Sprawdza poprawność klucza API

**Przykład użycia:**
```javascript
import { geocodeAddress, reverseGeocode } from '../lib/geocoding';

// Adres -> Współrzędne
const coords = await geocodeAddress('Warszawa, Marszałkowska 1');
// { lat: 52.2297, lon: 21.0122, displayName: "..." }

// Współrzędne -> Adres
const address = await reverseGeocode(52.2297, 21.0122);
// { displayName: "Marszałkowska 1, Warszawa...", street: "...", city: "..." }
```

### `routing.js`
Serwis obliczania tras - odległości drogowe między punktami:

**Funkcje:**
- `calculateRouteDistance(startCoords, endCoords, profile)` - Oblicza odległość drogową
- `getRouteInfo(startCoords, endCoords)` - Pobiera pełne informacje o trasie
- `formatDistance(kilometers)` - Formatuje odległość do wyświetlenia
- `formatDuration(minutes)` - Formatuje czas podróży

**Przykład użycia:**
```javascript
import { getRouteInfo, formatDistance } from '../lib/routing';

const routeInfo = await getRouteInfo(
  { lat: 52.2297, lon: 21.0122 },
  { lat: 50.0647, lon: 19.9450 }
);
// { distance: 292.5, duration: 195, ... }

const formatted = formatDistance(292.5); // "292.50 km"
```

### `location.js` 🆕
Serwis lokalizacji GPS - pobieranie pozycji z urządzenia:

**Funkcje:**
- `getCurrentLocation(options)` - Pobiera aktualną lokalizację GPS urządzenia
- `requestLocationPermissions()` - Żąda uprawnień do lokalizacji
- `watchLocation(callback, options)` - Monitoruje lokalizację w czasie rzeczywistym
- `isLocationEnabled()` - Sprawdza czy GPS jest włączony
- `getLocationPermissionStatus()` - Sprawdza status uprawnień
- `formatCoordinates(lat, lon)` - Formatuje współrzędne do wyświetlenia
- `calculateStraightDistance(point1, point2)` - Oblicza odległość w linii prostej

**Przykład użycia:**
```javascript
import { getCurrentLocation, watchLocation } from '../lib/location';

// Pojedyncze pobranie lokalizacji
const location = await getCurrentLocation();
// { lat: 52.2297, lon: 21.0122, accuracy: 15, ... }

// Monitorowanie lokalizacji
const subscription = await watchLocation((location) => {
  console.log('Nowa pozycja:', location.lat, location.lon);
}, { 
  accuracy: 'high',
  distanceInterval: 10  // Aktualizuj co 10m
});

// Zatrzymanie monitorowania
subscription.remove();
```

**Opcje dokładności:**
- `'low'` - Niska dokładność (szybsze, mniej baterii)
- `'balanced'` - Zrównoważona (domyślna)
- `'high'` - Wysoka dokładność
- `'highest'` - Najwyższa możliwa
- `'best'` - Najlepsza dla nawigacji

## 🔄 Flow tworzenia trasy z GPS

### 1. Tryb GPS - Trasa na żywo

```javascript
import { startLiveRoute, endLiveRoute } from '../context/RoutesContext';

// KROK 1: Rozpoczęcie trasy
const routeId = await startLiveRoute("Podróż do pracy");
// - Pobiera lokalizację GPS
// - Zamienia na adres (reverse geocoding)
// - Zapisuje w bazie ze statusem "in-progress"
// - Zwraca ID trasy

// KROK 2: Użytkownik przemieszcza się...

// KROK 3: Zakończenie trasy
await endLiveRoute(routeId);
// - Pobiera końcową lokalizację GPS
// - Zamienia na adres
// - Oblicza odległość drogową
// - Aktualizuje trasę ze statusem "completed"
```

### 2. Tryb manualny - Wpisywanie adresów

```javascript
import { createRoute } from '../context/RoutesContext';

await createRoute({
  startAddress: "Warszawa, Marszałkowska 1",
  endAddress: "Kraków, Rynek Główny",
  description: "Wyjazd służbowy"
});
// - Geokoduje oba adresy
// - Oblicza odległość
// - Zapisuje kompletną trasę
```

## 📱 Wymagane uprawnienia

### Android (`app.json`)
```json
{
  "android": {
    "permissions": [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION"
    ]
  }
}
```

### iOS (`app.json`)
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Aplikacja potrzebuje dostępu do lokalizacji aby zapisywać trasy.",
      "NSLocationAlwaysUsageDescription": "Aplikacja potrzebuje dostępu do lokalizacji w tle."
    }
  }
}
```

## 🗄️ Struktura danych trasy w Firestore

### Trasa manualna (completed)
```javascript
{
  startAddress: "Warszawa, Marszałkowska 1",
  endAddress: "Kraków, Rynek Główny",
  startAddressFormatted: "Marszałkowska 1, 00-624 Warszawa, Polska",
  endAddressFormatted: "Rynek Główny 1, 31-042 Kraków, Polska",
  startCoordinates: { lat: 52.2297, lon: 21.0122 },
  endCoordinates: { lat: 50.0647, lon: 19.9450 },
  distance: 292.5,
  distanceMeters: 292500,
  duration: 195,
  description: "Wyjazd służbowy",
  userId: "uid123",
  createdAt: Timestamp,
  status: "completed"  // może nie być dla starszych tras
}
```

### Trasa GPS (in-progress)
```javascript
{
  startAddress: "Marszałkowska 1, Warszawa",
  startAddressFormatted: "Marszałkowska 1, 00-624 Warszawa, Polska",
  startCoordinates: { lat: 52.2297, lon: 21.0122 },
  description: "Podróż do pracy",
  status: "in-progress",
  userId: "uid123",
  startedAt: Timestamp,
  createdAt: Timestamp,
  // Pola poniżej będą null do czasu zakończenia:
  endAddress: null,
  endAddressFormatted: null,
  endCoordinates: null,
  distance: null,
  distanceMeters: null,
  duration: null,
  completedAt: null
}
```

### Trasa GPS (completed)
```javascript
{
  // Dane początku (jak wyżej) +
  endAddress: "Rynek Główny, Kraków",
  endAddressFormatted: "Rynek Główny 1, 31-042 Kraków, Polska",
  endCoordinates: { lat: 50.0647, lon: 19.9450 },
  distance: 292.5,
  distanceMeters: 292500,
  duration: 195,
  status: "completed",
  completedAt: Timestamp
}
```

## 🔧 API Keys

Projekt używa **OpenRouteService API** dla:
- Geocoding (adres ↔ współrzędne)
- Routing (obliczanie odległości)

Klucz API znajduje się w plikach `geocoding.js` i `routing.js`.

**Limity darmowego planu:**
- 2000 requestów / dzień
- 40 requestów / minutę

Zarejestruj własny klucz: https://openrouteservice.org/dev/#/signup

## 🚀 Instalacja zależności

```bash
npm install expo-location
```

## 📝 Dobre praktyki

1. **Zawsze sprawdzaj uprawnienia** przed użyciem GPS
2. **Obsługuj błędy** - użytkownik może odmówić dostępu
3. **Informuj użytkownika** o czasie oczekiwania na GPS
4. **Używaj odpowiedniej dokładności** - wyższa = dłużej + więcej baterii
5. **Pamiętaj o timeoutach** - GPS może nie być dostępny
6. **Testuj na prawdziwym urządzeniu** - emulator ma ograniczoną funkcjonalność GPS

## 🐛 Debugowanie

### GPS nie działa?
```javascript
import { isLocationEnabled, getLocationPermissionStatus } from '../lib/location';

// Sprawdź czy GPS jest włączony
const enabled = await isLocationEnabled();
console.log('GPS włączony:', enabled);

// Sprawdź uprawnienia
const status = await getLocationPermissionStatus();
console.log('Status uprawnień:', status); // 'granted', 'denied', 'undetermined'
```

### Błędy geokodowania?
- Sprawdź połączenie internetowe
- Upewnij się że klucz API jest ważny
- Sprawdź limity API (2000/dzień)

### Błędy routingu?
- Punkty muszą być połączone drogami
- Sprawdź czy współrzędne są poprawne
- Niektóre lokalizacje mogą nie mieć tras samochodowych
