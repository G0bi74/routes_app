# 🏗️ Architektura Aplikacji Routes App

## Wprowadzenie

Ten dokument wyjaśnia jak działa aplikacja Routes App. Jest przeznaczony dla osób o małym doświadczeniu w programowaniu.

## 🎯 Główne koncepcje

### 1. React Context (Kontekst)

**Co to jest?**
Context to sposób na udostępnianie danych w całej aplikacji bez konieczności przekazywania ich przez każdy komponent.

**Jak to działa?**
```
                    Provider (dostawca danych)
                            |
        +-------------------+-------------------+
        |                   |                   |
    Komponent A        Komponent B        Komponent C
        |                   |                   |
    useHook           useHook            useHook
```

**W naszej aplikacji:**
- `UserContext` - przechowuje dane użytkownika i funkcje logowania
- `RoutesContext` - przechowuje trasy i funkcje CRUD

### 2. Custom Hooks (Własne hooki)

**Co to jest?**
Hook to funkcja która pozwala używać funkcji Reacta. Custom hook to nasz własny hook.

**Przykład:**
```javascript
// Zamiast:
const context = useContext(UserContext);
const user = context.user;
const login = context.login;

// Używamy:
const { user, login } = useUser();
```

**Nasze hooki:**
- `useUser()` - dostęp do danych użytkownika
- `useRoutes()` - dostęp do tras

### 3. Firebase Authentication (Uwierzytelnianie)

**Co robi?**
Zarządza logowaniem i rejestracją użytkowników.

**Przepływ:**
```
Użytkownik wprowadza email i hasło
         ↓
Firebase sprawdza dane
         ↓
Jeśli OK → Użytkownik zalogowany
Jeśli błąd → Wyświetl komunikat
```

### 4. Firestore (Baza danych)

**Co robi?**
Przechowuje dane o trasach w chmurze.

**Struktura:**
```
Firestore
  └── routes (kolekcja)
        ├── trasa1 (dokument)
        │     ├── userId: "abc123"
        │     ├── startAdress: "..."
        │     └── ...
        ├── trasa2 (dokument)
        └── trasa3 (dokument)
```

## 📱 Przepływ działania aplikacji

### Uruchamianie aplikacji

```
1. Aplikacja się uruchamia
   ↓
2. _layout.jsx opakowuje aplikację w Providery
   ↓
3. UserContext sprawdza czy użytkownik jest zalogowany
   ↓
4. Jeśli TAK → Przekierowanie do /profile
   Jeśli NIE → Pokazuje stronę główną
```

### Logowanie

```
1. Użytkownik klika "Zaloguj" (login.jsx)
   ↓
2. Wprowadza email i hasło
   ↓
3. Kliknięcie przycisku → handleSubmit()
   ↓
4. handleSubmit() wywołuje login(email, password)
   ↓
5. login() w UserContext wysyła dane do Firebase
   ↓
6. Firebase sprawdza dane
   ↓
7a. OK → setUser(userData) → Użytkownik zalogowany
7b. Błąd → throw Error → Wyświetl komunikat
   ↓
8. GuestsOnly wykrywa użytkownika → Przekierowanie do /profile
```

### Tworzenie trasy

```
1. Użytkownik wypełnia formularz (create.jsx)
   ↓
2. Kliknięcie "Tworzenie Trasy" → handleSubmit()
   ↓
3. Walidacja: Czy wszystkie pola wypełnione?
   ↓
4. handleSubmit() wywołuje createRoute(dane)
   ↓
5. createRoute() w RoutesContext dodaje trasę do Firestore
   ↓
6. Firestore zapisuje trasę i zwraca ID
   ↓
7. onSnapshot w RoutesContext wykrywa zmianę
   ↓
8. Automatyczna aktualizacja listy tras
   ↓
9. Przekierowanie do /history
```

### Wyświetlanie tras

```
1. Użytkownik przechodzi do zakładki "Historia"
   ↓
2. history.jsx renderuje się
   ↓
3. const { routes } = useRoutes() pobiera trasy
   ↓
4. FlatList wyświetla każdą trasę jako kartę
   ↓
5. Kliknięcie karty → router.push(`/routes/${id}`)
   ↓
6. routes/[id].jsx pobiera szczegóły trasy
   ↓
7. fetchRouteById(id) pobiera dane z Firestore
   ↓
8. Wyświetlenie szczegółów
```

## 🔄 Synchronizacja w czasie rzeczywistym

**Jak to działa?**

```javascript
// RoutesContext.jsx - useEffect

useEffect(() => {
  // 1. Tworzymy zapytanie
  const q = query(
    collection(db, 'routes'),
    where("userId", "==", user.uid)
  );
  
  // 2. Nasłuchujemy zmian
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // 3. Przy każdej zmianie aktualizujemy listę
    const routesData = [];
    snapshot.forEach((doc) => {
      routesData.push({ id: doc.id, ...doc.data() });
    });
    setRoutes(routesData);
  });
  
  // 4. Czyścimy nasłuchiwanie przy odmontowaniu
  return () => unsubscribe();
}, [user]);
```

**Co się dzieje:**
1. Aplikacja subskrybuje zmiany w bazie
2. Gdy coś się zmieni (dodanie, usunięcie):
   - Firestore wysyła powiadomienie
   - onSnapshot automatycznie aktualizuje listę
   - Użytkownik widzi zmiany natychmiast

## 🛡️ Ochrona tras (Route Guards)

### GuestsOnly

**Cel:** Tylko niezalogowani mogą zobaczyć stronę

```javascript
// GuestsOnly.jsx

const GuestsOnly = ({ children }) => {
  const { user, authChecked } = useUser();
  
  // Jeśli nie sprawdziliśmy jeszcze -> loader
  if (!authChecked) return <ThemedLoader />;
  
  // Jeśli użytkownik zalogowany -> przekieruj
  if (user) router.replace('/profile');
  
  // Jeśli niezalogowany -> pokaż stronę
  return children;
}
```

### UserOnly

**Cel:** Tylko zalogowani mogą zobaczyć stronę

```javascript
// UserOnly.jsx

const UserOnly = ({ children }) => {
  const { user, authChecked } = useUser();
  
  // Jeśli nie sprawdziliśmy jeszcze -> loader
  if (!authChecked) return <ThemedLoader />;
  
  // Jeśli użytkownik niezalogowany -> przekieruj
  if (!user) router.replace('/login');
  
  // Jeśli zalogowany -> pokaż stronę
  return children;
}
```

## 🎨 System motywów (Theming)

**Jak działają themed komponenty?**

```javascript
// ThemedText.jsx

const ThemedText = ({style, title = false, ...props}) => {
  // 1. Sprawdź jaki motyw jest aktywny
  const colorScheme = useColorScheme(); // 'light' lub 'dark'
  
  // 2. Pobierz odpowiednią paletę kolorów
  const theme = Colors[colorScheme] ?? Colors.light;
  
  // 3. Wybierz kolor tekstu
  const textColor = title ? theme.title : theme.text;
  
  // 4. Zwróć tekst z kolorem
  return <Text style={[{color: textColor}, style]} {...props} />;
}
```

**Dlaczego to dobre?**
- Automatyczne dostosowanie do motywu systemowego
- Jeden kod dla obu motywów
- Łatwa zmiana kolorów w jednym miejscu (Colors.js)

## 📦 Przepływ danych

### Od Firestore do ekranu

```
Firestore (chmura)
      ↓
onSnapshot wykrywa zmianę
      ↓
RoutesContext aktualizuje stan (setRoutes)
      ↓
Komponenty używające useRoutes() otrzymują nowe dane
      ↓
React renderuje ponownie komponenty
      ↓
Użytkownik widzi zaktualizowane dane
```

### Od formularza do Firestore

```
Użytkownik wypełnia formularz
      ↓
Dane w state komponentu (useState)
      ↓
Kliknięcie przycisku → handleSubmit()
      ↓
Wywołanie createRoute(dane)
      ↓
RoutesContext wysyła dane do Firestore
      ↓
Firestore zapisuje dane
      ↓
onSnapshot wykrywa zmianę → aktualizacja listy
```

## 🔍 Debugowanie

### Jak sprawdzić co się dzieje?

**1. Console.log w kluczowych miejscach:**

```javascript
// RoutesContext.jsx
async function createRoute(data){
  console.log("Tworzenie trasy:", data);  // ← Sprawdź dane
  try {
    await addDoc(collection(db, COLLECTION_NAME), {...});
    console.log("Trasa utworzona pomyślnie");  // ← Potwierdź sukces
  } catch (error) {
    console.log("Błąd:", error.message);  // ← Pokaż błąd
  }
}
```

**2. React DevTools:**
- Zainstaluj rozszerzenie React DevTools
- Sprawdź stan komponentów
- Zobacz jakie dane są przekazywane

**3. Firebase Console:**
- Sprawdź czy dane są w bazie
- Zobacz logi Authentication
- Sprawdź zasady bezpieczeństwa

## 💡 Najważniejsze zasady

### 1. Separation of Concerns (Rozdzielenie odpowiedzialności)

```
lib/firebase.js        → Konfiguracja Firebase
context/              → Logika biznesowa (stan, funkcje)
hooks/                → Łatwy dostęp do context
components/           → Komponenty UI (wygląd)
app/                  → Ekrany (łączenie wszystkiego)
```

### 2. DRY (Don't Repeat Yourself)

Zamiast kopiować kod - stwórz komponent:
```javascript
// ❌ ZŁE - powtarzanie kodu
<View style={{backgroundColor: theme.background}}>
<View style={{backgroundColor: theme.background}}>
<View style={{backgroundColor: theme.background}}>

// ✅ DOBRE - jeden komponent
<ThemedView>
<ThemedView>
<ThemedView>
```

### 3. Single Responsibility (Jedna odpowiedzialność)

Każdy plik robi jedną rzecz:
- `UserContext.jsx` - tylko logika użytkownika
- `RoutesContext.jsx` - tylko logika tras
- `ThemedButton.jsx` - tylko przycisk

## 🚀 Dodawanie nowych funkcji

### Przykład: Dodanie edycji trasy

**Krok 1: Dodaj funkcję do Context**
```javascript
// RoutesContext.jsx
async function updateRoute(id, data){
  const routeRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(routeRef, data);
}

// Dodaj do Provider
<RoutesContext.Provider value={{
  ...,
  updateRoute  // ← Nowa funkcja
}}>
```

**Krok 2: Utwórz ekran edycji**
```javascript
// app/(dashboard)/routes/edit/[id].jsx
const Edit = () => {
  const { updateRoute } = useRoutes();  // ← Użyj funkcji
  
  const handleSubmit = async () => {
    await updateRoute(id, formData);
  };
}
```

**Krok 3: Dodaj przycisk**
```javascript
// routes/[id].jsx
<ThemedButton onPress={() => router.push(`/routes/edit/${id}`)}>
  <Text>Edytuj</Text>
</ThemedButton>
```

## 📚 Dalsze kroki

1. **Naucz się więcej o React:**
   - Hooks (useState, useEffect, useContext)
   - Props i State
   - Lifecycle komponentów

2. **Naucz się więcej o Firebase:**
   - Zapytania Firestore (queries)
   - Indeksy i optymalizacja
   - Cloud Functions

3. **Naucz się więcej o React Native:**
   - Style i layout (Flexbox)
   - Nawigacja
   - Async Storage

---

**Pamiętaj:** Każdy programista kiedyś zaczynał od podstaw. Nie bój się eksperymentować! 🚀
