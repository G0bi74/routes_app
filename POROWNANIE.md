# 📋 Porównanie aplikacji

## Routes App vs Tutorial v2 (Books App)

### Główne różnice

| Aspekt | Tutorial v2 (Books) | Routes App (Trasy) |
|--------|---------------------|-------------------|
| Backend | Appwrite | Firebase |
| Baza danych | Appwrite Database | Firestore |
| Autoryzacja | Appwrite Auth | Firebase Authentication |
| Synchronizacja | Appwrite Realtime | Firestore onSnapshot |
| Dane | Książki (title, author, description) | Trasy (startAdress, startTime, date, endAdress, endTime, description) |

---

## 🔄 Zmienione elementy

### 1. Konfiguracja backendu

**Tutorial v2 (Appwrite):**
```javascript
// lib/appwrite.js
import { Client, Account, Databases } from "react-native-appwrite";

export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('PROJECT_ID')
    .setPlatform('PLATFORM_ID');

export const account = new Account(client);
export const databases = new Databases(client);
```

**Routes App (Firebase):**
```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### 2. Autoryzacja

**Tutorial v2 (Appwrite):**
```javascript
// Logowanie
await account.createEmailPasswordSession(email, password);
const response = await account.get();
setUser(response);

// Rejestracja
await account.create(ID.unique(), email, password);
```

**Routes App (Firebase):**
```javascript
// Logowanie
const userCredential = await signInWithEmailAndPassword(auth, email, password);
setUser(userCredential.user);

// Rejestracja
await createUserWithEmailAndPassword(auth, email, password);
```

---

### 3. Operacje CRUD

#### Tworzenie (Create)

**Tutorial v2 (Appwrite):**
```javascript
await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    {...data, userid: user.$id},
    [Permission.read(Role.user(user.$id))]
);
```

**Routes App (Firebase):**
```javascript
await addDoc(collection(db, 'routes'), {
    ...data,
    userId: user.uid,
    createdAt: Timestamp.now()
});
```

#### Odczyt (Read)

**Tutorial v2 (Appwrite):**
```javascript
const response = await databases.listDocuments(
    DATABASE_ID, 
    COLLECTION_ID,
    [Query.equal('userid', user.$id)]
);
```

**Routes App (Firebase):**
```javascript
const q = query(
    collection(db, 'routes'),
    where("userId", "==", user.uid)
);
const snapshot = await getDocs(q);
```

#### Usuwanie (Delete)

**Tutorial v2 (Appwrite):**
```javascript
await databases.deleteDocument(
    DATABASE_ID,
    COLLECTION_ID,
    id
);
```

**Routes App (Firebase):**
```javascript
const routeRef = doc(db, 'routes', id);
await deleteDoc(routeRef);
```

---

### 4. Synchronizacja w czasie rzeczywistym

**Tutorial v2 (Appwrite):**
```javascript
const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;

unsubscribe = client.subscribe(channel, (response) => {
    const { payload, events } = response;
    if (events[0].includes('create')) {
        setBooks((prev) => [...prev, payload]);
    }
    if (events[0].includes('delete')) {
        setBooks((prev) => prev.filter((book) => book.$id !== payload.$id));
    }
});
```

**Routes App (Firebase):**
```javascript
const q = query(
    collection(db, 'routes'),
    where("userId", "==", user.uid)
);

unsubscribe = onSnapshot(q, (snapshot) => {
    const routesData = [];
    snapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
    });
    setRoutes(routesData);
});
```

---

### 5. Struktura danych

**Tutorial v2 (Books):**
```javascript
{
  $id: "unique-id",
  userid: "user-id",
  title: "Tytuł książki",
  author: "Autor",
  description: "Opis książki"
}
```

**Routes App (Trasy):**
```javascript
{
  id: "unique-id",
  userId: "user-id",
  startAdress: "ul. Główna 1",
  startTime: "08:00",
  date: "2024-01-15",
  endAdress: "ul. Końcowa 10",
  endTime: "10:30",
  description: "Opis trasy",
  createdAt: Timestamp
}
```

---

### 6. Nazewnictwo

| Tutorial v2 | Routes App |
|-------------|------------|
| BooksContext | RoutesContext |
| useBooks() | useRoutes() |
| books | routes |
| book | route |
| fetchBookById() | fetchRouteById() |
| createBook() | createRoute() |
| deleteBook() | deleteRoute() |
| userid | userId |
| $id | id |

---

## ✅ Identyczne elementy

### 1. Struktura folderów
```
app/
  (auth)/
  (dashboard)/
components/
  auth/
  themed components
context/
hooks/
constants/
```

### 2. Komponenty UI
- Wszystkie themed komponenty są identyczne
- ThemedView, ThemedText, ThemedButton, etc.
- System motywów (Colors.js)

### 3. Nawigacja
- Expo Router
- Stack Navigation dla auth
- Tabs Navigation dla dashboard
- Route guards (GuestsOnly, UserOnly)

### 4. Logika aplikacji
- Separation of Concerns
- Context API dla stanu globalnego
- Custom hooks dla łatwego dostępu
- Protected routes

---

## 🎯 Dlaczego Firebase zamiast Appwrite?

### Zalety Firebase:
1. ✅ Większa społeczność i więcej tutoriali
2. ✅ Lepsza dokumentacja
3. ✅ Darmowy tier jest bardzo hojny
4. ✅ Łatwiejsza konfiguracja
5. ✅ Więcej funkcji (Analytics, Crashlytics, etc.)
6. ✅ Lepsze wsparcie dla React Native

### Zalety Appwrite:
1. ✅ Open source
2. ✅ Self-hosted (pełna kontrola)
3. ✅ Prostsze API
4. ✅ Wbudowane uprawnienia (Permissions)

---

## 📚 Jak przejść z jednego na drugi?

### Z Appwrite na Firebase:
1. Zamień import'y w `lib/`
2. Zaktualizuj funkcje w Context (API calls)
3. Zmień nazwy pól (userid → userId, $id → id)
4. Zaktualizuj synchronizację realtime

### Z Firebase na Appwrite:
1. Zamień import'y w `lib/`
2. Zaktualizuj funkcje w Context
3. Dodaj Permission'y do createDocument
4. Zaktualizuj subscribe channel

---

## 💡 Wskazówki

### Gdy używasz Firebase:
- Pamiętaj o Firestore Rules (bezpieczeństwo)
- Używaj indexów dla złożonych zapytań
- Monitoruj użycie (Firebase Console)

### Gdy używasz Appwrite:
- Używaj Permission'ów przy tworzeniu dokumentów
- Pamiętaj o DATABASE_ID i COLLECTION_ID
- Subscribe tylko do potrzebnych kanałów

---

## 🚀 Następne kroki

1. **Naucz się Firebase:**
   - Firestore Queries
   - Security Rules
   - Firebase Functions

2. **Albo naucz się Appwrite:**
   - Appwrite Functions
   - Realtime Subscriptions
   - Self-hosting

3. **Porównaj oba:**
   - Zbuduj prosty projekt w obu
   - Zobacz który Ci bardziej odpowiada
   - Wybierz ten który lepiej pasuje do Twojego projektu

---

**Oba rozwiązania są świetne! Wybór zależy od Twoich potrzeb. 🎯**
