/**
 * UserContext - Kontekst dla zarządzania stanem użytkownika
 * 
 * Ten plik zawiera logikę uwierzytelniania użytkowników:
 * - Rejestracja nowych użytkowników
 * - Logowanie istniejących użytkowników
 * - Wylogowywanie
 * - Sprawdzanie czy użytkownik jest zalogowany przy starcie aplikacji
 */

import { createContext, useEffect, useState } from "react";
import { auth } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Tworzenie kontekstu - pozwala na udostępnianie stanu użytkownika w całej aplikacji
export const UserContext = createContext();

/**
 * Provider dla kontekstu użytkownika
 * Opakowuje całą aplikację i udostępnia funkcje oraz stan użytkownika
 */
export function UserProvider({ children }){
    // Stan przechowujący informacje o zalogowanym użytkowniku (null jeśli niezalogowany)
    const [user, setUser] = useState(null);
    
    // Stan informujący czy sprawdziliśmy już czy użytkownik jest zalogowany
    const [authChecked, setAuthChecked] = useState(false);

    /**
     * Funkcja do logowania użytkownika
     * @param {string} email - Email użytkownika
     * @param {string} password - Hasło użytkownika
     * @throws {Error} Jeśli logowanie się nie powiedzie
     */
    async function login(email, password){
        try {
            // Logowanie przez Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Zapisanie danych użytkownika w state
            setUser(userCredential.user);
        } catch (error) {
            // Rzucamy błąd z wiadomością do wyświetlenia użytkownikowi
            throw Error(error.message);
        } 
    }

    /**
     * Funkcja do rejestracji nowego użytkownika
     * @param {string} email - Email użytkownika
     * @param {string} password - Hasło użytkownika
     * @throws {Error} Jeśli rejestracja się nie powiedzie
     */
    async function register(email, password){
        try {
            // Tworzenie nowego użytkownika w Firebase
            await createUserWithEmailAndPassword(auth, email, password);
            // Automatyczne logowanie po rejestracji
            await login(email, password);
        } catch (error) {
            throw Error(error.message);
        }
    }

    /**
     * Funkcja do wylogowania użytkownika
     */
    async function logout(){
        try {
            // Wylogowanie przez Firebase
            await signOut(auth);
            // Czyszczenie stanu użytkownika
            setUser(null);
        } catch (error) {
            console.log("Błąd wylogowania:", error.message);
        }
    }

    /**
     * Sprawdzanie stanu uwierzytelnienia przy starcie aplikacji
     * Nasłuchuje zmian w stanie uwierzytelnienia
     */
    useEffect(() => {
        // onAuthStateChanged zwraca funkcję czyszczącą (unsubscribe)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Aktualizacja stanu użytkownika (null jeśli wylogowany)
            setUser(currentUser);
            // Oznaczamy że sprawdziliśmy stan uwierzytelnienia
            setAuthChecked(true);
        });

        // Czyszczenie nasłuchiwania przy odmontowaniu komponentu
        return () => unsubscribe();
    }, []);

    // Udostępnianie funkcji i stanów wszystkim komponentom potomnym
    return(
        <UserContext.Provider value={{ user, login, register, logout, authChecked }}>
            {children}
        </UserContext.Provider>
    );
}
