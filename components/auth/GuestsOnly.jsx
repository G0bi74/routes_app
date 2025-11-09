/**
 * Komponent GuestsOnly - Ochrona tras tylko dla niezalogowanych użytkowników
 * 
 * Ten komponent sprawdza czy użytkownik jest niezalogowany.
 * Jeśli użytkownik jest zalogowany, przekierowuje go do profilu.
 * Używany dla stron: login, register
 */

import { useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useRouter } from 'expo-router';
import ThemedLoader from '../ThemedLoader';

/**
 * @param {React.ReactNode} children - Komponenty potomne do wyświetlenia
 */
const GuestsOnly = ({ children }) => {
    // Pobieranie informacji o użytkowniku i stanie uwierzytelnienia
    const {user, authChecked} = useUser();
    const router = useRouter();

    // Sprawdzanie czy użytkownik jest zalogowany
    useEffect(() => {
        // Jeśli sprawdziliśmy stan uwierzytelnienia i użytkownik jest zalogowany
        if ( authChecked && user !== null ) {
            // Przekieruj do profilu
            router.replace('/profile');
        }
    }, [user, authChecked]);

    // Pokazuj loader dopóki nie sprawdzimy stanu lub użytkownik jest zalogowany
    if (!authChecked || user){
        return <ThemedLoader />;
    }

    // Jeśli użytkownik niezalogowany, pokaż stronę
    return children;
}

export default GuestsOnly;
