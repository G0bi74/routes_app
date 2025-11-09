/**
 * Ekran tworzenia nowej trasy (Create)
 * 
 * Formularz do wprowadzania danych o nowej trasie:
 * - Adres początku trasy
 * - Godzina rozpoczęcia
 * - Data
 * - Adres końca trasy
 * - Godzina zakończenia
 * - Opis
 */

import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRoutes } from '../../hooks/useRoutes';
import { useRouter } from 'expo-router';
import { useState } from 'react';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';

const Create = () => {
    // Stany dla wszystkich pól formularza
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [startAdress, setStartAdress] = useState("");
    const [startTime, setStartTime] = useState("");
    const [date, setDate] = useState("");
    const [endAdress, setEndAdress] = useState("");
    const [endTime, setEndTime] = useState("");

    // Pobranie funkcji tworzenia trasy z kontekstu
    const { createRoute } = useRoutes();
    const router = useRouter();

    /**
     * Obsługa submitowania formularza
     * Sprawdza czy wszystkie pola są wypełnione, tworzy trasę i przekierowuje
     */
    const handleSubmit = async () => {
        // Walidacja - sprawdzenie czy wszystkie pola są wypełnione
        if (!startAdress.trim() || !startTime.trim() || !date.trim() || 
            !endAdress.trim() || !endTime.trim() || !description.trim()) {
            return;
        }

        // Ustawienie stanu ładowania
        setLoading(true);

        try {
            // Utworzenie nowej trasy w bazie danych
            await createRoute({
                startAdress,
                startTime,
                date,
                endAdress,
                endTime,
                description
            });

            // Resetowanie formularza
            setStartAdress("");
            setStartTime("");
            setDate("");
            setEndAdress("");
            setEndTime("");
            setDescription("");

            // Przekierowanie do historii tras
            router.replace('/history');
        } catch (error) {
            console.log("Błąd tworzenia trasy:", error);
        } finally {
            // Resetowanie stanu ładowania
            setLoading(false);
        }
    }

    return(
        // TouchableWithoutFeedback - ukrywa klawiaturę po kliknięciu poza polem
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                {/* Tytuł strony */}
                <ThemedText title={true} style={styles.heading}>
                    Utwórz nową trasę
                </ThemedText>
                <Spacer />
                
                {/* Pole: Adres początku trasy */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Adres Początku Trasy"
                    value={startAdress}
                    onChangeText={setStartAdress}
                />
                <Spacer />

                {/* Pole: Godzina rozpoczęcia */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Godzina Rozpoczęcia"
                    value={startTime}
                    onChangeText={setStartTime}
                />
                <Spacer />

                {/* Pole: Data */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Data"
                    value={date}
                    onChangeText={setDate}
                />
                <Spacer />

                {/* Pole: Adres końca trasy */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Adres końca Trasy"
                    value={endAdress}
                    onChangeText={setEndAdress}
                />
                <Spacer />

                {/* Pole: Godzina zakończenia */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Godzina Zakończenia"
                    value={endTime}
                    onChangeText={setEndTime}
                />
                <Spacer />

                {/* Pole: Opis (wieloliniowe) */}
                <ThemedTextInput
                    style={styles.multiline}
                    placeholder="Opis"
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                />
                <Spacer />

                {/* Przycisk tworzenia trasy */}
                <ThemedButton onPress={handleSubmit} disabled={loading}>
                    <Text style={{color: "#fff"}}>
                        {loading ? "Zapisywanie..." : "Tworzenie Trasy"}
                    </Text>
                </ThemedButton>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

export default Create;

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
    },
    input: {
        padding: 20,
        borderRadius: 6,
        alignSelf: 'stretch',
        marginHorizontal: 40,
    },  
    multiline: {
        padding: 20,
        borderRadius: 6,
        minHeight: 100,
        alignSelf: 'stretch',
        marginHorizontal: 40,
    },
});
