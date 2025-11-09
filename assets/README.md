# 🎨 Zasoby graficzne (Assets)

## Brakujące pliki

Aplikacja wymaga następujących plików graficznych w folderze `assets/img/`:

### Logo aplikacji

1. **logo_dark.png** - Logo dla ciemnego motywu (jasne kolory)
2. **logo_light.png** - Logo dla jasnego motywu (ciemne kolory)

### Ikony aplikacji (wymagane przez Expo)

3. **icon.png** - Ikona aplikacji (1024x1024 px)
4. **adaptive-icon.png** - Ikona adaptacyjna dla Androida (1024x1024 px)
5. **splash.png** - Ekran powitalny (1284x2778 px)
6. **favicon.png** - Favicon dla wersji webowej (48x48 px)

## Jak dodać pliki?

### Opcja 1: Użyj tymczasowych placeholderów

Możesz tymczasowo skomentować import logo w `ThemedLogo.jsx`:

```javascript
// import DarkLogo from '../assets/img/logo_dark.png';
// import LightLogo from '../assets/img/logo_light.png';

const ThemedLogo = (...props) => {
  return <View style={{width: 100, height: 100, backgroundColor: '#6849a7'}} />;
}
```

### Opcja 2: Utwórz własne grafiki

1. Stwórz proste logo w dowolnym programie graficznym
2. Zapisz jako PNG w odpowiednich rozmiarach
3. Umieść w folderze `assets/img/`

### Opcja 3: Użyj generatora Expo

```bash
npx expo install expo-dev-client
npx expo-generate-assets
```

## Zalecane wymiary

| Plik | Wymiar | Format |
|------|--------|--------|
| logo_dark.png | 200x200 px | PNG z przezroczystością |
| logo_light.png | 200x200 px | PNG z przezroczystością |
| icon.png | 1024x1024 px | PNG bez przezroczystości |
| adaptive-icon.png | 1024x1024 px | PNG z przezroczystością |
| splash.png | 1284x2778 px | PNG |
| favicon.png | 48x48 px | PNG |

## Tymczasowe rozwiązanie

Jeśli nie masz jeszcze grafik, możesz:

1. Usunąć komponent `<ThemedLogo/>` ze strony głównej (`app/index.jsx`)
2. Użyć domyślnych ikon Expo (aplikacja będzie działać, ale bez własnego logo)

## Narzędzia do tworzenia grafik

- [Canva](https://www.canva.com) - Prosty edytor online
- [Figma](https://www.figma.com) - Zaawansowany edytor
- [Icon Kitchen](https://icon.kitchen) - Generator ikon dla aplikacji
- [Flaticon](https://www.flaticon.com) - Darmowe ikony

---

**Uwaga:** Logo nie jest wymagane do uruchomienia aplikacji, ale poprawi wygląd! 🎨
