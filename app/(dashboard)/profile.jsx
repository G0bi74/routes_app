/**
 * Ekran profilu użytkownika (Profile)
 * 
 * Wyświetla informacje o zalogowanym użytkowniku
 * Umożliwia wylogowanie się z aplikacji
 */

import { StyleSheet } from 'react-native';
import { useUser } from '../../hooks/useUser';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';

const Profile = () => {
    // Pobranie danych użytkownika i funkcji wylogowania
    const { logout, user } = useUser();

    return(
        <ThemedView style={styles.container}>
            {/* Wyświetlenie emaila użytkownika */}
            <ThemedText title={true} style={styles.heading}>
                {user.email} 
            </ThemedText>
            
            <Spacer/>
            
            
            <ThemedText>
                Czas na planowanie tras...
            </ThemedText>    
            
            <Spacer/>

            {/* Przycisk wylogowania */}
            <ThemedButton onPress={logout}>
                <ThemedText style={{color: '#f2f2f2'}}>Wyloguj</ThemedText>
            </ThemedButton>
        </ThemedView>
    );
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    }
});
