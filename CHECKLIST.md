# ✅ Checklist - Routes App

## 🎯 Co masz zrobić przed uruchomieniem

### 1. Instalacja ☐

```bash
cd routes_app
npm install
```

**Oczekiwany wynik:** Wszystkie pakiety zainstalowane bez błędów

---

### 2. Firebase Setup ☐

#### 2.1. Utworzenie projektu ☐
- [ ] Założone konto Firebase
- [ ] Utworzony nowy projekt
- [ ] Zapisana nazwa projektu

#### 2.2. Authentication ☐
- [ ] Włączona funkcja Authentication
- [ ] Włączona metoda Email/Password
- [ ] Zapisane (można zostawić domyślne ustawienia)

#### 2.3. Firestore Database ☐
- [ ] Utworzona baza Firestore
- [ ] Wybrano tryb testowy (dla rozwoju)
- [ ] Wybrano lokalizację (np. europe-west)

#### 2.4. Konfiguracja aplikacji ☐
- [ ] Dodana aplikacja Web w Firebase Console
- [ ] Skopiowana konfiguracja firebaseConfig
- [ ] Wklejona konfiguracja do `lib/firebase.js`

**Sprawdź czy masz wszystkie 6 wartości:**
- [ ] apiKey
- [ ] authDomain
- [ ] projectId
- [ ] storageBucket
- [ ] messagingSenderId
- [ ] appId

---

### 3. Opcjonalne (można zrobić później) ☐

#### 3.1. Logo ☐
- [ ] Dodane `logo_dark.png` do `assets/img/`
- [ ] Dodane `logo_light.png` do `assets/img/`
- [ ] Odkomentowane importy w `ThemedLogo.jsx`

**LUB**
- [ ] Usunięty komponent `<ThemedLogo/>` z `app/index.jsx`

#### 3.2. Ikony aplikacji ☐
- [ ] Dodane `icon.png` (1024x1024)
- [ ] Dodane `adaptive-icon.png` (1024x1024)
- [ ] Dodane `splash.png` (1284x2778)
- [ ] Zaktualizowane ścieżki w `app.json`

---

### 4. Pierwsze uruchomienie ☐

```bash
npm start
```

**Sprawdź czy:**
- [ ] Serwer Expo uruchomił się bez błędów
- [ ] Widzisz kod QR w terminalu
- [ ] Możesz otworzyć aplikację (w, a, lub i)

---

### 5. Test aplikacji ☐

#### 5.1. Rejestracja ☐
- [ ] Przejście do strony rejestracji
- [ ] Wpisanie emaila (np. test@test.com)
- [ ] Wpisanie hasła (min. 6 znaków)
- [ ] Kliknięcie "Zarejestruj"
- [ ] Przekierowanie do profilu

**Jeśli błąd:**
- Sprawdź czy włączyłeś Email/Password w Firebase
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź czy hasło ma min. 6 znaków

#### 5.2. Wylogowanie i logowanie ☐
- [ ] Kliknięcie "Wyloguj" w profilu
- [ ] Przejście do strony logowania
- [ ] Wpisanie tego samego emaila
- [ ] Wpisanie tego samego hasła
- [ ] Kliknięcie "Zaloguj"
- [ ] Przekierowanie do profilu

#### 5.3. Tworzenie trasy ☐
- [ ] Przejście do zakładki "Utwórz"
- [ ] Wypełnienie wszystkich pól
- [ ] Kliknięcie "Tworzenie Trasy"
- [ ] Przekierowanie do historii
- [ ] Widoczna nowa trasa na liście

**Jeśli błąd:**
- Sprawdź czy Firestore jest w trybie testowym
- Sprawdź czy użytkownik jest zalogowany
- Sprawdź czy wszystkie pola są wypełnione

#### 5.4. Wyświetlanie szczegółów ☐
- [ ] Kliknięcie na trasę w historii
- [ ] Wyświetlenie wszystkich danych trasy
- [ ] Widoczny przycisk "Usuń Trasę"

#### 5.5. Usuwanie trasy ☐
- [ ] Kliknięcie "Usuń Trasę"
- [ ] Przekierowanie do historii
- [ ] Trasa zniknęła z listy

---

### 6. Weryfikacja w Firebase Console ☐

#### 6.1. Users ☐
- [ ] Otwarta zakładka Authentication → Users
- [ ] Widoczny utworzony użytkownik
- [ ] Prawidłowy email

#### 6.2. Firestore ☐
- [ ] Otwarta zakładka Firestore Database
- [ ] Widoczna kolekcja `routes`
- [ ] Dokumenty pojawiają się po utworzeniu trasy
- [ ] Dokumenty znikają po usunięciu trasy

---

## 🐛 Troubleshooting

### Błędy podczas instalacji ☐
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Błędy Firebase ☐
- [ ] Sprawdzone czy wszystkie wartości w `firebase.js` są poprawne
- [ ] Sprawdzone czy nie ma dodatkowych cudzysłowów
- [ ] Sprawdzone czy wszystkie przecinki są na miejscu

### Aplikacja nie uruchamia się ☐
```bash
expo start --clear
```

### Problemy z logowaniem ☐
- [ ] Email ma znak @
- [ ] Hasło ma min. 6 znaków
- [ ] Email/Password jest włączone w Firebase
- [ ] Konfiguracja Firebase jest poprawna

### Nie widać tras ☐
- [ ] Użytkownik jest zalogowany
- [ ] Trasa została utworzona (sprawdź w Firebase Console)
- [ ] Firestore jest w trybie testowym
- [ ] userId w trasie zgadza się z user.uid

---

## 📚 Następne kroki

Po zakończeniu checklisty:

### Zrozumienie kodu ☐
- [ ] Przeczytane `README.md`
- [ ] Przeczytane `ARCHITEKTURA.md`
- [ ] Przeczytane `POROWNANIE.md`

### Eksperymenty ☐
- [ ] Zmienione kolory w `constants/Colors.js`
- [ ] Dodane nowe pole do formularza
- [ ] Wypróbowane tworzenie nowego ekranu

### Nauka ☐
- [ ] Przeczytana dokumentacja Firebase
- [ ] Przeczytana dokumentacja Expo Router
- [ ] Wypróbowane własne modyfikacje

---

## 🎉 Gratulacje!

Jeśli wszystkie checkboxy są zaznaczone, masz w pełni działającą aplikację!

**Co dalej?**
1. Eksperymentuj z kodem
2. Dodawaj nowe funkcje
3. Naucz się więcej o Firebase
4. Stwórz własną aplikację!

---

**Powodzenia! 🚀**

---

## 📋 Status

Data rozpoczęcia: _______________

Data ukończenia: _______________

Napotkane problemy:
- 
- 
- 

Rozwiązania:
- 
- 
- 

Notatki:
