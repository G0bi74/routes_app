# 🚀 Nowa funkcjonalność: Trasy GPS na żywo

## 📍 Przegląd

Aplikacja została rozszerzona o możliwość automatycznego tworzenia tras przy użyciu GPS telefonu. Zamiast ręcznego wpisywania adresów, możesz teraz:

1. **Rozpocząć trasę** - aplikacja zapisze Twoją aktualną lokalizację GPS
2. **Podróżować** - aplikacja czeka aż dotrzesz do celu
3. **Zakończyć trasę** - aplikacja automatycznie obliczy odległość i czas

## 🎯 Jak używać

### Tryb 1: GPS - Trasa na żywo

1. Przejdź do zakładki **"Utwórz"**
2. W sekcji **"📍 Tryb GPS - Trasa na żywo"**:
   - (Opcjonalnie) Wpisz opis trasy
   - Kliknij **"📍 Rozpocznij trasę GPS"**
3. Aplikacja poprosi o uprawnienia do lokalizacji (akceptuj)
4. Aplikacja pobierze Twoją lokalizację i zapisze jako punkt startowy
5. Trasa zostanie zapisana ze statusem **"W TRAKCIE"**
6. Podróżuj do swojego celu
7. Gdy dotrzesz na miejsce:
   - Przejdź do **"Historia"**
   - Znajdź trasę z czerwonym badge'm **"🔴 W TRAKCIE"**
   - Kliknij na nią
   - Kliknij **"✓ Zakończ trasę GPS"**
8. Aplikacja automatycznie:
   - Pobierze Twoją końcową lokalizację
   - Obliczy odległość drogową
   - Zapisze kompletną trasę

### Tryb 2: Manualny - Wpisywanie adresów

(Bez zmian - działa jak wcześniej)

1. Przejdź do zakładki **"Utwórz"**
2. W sekcji **"✏️ Tryb manualny - Wpisz adresy"**:
   - Wpisz adres początku
   - Wpisz adres końca
   - Kliknij **"Utwórz trasę"**

## 🗂️ Struktura projektu

### Nowe pliki

```
lib/
  └── location.js          # Serwis GPS - pobieranie lokalizacji
  └── README.md            # Dokumentacja serwisów

components/
  └── LiveRouteBadge.jsx   # Badge dla tras w trakcie
```

### Zmodyfikowane pliki

```
lib/
  └── geocoding.js         # + reverseGeocode() - współrzędne → adres

context/
  └── RoutesContext.jsx    # + startLiveRoute(), endLiveRoute()

app/(dashboard)/
  ├── create.jsx           # + UI dla GPS
  ├── history.jsx          # + wyświetlanie tras w trakcie
  └── routes/[id].jsx      # + zakończenie trasy GPS

app.json                   # + uprawnienia lokalizacji
package.json               # + expo-location
```

## 📦 Nowe zależności

- **expo-location** - Pobieranie lokalizacji GPS z urządzenia

## 🔑 Kluczowe funkcje

### `lib/location.js`

| Funkcja | Opis |
|---------|------|
| `getCurrentLocation()` | Pobiera aktualną pozycję GPS |
| `requestLocationPermissions()` | Prosi o uprawnienia |
| `watchLocation()` | Monitoruje lokalizację w czasie rzeczywistym |
| `isLocationEnabled()` | Sprawdza czy GPS włączony |
| `formatCoordinates()` | Formatuje współrzędne |
| `calculateStraightDistance()` | Odległość w linii prostej |

### `lib/geocoding.js`

| Funkcja | Opis |
|---------|------|
| `reverseGeocode()` | **NOWA** - Zamienia GPS na adres |

### `context/RoutesContext.jsx`

| Funkcja | Opis |
|---------|------|
| `startLiveRoute()` | **NOWA** - Rozpoczyna trasę GPS |
| `endLiveRoute()` | **NOWA** - Kończy trasę GPS |

## 🗄️ Struktura danych

### Trasa w trakcie (status: "in-progress")

```javascript
{
  startAddress: "Marszałkowska 1, Warszawa",
  startCoordinates: { lat: 52.2297, lon: 21.0122 },
  status: "in-progress",
  startedAt: Timestamp,
  // Pola poniżej = null:
  endAddress: null,
  endCoordinates: null,
  distance: null,
  duration: null
}
```

### Trasa zakończona (status: "completed")

```javascript
{
  startAddress: "Marszałkowska 1, Warszawa",
  startCoordinates: { lat: 52.2297, lon: 21.0122 },
  endAddress: "Rynek Główny, Kraków",
  endCoordinates: { lat: 50.0647, lon: 19.9450 },
  distance: 292.5,
  duration: 195,
  status: "completed",
  completedAt: Timestamp
}
```

## ⚙️ Konfiguracja uprawnień

### Android

Automatycznie dodane w `app.json`:
```json
"android": {
  "permissions": [
    "ACCESS_COARSE_LOCATION",
    "ACCESS_FINE_LOCATION",
    "FOREGROUND_SERVICE"
  ]
}
```

### iOS

Automatycznie dodane w `app.json`:
```json
"ios": {
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "...",
    "NSLocationAlwaysAndWhenInUseUsageDescription": "..."
  }
}
```

## 🎨 UI/UX

### Nowe elementy interfejsu

1. **Sekcja GPS** w ekranie tworzenia
   - Przycisk "📍 Rozpocznij trasę GPS" (zielony)
   - Przycisk "✓ Zakończ trasę GPS" (niebieski)

2. **Badge "🔴 W TRAKCIE"**
   - Wyświetlany na trasach w historii
   - Pokazuje że trasa wymaga zakończenia

3. **Separator "LUB"**
   - Wizualnie oddziela tryb GPS od manualnego

4. **Ostrzeżenie**
   - Żółte tło w szczegółach trasy w trakcie
   - Informuje o konieczności zakończenia

## 📱 Testowanie

### Na prawdziwym urządzeniu

```bash
# Android
npm run android

# iOS
npm run ios
```

### Symulator/Emulator

⚠️ **Uwaga**: GPS może nie działać poprawnie w symulatorze
- Android Emulator: Można ustawić fałszywą lokalizację
- iOS Simulator: Można symulować lokalizację

## 🐛 Rozwiązywanie problemów

### GPS nie działa

1. Sprawdź czy GPS jest włączony w telefonie
2. Sprawdź czy aplikacja ma uprawnienia
3. Wyjdź na zewnątrz (lepszy sygnał)

### Błąd "Brak uprawnień"

1. Otwórz ustawienia telefonu
2. Znajdź aplikację Routes App
3. Włącz uprawnienia do lokalizacji

### Niska dokładność

- GPS potrzebuje czasu na ustalenie pozycji
- Najlepsza dokładność na zewnątrz
- W budynkach dokładność może być niska

## 📊 Flow danych

```
1. Rozpoczęcie trasy
   └─> getCurrentLocation()
       └─> reverseGeocode()
           └─> Firestore (status: in-progress)

2. Zakończenie trasy
   └─> getCurrentLocation()
       └─> reverseGeocode()
           └─> getRouteInfo()
               └─> Firestore (status: completed)
```

## 🔒 Bezpieczeństwo

- Lokalizacja pobierana tylko gdy użytkownik aktywnie używa funkcji
- Brak monitorowania w tle
- Dane GPS przechowywane tylko w Firestore (zabezpieczona)
- Uprawnienia żądane dynamicznie (nie przy starcie aplikacji)

## 🚀 Możliwe rozszerzenia (przyszłość)

1. **Śledzenie w czasie rzeczywistym**
   - Zapis całej trasy (nie tylko start/koniec)
   - Mapa z przebytą drogą

2. **Statystyki**
   - Łączna przebyta odległość
   - Średnia prędkość
   - Wykres tras

3. **Powiadomienia**
   - Przypomnienie o zakończeniu trasy
   - Statystyki tygodniowe

4. **Eksport danych**
   - GPX/KML format
   - Udostępnianie tras

## 📚 Dokumentacja API

- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [OpenRouteService Geocoding](https://openrouteservice.org/dev/#/api-docs/geocode)
- [OpenRouteService Directions](https://openrouteservice.org/dev/#/api-docs/v2/directions)

## ✅ Checklist implementacji

- [x] Utworzenie `lib/location.js`
- [x] Dodanie `reverseGeocode()` do `lib/geocoding.js`
- [x] Rozszerzenie `RoutesContext` o `startLiveRoute()` i `endLiveRoute()`
- [x] Instalacja `expo-location`
- [x] Aktualizacja UI w `create.jsx`
- [x] Aktualizacja `history.jsx` dla tras w trakcie
- [x] Aktualizacja `routes/[id].jsx` dla zakończenia tras
- [x] Dodanie uprawnień w `app.json`
- [x] Utworzenie `LiveRouteBadge` komponentu
- [x] Dokumentacja w `lib/README.md`
- [x] Przewodnik użytkownika

## 🎉 Gotowe do użycia!

Projekt jest w pełni funkcjonalny i gotowy do testowania. Zachowana modularność i dobre praktyki z całego projektu.
