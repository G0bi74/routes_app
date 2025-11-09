/**
 * Komponent UserOnly - Ochrona tras tylko dla zalogowanych użytkowników
 * 
 * Ten komponent sprawdza czy użytkownik jest zalogowany.
 * Jeśli użytkownik nie jest zalogowany, przekierowuje go do strony logowania.
 * Używany dla stron: profile, create, history, szczegóły trasy
 */

import { useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { useRouter } from 'expo-router';
import ThemedLoader from '../ThemedLoader';

/**
 * @param {React.ReactNode} children - Komponenty potomne do wyświetlenia
 */
const UserOnly = ({ children }) => {
    // Pobieranie informacji o użytkowniku i stanie uwierzytelnienia
    const {user, authChecked} = useUser();
    const router = useRouter();

    // Sprawdzanie czy użytkownik jest zalogowany
    useEffect(() => {
        // Jeśli sprawdziliśmy stan uwierzytelnienia i użytkownik nie jest zalogowany
        if ( authChecked && user === null ) {
            // Przekieruj do strony logowania
            router.replace('/login');
        }
    }, [user, authChecked]);

    // Pokazuj loader dopóki nie sprawdzimy stanu lub użytkownik nie jest zalogowany
    if (!authChecked || !user){
        return <ThemedLoader />;
    }

    // Jeśli użytkownik zalogowany, pokaż stronę
    return children;
}

export default UserOnly;
