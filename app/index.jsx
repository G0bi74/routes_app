/**
 * Strona główna aplikacji (Splash/Router)
 * 
 * Automatycznie przekierowuje użytkownika:
 * - Zalogowany → profil
 * - Niezalogowany → logowanie
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '../hooks/useUser';
import ThemedLoader from '../components/ThemedLoader';

const Home = () => {
    const { user, authChecked } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Czekaj aż sprawdzimy stan uwierzytelnienia
        if (!authChecked) return;

        // Przekieruj w zależności od stanu zalogowania
        if (user) {
            router.replace('/profile');
        } else {
            router.replace('/login');
        }
    }, [user, authChecked]);

    // Wyświetl loader podczas sprawdzania stanu uwierzytelnienia
    return <ThemedLoader />;
}

export default Home;
