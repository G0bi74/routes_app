// Plik konfiguracji kolorów aplikacji
// Zawiera paletę kolorów dla motywu jasnego i ciemnego
export const Colors = {
    primary: '#6849a7',     // Główny kolor aplikacji (fioletowy)
    warning: '#cc475a',     // Kolor dla ostrzeżeń i błędów (czerwony)

    // Motyw ciemny
    dark:{
        text: '#d4d4d4',                // Kolor tekstu
        title: '#fff',                  // Kolor tytułów
        background: '#252231',          // Tło główne
        navBackground: '#201e2b',       // Tło nawigacji
        iconColor: '#9591a5',          // Kolor ikon nieaktywnych
        iconColorFocused: '#fff',       // Kolor ikon aktywnych
        uiBackground: '#2f2b3d',        // Tło elementów UI (karty, inputy)
    },

    // Motyw jasny
    light:{
        text: '#625f72',                // Kolor tekstu
        title: '#201e2b',               // Kolor tytułów
        background: '#e0dfe8',          // Tło główne
        navBackground: '#e8e7ef',       // Tło nawigacji
        iconColor: '#686477',          // Kolor ikon nieaktywnych
        iconColorFocused: '#201d2b',    // Kolor ikon aktywnych
        uiBackground: '#d6d5e1',        // Tło elementów UI (karty, inputy)
    },
}
