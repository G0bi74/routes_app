/**
 * RoutesContext - Kontekst dla zarządzania trasami
 * 
 * Ten plik zawiera logikę CRUD (Create, Read, Update, Delete) dla tras:
 * - Pobieranie wszystkich tras użytkownika
 * - Pobieranie szczegółów pojedynczej trasy
 * - Tworzenie nowych tras
 * - Usuwanie tras
 * - Automatyczne aktualizowanie listy tras w czasie rzeczywistym
 */

import { createContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    getDoc,
    updateDoc,
    query,
    where,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { useUser } from "../hooks/useUser";
import { geocodeBothAddresses, reverseGeocode } from "../lib/geocoding";
import { getRouteInfo } from "../lib/routing";
import { getCurrentLocation } from "../lib/location";
import {
    createActiveRouteNotification,
    dismissActiveRouteNotification,
} from '../lib/notifications';

// Nazwa kolekcji w Firestore gdzie przechowywane są trasy
const COLLECTION_NAME = 'routes';

// Tworzenie kontekstu dla tras
export const RoutesContext = createContext();

/**
 * Provider dla kontekstu tras
 * Zarządza stanem i operacjami na trasach w całej aplikacji
 */
export const RoutesProvider = ({ children }) => {
    // Stan przechowujący listę wszystkich tras użytkownika
    const [routes, setRoutes] = useState([]);
    
    // Pobieranie informacji o zalogowanym użytkowniku
    const { user } = useUser();

    /**
     * Funkcja do pobierania szczegółów konkretnej trasy
     * @param {string} id - ID trasy do pobrania
     * @returns {Object|null} Obiekt trasy lub null jeśli wystąpił błąd
     */
    async function fetchRouteById(id){
        try {
            // Referencja do konkretnego dokumentu w kolekcji
            const routeRef = doc(db, COLLECTION_NAME, id);
            
            // Pobranie dokumentu
            const routeSnap = await getDoc(routeRef);
            
            // Sprawdzenie czy dokument istnieje
            if (routeSnap.exists()) {
                // Zwrócenie danych trasy wraz z ID
                return { id: routeSnap.id, ...routeSnap.data() };
            } else {
                console.log("Trasa nie istnieje");
                return null;
            }
        } catch(error) {
            console.log("Błąd pobierania trasy:", error.message);
            
            // Fallback: sprawdź cache (świeżo utworzone trasy mogą nie być jeszcze dostępne)
            const cachedRoute = routes.find(r => r.id === id);
            if (cachedRoute) {
                console.log("Znaleziono trasę w lokalnym cache:", id);
                return cachedRoute;
            }
            
            return null;
        }
    }

    /**
     * Funkcja do tworzenia nowej trasy
     * 
     * Proces:
     * 1. Geokodowanie adresów (zamiana na współrzędne)
     * 2. Obliczenie odległości drogowej między punktami
     * 3. Zapisanie danych w Firestore
     * 
     * @param {Object} data - Dane nowej trasy (startAddress, endAddress, description)
     * @throws {Error} Jeśli geokodowanie lub obliczenie trasy się nie powiedzie
     */
    async function createRoute(data){
        try {
            console.log("Rozpoczęcie tworzenia trasy...");

            // Krok 1: Geokodowanie obu adresów jednocześnie
            console.log("Geokodowanie adresów...");
            const coordinates = await geocodeBothAddresses(
                data.startAddress,
                data.endAddress
            );

            // Krok 2: Obliczenie odległości drogowej
            console.log("Obliczanie odległości...");
            const routeInfo = await getRouteInfo(
                coordinates.start,
                coordinates.end
            );

            // Krok 3: Przygotowanie danych do zapisu
            const routeData = {
                // Adresy
                startAddress: data.startAddress,
                endAddress: data.endAddress,
                
                // Współrzędne geograficzne
                startCoordinates: {
                    lat: coordinates.start.lat,
                    lon: coordinates.start.lon
                },
                endCoordinates: {
                    lat: coordinates.end.lat,
                    lon: coordinates.end.lon
                },
                
                // Sformatowane adresy (z geocoding)
                startAddressFormatted: coordinates.start.displayName,
                endAddressFormatted: coordinates.end.displayName,
                
                // Informacje o trasie
                distance: routeInfo.distance,              // w kilometrach
                distanceMeters: routeInfo.distanceMeters,  // w metrach
                duration: routeInfo.duration,              // w minutach
                
                // Metadane
                userId: user.uid,
                createdAt: data.createdAt || Timestamp.now(),
                
                // Opcjonalne daty i godziny (dla tras backupowych)
                ...(data.startedAt && { startedAt: data.startedAt }),
                ...(data.completedAt && { completedAt: data.completedAt }),
                status: data.status || "completed"
            };

            // Krok 4: Zapis do Firestore
            console.log("Zapisywanie do bazy danych...");
            await addDoc(collection(db, COLLECTION_NAME), routeData);
            
            console.log("Trasa została utworzona pomyślnie!");
            console.log("Obliczona odległość:", routeInfo.distance, "km");
            
        } catch (error) {
            console.error("Błąd tworzenia trasy:", error.message);
            
            // Rzucenie błędu z przyjazną wiadomością
            if (error.message.includes('Nie znaleziono lokalizacji')) {
                throw new Error('Nie można znaleźć podanego adresu. Sprawdź czy jest poprawny.');
            } else if (error.message.includes('Nie znaleziono trasy')) {
                throw new Error('Nie można obliczyć trasy między podanymi punktami.');
            } else if (error.message.includes('Błąd geokodowania') || error.message.includes('Błąd obliczania trasy')) {
                throw new Error('Problem z połączeniem do serwera. Spróbuj ponownie.');
            } else {
                throw new Error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
            }
        }
    }

    /**
     * Funkcja do usuwania trasy
     * @param {string} id - ID trasy do usunięcia
     */
    async function deleteRoute(id){
        try {
            // Referencja do dokumentu do usunięcia
            const routeRef = doc(db, COLLECTION_NAME, id);
            
            // Usunięcie dokumentu
            await deleteDoc(routeRef);
            
            console.log("Trasa została usunięta");
        } catch (error) {
            console.log("Błąd usuwania trasy:", error.message);
        }
    }

    /**
     * Funkcja do rozpoczęcia trasy na żywo z GPS
     * 
     * Proces:
     * 1. Pobranie aktualnej lokalizacji GPS
     * 2. Zamiana współrzędnych na adres (reverse geocoding)
     * 3. Utworzenie trasy w bazie ze statusem "in-progress"
     * 4. Zwrócenie ID utworzonej trasy
     * 
     * @param {string} photoUri - URI zdjęcia początku trasy (opcjonalne)
     * @param {number} mileageOcr - Stan licznika wykryty z OCR (opcjonalne)
     * @returns {Promise<string>} ID utworzonej trasy
     * @throws {Error} Jeśli nie można pobrać lokalizacji lub utworzyć trasy
     */
    async function startLiveRoute(photoUri = null, mileageOcr = null) {
        try {
            console.log("Rozpoczynanie trasy na żywo...");

            // Krok 1: Pobranie aktualnej lokalizacji GPS
            console.log("Pobieranie lokalizacji GPS...");
            const location = await getCurrentLocation();

            // Krok 2: Zamiana współrzędnych na adres
            console.log("Geokodowanie lokalizacji...");
            const addressData = await reverseGeocode(location.lat, location.lon);

            // Krok 3: Przygotowanie danych trasy "w trakcie"
            const routeData = {
                // Adresy (tylko start - koniec będzie dodany później)
                startAddress: addressData.displayName,
                endAddress: "",  // Pusty string zamiast null
                
                // Współrzędne startu
                startCoordinates: {
                    lat: location.lat,
                    lon: location.lon
                },
                
                // Sformatowane adresy
                startAddressFormatted: addressData.displayName,
                endAddressFormatted: "",  // Pusty string zamiast null
                
                // Współrzędne końca (puste obiekty zamiast null)
                endCoordinates: {
                    lat: 0,
                    lon: 0
                },
                
                // Informacje o trasie (0 zamiast null)
                distance: 0,
                distanceMeters: 0,
                duration: 0,
                
                // Zdjęcia
                startImageUri: photoUri || null,
                endImageUri: null,
                
                // Stan licznika z OCR
                startMileage: mileageOcr || null,
                endMileage: null,
                mileageDistance: null, // Odległość wyliczona ze stanów licznika
                
                // Metadane - WAŻNE: zachowujemy tę samą strukturę co trasa manualna
                userId: user.uid,
                createdAt: Timestamp.now(),
                
                // Dodatkowe pola dla tras GPS
                status: "in-progress",
                startedAt: Timestamp.now(),
            };

            // Krok 4: Zapis do Firestore
            console.log("Zapisywanie trasy do bazy...");
            const docRef = await addDoc(collection(db, COLLECTION_NAME), routeData);
            
            // Krok 5: Utwórz powiadomienie systemowe
            await createActiveRouteNotification({
                id: docRef.id,
                startAddress: addressData.displayName,
                startedAt: Timestamp.now(),
            });
            
            console.log("Trasa na żywo rozpoczęta! ID:", docRef.id);
            console.log("Lokalizacja startu:", addressData.displayName);
            
            return docRef.id; // Zwracamy ID trasy do dalszego użycia

        } catch (error) {
            console.error("Błąd rozpoczynania trasy na żywo:", error);
            console.error("Szczegóły błędu:", error.message, error.code);
            
            // Rzucenie błędu z przyjazną wiadomością
            if (error.code === 'permission-denied' || error.message.includes('insufficient permissions')) {
                throw new Error('Brak uprawnień do zapisu w bazie. Sprawdź reguły Firebase.');
            } else if (error.message.includes('uprawnienia') || error.message.includes('GPS')) {
                throw new Error(error.message);
            } else if (error.message.includes('lokalizacji')) {
                throw new Error('Nie można pobrać lokalizacji. Sprawdź czy GPS jest włączony.');
            } else {
                throw new Error('Wystąpił błąd podczas rozpoczynania trasy. Spróbuj ponownie.');
            }
        }
    }

    /**
     * Funkcja do zakończenia trasy na żywo
     * 
     * Proces:
     * 1. Pobranie aktualnej lokalizacji GPS
     * 2. Zamiana współrzędnych na adres
     * 3. Obliczenie odległości między startem a końcem (GPS)
     * 4. Obliczenie odległości ze stanów licznika (jeśli dostępne)
     * 5. Aktualizacja trasy w bazie ze statusem "completed"
     * 
     * @param {string} routeId - ID trasy do zakończenia
     * @param {string} photoUri - URI zdjęcia końca trasy (opcjonalne)
     * @param {number} mileageOcr - Stan licznika wykryty z OCR (opcjonalne)
     * @throws {Error} Jeśli nie można zakończyć trasy
     */
    async function endLiveRoute(routeId, photoUri = null, mileageOcr = null) {
        try {
            console.log("Kończenie trasy na żywo...");

            // Krok 1: Pobranie danych aktualnej trasy
            const routeData = await fetchRouteById(routeId);
            
            if (!routeData) {
                throw new Error('Nie znaleziono trasy');
            }

            if (routeData.status !== "in-progress") {
                throw new Error('Trasa nie jest w trakcie');
            }

            // Krok 2: Pobranie aktualnej lokalizacji GPS (koniec trasy)
            console.log("Pobieranie lokalizacji końcowej...");
            const location = await getCurrentLocation();

            // Krok 3: Zamiana współrzędnych na adres
            console.log("Geokodowanie lokalizacji końcowej...");
            const endAddressData = await reverseGeocode(location.lat, location.lon);

             // Krok 4: Obliczenie odległości i czasu trasy
            let finalDistance = 0;
            let finalDuration = 0;
            let mileageDistance = null;
            let usedMileageForDistance = false;

            // Sprawdź czy mamy dane z licznika (OCR)
            if (mileageOcr && routeData.startMileage && mileageOcr > routeData.startMileage) {
                // Oblicz różnicę między stanem końcowym a początkowym
                mileageDistance = mileageOcr - routeData.startMileage;
                finalDistance = mileageDistance;
                usedMileageForDistance = true;
                
                console.log(`Użyto odległości z licznika: ${mileageDistance} km (${routeData.startMileage} -> ${mileageOcr})`);
                
                // Oblicz rzeczywisty czas trasy na podstawie startedAt i completedAt
                if (routeData.startedAt) {
                    const startTime = routeData.startedAt.toDate();
                    const endTime = new Date();
                    const durationMs = endTime - startTime;
                    finalDuration = Math.round(durationMs / 60000); // Konwersja milisekund na minuty
                    
                    console.log(`Rzeczywisty czas trasy: ${finalDuration} minut`);
                } else {
                    // Fallback - szacunkowy czas (średnia prędkość 60 km/h)
                    finalDuration = Math.round((mileageDistance / 60) * 60);
                    console.log(`Szacunkowy czas trasy: ${finalDuration} minut (brak startedAt)`);
                }
            } else {
                // Jeśli brak danych z licznika, użyj OSRM API
                console.log("Brak danych z licznika, obliczanie odległości z OSRM...");
                const routeInfo = await getRouteInfo(
                    routeData.startCoordinates,
                    { lat: location.lat, lon: location.lon }
                );
                
                finalDistance = routeInfo.distance;
                finalDuration = routeInfo.duration;
                
                console.log(`Użyto odległości z OSRM: ${finalDistance} km, czas: ${finalDuration} min`);
            }
            // Krok 5: Przygotowanie danych do aktualizacji
            const updateData = {
                // Dane końca trasy
                endAddress: endAddressData.displayName,
                endAddressFormatted: endAddressData.displayName,
                endCoordinates: {
                    lat: location.lat,
                    lon: location.lon
                },
                
                // Informacje o trasie
                distance: finalDistance, // Odległość z licznika lub GPS
                distanceMeters: finalDistance * 1000,
                duration: finalDuration, // Rzeczywisty czas (dla OCR) lub szacunkowy (dla OSRM)
                
                // Stan licznika z OCR
                endMileage: mileageOcr || null,
                mileageDistance: mileageDistance, // Odległość wyliczona ze stanów licznika
                usedMileageForDistance: usedMileageForDistance, // Czy użyto licznika do obliczenia odległości
                
                // Zdjęcie końca (jeśli jest)
                endImageUri: photoUri || null,
                
                // Status i czas zakończenia
                status: "completed",
                completedAt: Timestamp.now(),
            };

            // Krok 6: Aktualizacja dokumentu w Firestore
            console.log("Aktualizacja trasy w bazie...");
            const routeRef = doc(db, COLLECTION_NAME, routeId);
            await updateDoc(routeRef, updateData);
            
            // Krok 7: Usuń powiadomienie systemowe
            await dismissActiveRouteNotification();
            
            console.log("Trasa zakończona pomyślnie!");
            console.log("Przebyta odległość:", finalDistance, "km");

        } catch (error) {
            console.error("Błąd kończenia trasy na żywo:", error);
            console.error("Szczegóły błędu:", error.message, error.code);
            
            // Rzucenie błędu z przyjazną wiadomością
            if (error.code === 'permission-denied' || error.message.includes('insufficient permissions')) {
                throw new Error('Brak uprawnień do aktualizacji w bazie. Sprawdź reguły Firebase.');
            } else if (error.message.includes('Nie znaleziono trasy')) {
                throw new Error('Nie znaleziono trasy do zakończenia.');
            } else if (error.message.includes('nie jest w trakcie')) {
                throw new Error('Ta trasa została już zakończona.');
            } else if (error.message.includes('lokalizacji') || error.message.includes('GPS')) {
                throw new Error('Nie można pobrać lokalizacji końcowej. Sprawdź czy GPS jest włączony.');
            } else if (error.message.includes('Nie znaleziono trasy między')) {
                throw new Error('Nie można obliczyć trasy. Sprawdź połączenie internetowe.');
            } else {
                throw new Error('Wystąpił błąd podczas kończenia trasy. Spróbuj ponownie.');
            }
        }
    }

    /**
     * Effect hook - nasłuchuje zmian w trasach użytkownika w czasie rzeczywistym
     * Automatycznie aktualizuje listę tras gdy:
     * - Dodana zostanie nowa trasa
     * - Trasa zostanie usunięta
     * - Użytkownik się zaloguje/wyloguje
     */
    useEffect(() => {
        // Zmienna przechowująca funkcję do zakończenia nasłuchiwania
        let unsubscribe;

        if (user) {
            try {
                // Jeśli użytkownik jest zalogowany, tworzymy zapytanie o jego trasy
                const q = query(
                    collection(db, COLLECTION_NAME),
                    where("userId", "==", user.uid)  // Tylko trasy tego użytkownika
                );

                // Nasłuchiwanie zmian w czasie rzeczywistym
                unsubscribe = onSnapshot(
                    q, 
                    (querySnapshot) => {
                        const routesData = [];
                        
                        // Iteracja po wszystkich dokumentach w wyniku zapytania
                        querySnapshot.forEach((doc) => {
                            routesData.push({
                                id: doc.id,           // ID dokumentu
                                ...doc.data()         // Dane dokumentu
                            });
                        });
                        
                        // Sortowanie po dacie utworzenia (najnowsze na górze)
                        routesData.sort((a, b) => {
                            const dateA = a.createdAt?.toDate() || new Date(0);
                            const dateB = b.createdAt?.toDate() || new Date(0);
                            return dateB - dateA;
                        });
                        
                        // Aktualizacja stanu z pobranymi trasami
                        setRoutes(routesData);
                        console.log("Pobrano trasy:", routesData.length);
                    },
                    (error) => {
                        // Obsługa błędów nasłuchiwania
                        console.error("Błąd nasłuchiwania tras:", error.message);
                        console.error("Kod błędu:", error.code);
                        
                        if (error.code === 'permission-denied') {
                            console.error("BŁĄD UPRAWNIEŃ: Sprawdź czy Firebase Security Rules są poprawnie skonfigurowane");
                            console.error("Upewnij się że reguła 'allow list' jest ustawiona dla /routes/{routeId}");
                        }
                        
                        // W przypadku błędu, zachowaj obecny stan tras
                        setRoutes([]);
                    }
                );
            } catch (error) {
                console.error("Błąd tworzenia zapytania:", error.message);
                setRoutes([]);
            }
        } else {
            // Jeśli użytkownik wylogowany, czyścimy listę tras
            setRoutes([]);
        }

        // Funkcja czyszcząca - zakończenie nasłuchiwania przy odmontowaniu komponentu
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]); // Effect uruchamia się ponownie gdy zmieni się użytkownik

    // Udostępnianie funkcji i stanów wszystkim komponentom potomnym
    return (
        <RoutesContext.Provider 
            value={{ 
                routes,           // Lista tras
                setRoutes,        // Funkcja do ręcznej aktualizacji tras (rzadko używana)
                fetchRouteById,   // Funkcja do pobierania szczegółów trasy
                createRoute,      // Funkcja do tworzenia trasy (z adresami)
                startLiveRoute,   // Funkcja do rozpoczęcia trasy na żywo (z GPS)
                endLiveRoute,     // Funkcja do zakończenia trasy na żywo
                deleteRoute       // Funkcja do usuwania trasy
            }}
        >
            {children}
        </RoutesContext.Provider>
    );
}

export default RoutesProvider;
