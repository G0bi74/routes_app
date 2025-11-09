/**
 * Hook useRoutes - Uproszczony dostęp do kontekstu tras
 * 
 * Ten hook pozwala na łatwe korzystanie z funkcji i danych tras
 * w dowolnym komponencie bez konieczności importowania useContext i RoutesContext
 */

import { useContext } from "react";
import { RoutesContext } from "../context/RoutesContext";

/**
 * Niestandardowy hook do dostępu do kontekstu tras
 * @returns {Object} Obiekt zawierający:
 *   - routes: tablica wszystkich tras użytkownika
 *   - setRoutes: funkcja do ręcznej aktualizacji tras
 *   - fetchRouteById: funkcja do pobierania szczegółów trasy
 *   - createRoute: funkcja do tworzenia nowej trasy
 *   - deleteRoute: funkcja do usuwania trasy
 * @throws {Error} Jeśli użyty poza RoutesProvider
 */
export function useRoutes() {
    // Pobieranie kontekstu tras
    const context = useContext(RoutesContext);
    
    // Sprawdzenie czy hook jest używany wewnątrz providera
    if (!context){
        throw new Error("useRoutes musi być użyty wewnątrz RoutesProvider");
    }
    
    return context;
}
