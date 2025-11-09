/**
 * Hook useUser - Uproszczony dostęp do kontekstu użytkownika
 * 
 * Ten hook pozwala na łatwe korzystanie z funkcji i danych użytkownika
 * w dowolnym komponencie bez konieczności importowania useContext i UserContext
 */

import { useContext } from "react";
import { UserContext } from "../context/UserContext";

/**
 * Niestandardowy hook do dostępu do kontekstu użytkownika
 * @returns {Object} Obiekt zawierający:
 *   - user: dane zalogowanego użytkownika (lub null)
 *   - login: funkcja do logowania
 *   - register: funkcja do rejestracji
 *   - logout: funkcja do wylogowania
 *   - authChecked: czy sprawdzono stan uwierzytelnienia
 * @throws {Error} Jeśli użyty poza UserProvider
 */
export function useUser() {
    // Pobieranie kontekstu użytkownika
    const context = useContext(UserContext);
    
    // Sprawdzenie czy hook jest używany wewnątrz providera
    if (!context){
        throw new Error("useUser musi być użyty wewnątrz UserProvider");
    }
    
    return context;
}
