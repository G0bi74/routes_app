# OCR Context & Hook

## Opis
Context i hook do rozpoznawania tekstu ze zdjęć przy użyciu OCR.space API.

## Funkcjonalność
- Rozpoznawanie tekstu ze zdjęć
- Wykrywanie liczb (przebieg pojazdu)
- Automatyczne wykrywanie przebiegu z licznika
- Obsługa błędów i stanów ładowania
- **DARMOWE** - OCR.space oferuje darmowy plan

## Konfiguracja

### 1. Klucz API (opcjonalnie)

Domyślnie używany jest darmowy klucz API. Jeśli chcesz użyć własnego:

1. Zarejestruj się na [OCR.space](https://ocr.space/ocrapi)
2. Otrzymasz darmowy klucz API (25,000 żądań/miesiąc)
3. Dodaj do `.env`:
```
EXPO_PUBLIC_OCR_SPACE_API_KEY=twój_klucz_api
```

### 2. Limity darmowego planu

- **25,000 żądań/miesiąc** (darmowy klucz)
- Max rozmiar pliku: 1MB
- Formaty: JPG, PNG, GIF, PDF
- Rate limit: 10 żądań/10 sekund

## Użycie

### Podstawowe użycie

```javascript
import { useOcr } from '../hooks/useOcr';

const MyComponent = () => {
    const { recognizeText, isProcessing } = useOcr();

    const handleImage = async (imageUri) => {
        const result = await recognizeText(imageUri);
        
        if (result.success) {
            console.log('Pełny tekst:', result.fullText);
            console.log('Wykryte liczby:', result.numbers);
            console.log('Przebieg:', result.mileage);
        } else {
            console.error('Błąd:', result.error);
        }
    };

    return (
        <View>
            <Button 
                title={isProcessing ? "Przetwarzanie..." : "Rozpoznaj tekst"}
                onPress={() => handleImage('file://...')}
                disabled={isProcessing}
            />
        </View>
    );
};
```

### Użycie z alertem (do testowania)

```javascript
import { useOcr } from '../hooks/useOcr';

const TestComponent = () => {
    const { recognizeAndShowAlert, isProcessing } = useOcr();

    return (
        <Button 
            title="Test OCR"
            onPress={() => recognizeAndShowAlert('file://path/to/image.jpg')}
            disabled={isProcessing}
        />
    );
};
```

### Integracja z trasami

```javascript
import { useOcr } from '../hooks/useOcr';
import { useRoutes } from '../hooks/useRoutes';

const CreateRoute = () => {
    const { recognizeText } = useOcr();
    const { startLiveRoute } = useRoutes();

    const handleStartRoute = async (imageUri) => {
        // Rozpoznaj przebieg ze zdjęcia
        const ocrResult = await recognizeText(imageUri);
        
        // Rozpocznij trasę z informacją o przebiegu
        await startLiveRoute(
            'Nowa trasa',
            imageUri,
            ocrResult.mileage // Przebieg z licznika
        );
        
        if (ocrResult.mileage) {
            console.log(`Wykryto przebieg startowy: ${ocrResult.mileage} km`);
        }
    };

    return (
        // ... UI
    );
};
```

## Zwracany obiekt

### recognizeText(imageUri)

Zwraca obiekt z następującymi polami:

```javascript
{
    success: boolean,          // Czy rozpoznawanie się powiodło
    fullText: string,          // Pełny rozpoznany tekst
    detectedTexts: string[],   // Tablica pojedynczych słów/fragmentów
    numbers: number[],         // Tablica wykrytych liczb (malejąco)
    mileage: number | null,    // Wykryty przebieg (jeśli znaleziono)
    error?: string            // Komunikat błędu (jeśli wystąpił)
}
```

## Przykłady wyników

### Zdjęcie licznika (100234 km)
```javascript
{
    success: true,
    fullText: "100234\nkm",
    detectedTexts: ["100234", "km"],
    numbers: [100234],
    mileage: 100234
}
```

### Zdjęcie z tablicą rejestracyjną
```javascript
{
    success: true,
    fullText: "LU 12345\nPOLSKA",
    detectedTexts: ["LU", "12345", "POLSKA"],
    numbers: [12345],
    mileage: null  // Liczba poza zakresem przebiegu
}
```

## Heurystyka wykrywania przebiegu

Algorytm szuka największej liczby spełniającej kryteria:
- Minimum: 100 km
- Maximum: 999,999 km
- Liczba całkowita (3-6 cyfr)
- Automatyczne usuwanie spacji między cyframi

## Zalety OCR.space

✅ **Darmowy** - 25,000 żądań/miesiąc
✅ **Prosty** - brak skomplikowanej konfiguracji
✅ **Szybki** - odpowiedź w 1-3 sekundy
✅ **Dokładny** - OCR Engine 2 zoptymalizowany dla liczb
✅ **Polski język** - wsparcie dla języka polskiego
✅ **Bez instalacji** - działa przez HTTP API

## Optymalizacja

### Poprawa jakości rozpoznawania:
1. Dobrej jakości zdjęcia (dobra rozdzielczość)
2. Równomierne oświetlenie
3. Prosty kąt (zdjęcie prostopadle do powierzchni)
4. Unikaj odbić światła na błyszczących powierzchniach
5. Centruj tekst w kadrze
6. Użyj kompresji, aby zmniejszyć rozmiar <1MB

### Kompresja obrazów przed wysłaniem:
```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Zmniejsz do max 1200px szerokości
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
};

// Użycie
const compressedUri = await compressImage(originalUri);
const ocrResult = await recognizeText(compressedUri);
```

### Cache wyników (opcjonalnie):
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCachedOcr = async (imageUri) => {
    const cacheKey = `ocr_${imageUri}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const result = await recognizeText(imageUri);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
};
```

## Bezpieczeństwo

✅ Klucz API można bezpiecznie używać w aplikacji mobilnej
✅ OCR.space ma wbudowaną ochronę przed nadużyciami
✅ Rate limiting chroni przed atakami
⚠️ Mimo to, zaleca się używanie zmiennych środowiskowych

## API Details

### Parametry zapytania:
- `base64Image` - Obraz w formacie Base64
- `language` - `pol` (polski + angielski)
- `OCREngine` - `2` (lepszy dla liczb i tabel)
- `detectOrientation` - `true` (auto-rotacja)
- `scale` - `true` (auto-skalowanie)

### Endpoint:
```
POST https://api.ocr.space/parse/image
Header: apikey: YOUR_API_KEY
```

## Debugging

Włącz logi w konsoli:
```javascript
const result = await recognizeText(imageUri);
console.log('OCR Result:', JSON.stringify(result, null, 2));
```

Test z przykładowym obrazem:
```javascript
// W create.jsx lub innym komponencie
import { useOcr } from '../../hooks/useOcr';

const { recognizeAndShowAlert } = useOcr();

// Test button
<Button 
    title="Test OCR"
    onPress={() => recognizeAndShowAlert(photoUri)}
/>
```

## Rozwiązywanie problemów

### "No text detected"
- Sprawdź jakość zdjęcia
- Upewnij się że jest tekst na zdjęciu
- Spróbuj lepszego oświetlenia
- Zwiększ kontrast

### "Rate limit exceeded"
- Poczekaj 10 sekund
- Użyj własnego klucza API dla wyższego limitu
- Zaimplementuj cache dla powtarzających się obrazów

### "File too large"
- Skompresuj obraz do <1MB
- Zmniejsz rozdzielczość (1200px szerokości wystarcza)

### "Invalid API key"
- Sprawdź czy klucz jest poprawny
- Zweryfikuj na [OCR.space dashboard](https://ocr.space/ocrapi)

## Przydatne linki

- [OCR.space API Documentation](https://ocr.space/ocrapi)
- [Free API Registration](https://ocr.space/ocrapi/freekey)
- [Supported Languages](https://ocr.space/ocrapi#PostParameters)
