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
    query,
    where,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { useUser } from "../hooks/useUser";

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
            return null;
        }
    }

    /**
     * Funkcja do tworzenia nowej trasy
     * @param {Object} data - Dane nowej trasy (startAdress, startTime, date, endAdress, endTime, description)
     */
    async function createRoute(data){
        try {
            // Dodanie nowego dokumentu do kolekcji
            await addDoc(collection(db, COLLECTION_NAME), {
                ...data,                          // Dane trasy
                userId: user.uid,                 // ID użytkownika (właściciela trasy)
                createdAt: Timestamp.now()        // Timestamp utworzenia
            });
            
            console.log("Trasa została utworzona pomyślnie");
        } catch (error) {
            console.log("Błąd tworzenia trasy:", error.message);
            throw error;
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
            // Jeśli użytkownik jest zalogowany, tworzymy zapytanie o jego trasy
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", user.uid)  // Tylko trasy tego użytkownika
            );

            // Nasłuchiwanie zmian w czasie rzeczywistym
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const routesData = [];
                
                // Iteracja po wszystkich dokumentach w wyniku zapytania
                querySnapshot.forEach((doc) => {
                    routesData.push({
                        id: doc.id,           // ID dokumentu
                        ...doc.data()         // Dane dokumentu
                    });
                });
                
                // Aktualizacja stanu z pobranymi trasami
                setRoutes(routesData);
                console.log("Pobrano trasy:", routesData.length);
            });
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
                createRoute,      // Funkcja do tworzenia trasy
                deleteRoute       // Funkcja do usuwania trasy
            }}
        >
            {children}
        </RoutesContext.Provider>
    );
}

export default RoutesProvider;
