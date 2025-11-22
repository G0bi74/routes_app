# ImagePickerWithCrop - Dokumentacja

## Opis

Profesjonalny komponent do robienia zdjęć aparatem lub wybierania z galerii z **manualnym kadrowaniem** prostokątnego obszaru. Zoptymalizowany dla workflow tworzenia tras - zdjęcie na początku i na końcu trasy.

## Jak działa

### Workflow:
1. **Kliknięcie przycisku** → Otwiera się natywny aparat (z przyciskiem do galerii w interfejsie)
2. **Zrobienie/wybór zdjęcia** → Automatycznie przechodzi do ekranu manualnego kadrowania
3. **Ręczne zaznaczenie** → Użytkownik przesuwa i zmienia rozmiar prostokąta palcem
4. **Zatwierdzenie** → Komponent zwraca URI przyciętego zdjęcia przez callback
5. **Zdjęcie gotowe** → URI można zapisać w Firebase wraz z trasą

## Instalacja

Pakiety zostały zainstalowane:
```bash
npx expo install expo-image-picker expo-image-manipulator
```

## Użycie

### Podstawowy przykład

```jsx
import ImagePickerWithCrop from '../components/ImagePickerWithCrop';
import { useState } from 'react';

const MyScreen = () => {
    const [photoUri, setPhotoUri] = useState(null);

    const handlePhotoCaptured = (uri) => {
        console.log('Otrzymano zdjęcie:', uri);
        setPhotoUri(uri);
    };

    return (
        <ImagePickerWithCrop
            onImageCaptured={handlePhotoCaptured}
            buttonText="Zrób zdjęcie startu"
        />
    );
};
```

## Props

| Prop | Typ | Wymagany | Domyślnie | Opis |
|------|-----|----------|-----------|------|
| `onImageCaptured` | `(uri: string) => void` | ✅ Tak | - | Callback wywoływany po przycięciu zdjęcia. Otrzymuje URI przyciętego pliku JPEG |
| `buttonText` | `string` | ❌ Nie | `"Zrób zdjęcie"` | Tekst wyświetlany na przycisku |

## Funkcje manualnego kadrowania

- **Przesuwanie prostokąta** - Dotknij i przeciągnij prostokąt
- **Zmiana rozmiaru** - Użyj białego uchwytu w prawym dolnym rogu
- **Wizualizacja** - Obszar poza zaznaczeniem jest przyciemniony (60%)
- **Siatka pomocnicza** - Linie podziału na 3x3 (reguła trójpodziału)
- **Narożniki** - Białe wskaźniki w rogach prostokąta
- **Konwersja współrzędnych** - Automatyczne przeliczanie wymiarów

## Szczegóły techniczne

### Format wyjściowy
- **Format**: JPEG
- **Kompresja**: 0.8 (80% jakości)
- **Typ**: URI do lokalnego pliku

### Uprawnienia
Komponent automatycznie:
- Sprawdza uprawnienia przed użyciem aparatu/galerii
- Żąda uprawnień jeśli nie zostały przyznane
- Wyświetla przyjazne komunikaty o błędach

## Integracja z Firebase Storage

### 1. Utwórz funkcję upload w lib/firebase.js

```jsx
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadRouteImage(uri, routeId, type) {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const filename = `routes/${routeId}/${type}_${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        return downloadURL;
    } catch (error) {
        console.error('Błąd uploadu:', error);
        throw error;
    }
}
```

### 2. Zaktualizuj RoutesContext.jsx

Dodaj parametry `photoUri` do funkcji GPS:

```jsx
async function startLiveRoute(description, photoUri = null) {
    // ... kod pobierania lokalizacji ...
    
    let startImageUrl = null;
    if (photoUri) {
        startImageUrl = await uploadRouteImage(photoUri, tempRouteId, 'start');
    }
    
    const routeData = {
        // ... inne pola ...
        startImageUrl: startImageUrl,
    };
    
    // ... zapis do Firestore ...
}

async function endLiveRoute(routeId, photoUri = null) {
    // ... kod pobierania lokalizacji ...
    
    let endImageUrl = null;
    if (photoUri) {
        endImageUrl = await uploadRouteImage(photoUri, routeId, 'end');
    }
    
    const updateData = {
        // ... inne pola ...
        endImageUrl: endImageUrl,
    };
    
    // ... aktualizacja Firestore ...
}
```

## Przykładowy workflow

```
Użytkownik klika "Zrób zdjęcie"
    ↓
Otwiera się natywny aparat (z przyciskiem galerii)
    ↓
Użytkownik robi zdjęcie (lub klika galerii)
    ↓
Automatycznie otwiera się modal kadrowania
    ↓
Użytkownik widzi prostokąt (domyślnie 80% obrazu)
    ↓
Przesuwa prostokąt palcem
    ↓
Zmienia rozmiar używając uchwytu
    ↓
Klika "✓ Zatwierdź"
    ↓
Zdjęcie zostaje przycięte (80% jakości JPEG)
    ↓
onImageCaptured(uri) wywoływany z URI
    ↓
URI uploadowane do Firebase Storage
    ↓
URL zapisany w Firestore
```

## Zalety implementacji

✅ **Profesjonalny UX** - Natywny aparat bez dialogu
✅ **Pełna kontrola** - Manualne kadrowanie
✅ **Intuicyjne gesty** - Przesuwanie i zmiana rozmiaru
✅ **Wizualna pomoc** - Siatka, wskaźniki, przyciemnienie
✅ **Dokładne** - Konwersja współrzędnych
✅ **Zoptymalizowane** - 80% jakości JPEG
✅ **Gotowe na Firebase** - URI do uploadu

## Troubleshooting

**Q: Prostokąt nie przesuwa się**
A: Upewnij się że dotykasz wewnątrz prostokąta

**Q: Zdjęcie nieostre po przycięciu**
A: quality=1.0, compress=0.8 to dobre wartości

**Q: URI nie działa z Firebase**
A: Użyj fetch() + blob w uploadRouteImage()

**Q: Chcę zmienić początkowy rozmiar**
A: Edytuj useEffect, linijka `initialWidth = displayWidth * 0.8`

## Następne kroki

1. ✅ Komponent gotowy
2. ✅ Pakiety zainstalowane
3. ✅ Uprawnienia dodane
4. 🔄 Dodaj do create.jsx
5. 🔄 Zaktualizuj RoutesContext
6. 🔄 Dodaj uploadRouteImage()
7. 🔄 Wyświetl zdjęcia w routes/[id].jsx
