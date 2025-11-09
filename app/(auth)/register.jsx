/**
 * Ekran rejestracji (Register)
 * 
 * Umożliwia użytkownikowi utworzenie nowego konta
 * Pola: email, hasło
 * Zawiera link do strony logowania
 */

import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../hooks/useUser';

// Importowanie themed components
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';

const Register = () => {
    // Stany dla pól formularza
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Pobranie funkcji rejestracji z kontekstu
    const { register } = useUser();

    /**
     * Obsługa submitowania formularza rejestracji
     */
    const handleSubmit = async () => {
        // Czyszczenie poprzedniego błędu
        setError(null);
        
        try {
            // Próba zarejestrowania użytkownika
            await register(email, password);
            // Po udanej rejestracji, użytkownik zostanie automatycznie zalogowany i przekierowany
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
                    Zarejestruj nowe konto
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

                {/* Przycisk rejestracji */}
                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: '#f2f2f2'}}>Zarejestruj</Text>
                </ThemedButton>

                <Spacer />
                
                {/* Wyświetlenie błędu jeśli wystąpił */}
                {error && <ThemedText style={styles.error}>{error}</ThemedText>}

                <Spacer height={100}/>
                
                {/* Link do strony logowania */}
                <Link href={'/login'}>
                    <ThemedText style={{textAlign: 'center'}}>
                        Zaloguj się zamiast tego
                    </ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

export default Register;

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
