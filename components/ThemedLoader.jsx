/**
 * Komponent ThemedLoader - Wskaźnik ładowania
 * 
 * Wyświetla kręcący się spinner podczas ładowania danych
 * Używa głównego koloru aplikacji
 */

import { ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import ThemedView from '../components/ThemedView';

/**
 * Wyświetla spinner na środku ekranu
 */
const ThemedLoader = () => {
    return (
        <ThemedView style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <ActivityIndicator 
                size="large" 
                color={Colors.primary}  // Kolor główny aplikacji
            />
        </ThemedView>
    );
}

export default ThemedLoader;
