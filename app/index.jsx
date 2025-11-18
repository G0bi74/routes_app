/**
 * Strona główna aplikacji (Home)
 * 
 * Strona powitalna z linkami do głównych sekcji aplikacji
 * Widoczna dla wszystkich użytkowników (zalogowanych i niezalogowanych)
 */

import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

// Importowanie themed components
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import ThemedLogo from '../components/ThemedLogo';
import Spacer from '../components/Spacer';

const Home = () => {
    return (
        <ThemedView style={styles.container}>
            {/* Logo aplikacji */}
            <ThemedLogo/>
            <Spacer height={20}/>

            {/* Tytuł aplikacji */}
            <ThemedText style={styles.title} title={true}>
                Aplikacja Tras #1
            </ThemedText>

            <Spacer height={10}/>
            
            {/* Opis */}
            <ThemedText>
                Zarządzaj swoimi trasami
            </ThemedText>
            
            <Spacer />
            
            {/* Linki nawigacyjne */}
            <Link href={"/login"} style={styles.link}>
                <ThemedText>Strona Logowania</ThemedText>
            </Link>
            
            <Link href={"/register"} style={styles.link}>
                <ThemedText>Strona Rejestracji</ThemedText>
            </Link>
        </ThemedView>
    );
}

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    }
});
