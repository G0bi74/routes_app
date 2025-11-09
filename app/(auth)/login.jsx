/**
 * Ekran logowania (Login)
 * 
 * Umożliwia użytkownikowi zalogowanie się do aplikacji
 * Pola: email, hasło
 * Zawiera link do strony rejestracji
 */

import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';

// Importowanie themed components
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';
import { Colors } from '../../constants/Colors';

const Login = () => {
    // Stany dla pól formularza
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Pobranie funkcji logowania z kontekstu
    const { login } = useUser();

    /**
     * Obsługa submitowania formularza logowania
     */
    const handleSubmit = async () => {
        // Czyszczenie poprzedniego błędu
        setError(null);
        
        try {
            // Próba zalogowania użytkownika
            await login(email, password);
            // Po udanym logowaniu, użytkownik zostanie automatycznie przekierowany
        } catch (error) {
            // Wyświetlenie błędu użytkownikowi
            setError(error.message);
        }    
    }

    return (
        // TouchableWithoutFeedback - ukrywa klawiaturę po kliknięciu poza polem
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <Spacer />
                
                {/* Tytuł strony */}
                <ThemedText title={true} style={styles.title}>
                    Zaloguj się do konta
                </ThemedText>

                {/* Pole Email */}
                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder='Email'
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                />

                {/* Pole Hasło */}
                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder='Hasło'
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry  // Ukrycie wpisywanego hasła
                />
                
                {/* Przycisk logowania */}
                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: '#f2f2f2'}}>Zaloguj</Text>
                </ThemedButton>
                
                <Spacer />
                
                {/* Wyświetlenie błędu jeśli wystąpił */}
                {error && <ThemedText style={styles.error}>{error}</ThemedText>}

                <Spacer height={100}/>
                
                {/* Link do strony rejestracji */}
                <Link href={'/register'}>
                    <ThemedText style={{textAlign: 'center'}}>
                        Zarejestruj się zamiast tego
                    </ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 30,
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 30
    }
});
