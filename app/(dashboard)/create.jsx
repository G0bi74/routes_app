/**
 * Ekran tworzenia nowej trasy (Create)
 * 
 * Formularz do wprowadzania danych o nowej trasie:
 * - Adres początku trasy
 * - Adres końca trasy
 * - Opis (opcjonalnie)
 * 
 * Aplikacja automatycznie:
 * - Geokoduje adresy (zamienia na współrzędne)
 * - Oblicza odległość drogową między punktami
 * - Zapisuje wszystkie dane w Firestore
 */

import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
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
    // Stany dla pól formularza
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pobranie funkcji tworzenia trasy z kontekstu
    const { createRoute } = useRoutes();
    const router = useRouter();

    /**
     * Obsługa submitowania formularza
     * 
     * Proces:
     * 1. Walidacja pól
     * 2. Wywołanie createRoute (geokodowanie + obliczanie odległości)
     * 3. Przekierowanie do historii
     */
    const handleSubmit = async () => {
        // Czyszczenie poprzedniego błędu
        setError(null);

        // Walidacja - sprawdzenie czy adresy są wypełnione
        if (!startAddress.trim() || !endAddress.trim()) {
            setError("Musisz podać oba adresy");
            return;
        }

        // Ustawienie stanu ładowania
        setLoading(true);

        try {
            // Utworzenie nowej trasy (geokodowanie + routing + zapis)
            await createRoute({
                startAddress: startAddress.trim(),
                endAddress: endAddress.trim(),
                description: description.trim() || "Brak opisu"
            });

            // Pokazanie komunikatu sukcesu
            Alert.alert(
                "Sukces!",
                "Trasa została utworzona pomyślnie",
                [{ text: "OK" }]
            );

            // Resetowanie formularza
            setStartAddress("");
            setEndAddress("");
            setDescription("");

            // Przekierowanie do historii tras
            router.replace('/history');

        } catch (error) {
            console.error("Błąd tworzenia trasy:", error);
            // Wyświetlenie błędu użytkownikowi
            setError(error.message || "Wystąpił błąd podczas tworzenia trasy");
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
                
                <Spacer height={10} />
                
                {/* Podtytuł z informacją */}
                <ThemedText style={styles.subtitle}>
                    Odległość zostanie obliczona automatycznie
                </ThemedText>
                
                <Spacer height={20} />
                
                {/* Pole: Adres początku trasy */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Adres początku (np. Warszawa, Marszałkowska 1)"
                    value={startAddress}
                    onChangeText={setStartAddress}
                    editable={!loading}
                />
                
                <Spacer height={15} />

                {/* Pole: Adres końca trasy */}
                <ThemedTextInput
                    style={styles.input}
                    placeholder="Adres końca (np. Kraków, Rynek Główny)"
                    value={endAddress}
                    onChangeText={setEndAddress}
                    editable={!loading}
                />
                
                <Spacer height={15} />

                {/* Pole: Opis (opcjonalne) */}
                <ThemedTextInput
                    style={styles.multiline}
                    placeholder="Opis trasy (opcjonalnie)"
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    editable={!loading}
                />
                
                <Spacer height={20} />

                {/* Wyświetlenie błędu jeśli wystąpił */}
                {error && (
                    <>
                        <ThemedText style={styles.error}>
                            {error}
                        </ThemedText>
                        <Spacer height={10} />
                    </>
                )}

                {/* Przycisk tworzenia trasy */}
                <ThemedButton onPress={handleSubmit} disabled={loading}>
                    <Text style={{color: "#fff", textAlign: 'center'}}>
                        {loading ? "Obliczanie trasy..." : "Utwórz trasę"}
                    </Text>
                </ThemedButton>

                {/* Info o czasie oczekiwania */}
                {loading && (
                    <>
                        <Spacer height={10} />
                        <ThemedText style={styles.loadingInfo}>
                            Może to potrwać kilka sekund...
                        </ThemedText>
                    </>
                )}
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
        paddingHorizontal: 20,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    input: {
        padding: 20,
        borderRadius: 6,
        alignSelf: 'stretch',
        marginHorizontal: 20,
        fontSize: 16,
    },  
    multiline: {
        padding: 20,
        borderRadius: 6,
        minHeight: 100,
        alignSelf: 'stretch',
        marginHorizontal: 20,
        fontSize: 16,
    },
    error: {
        color: '#cc475a',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    loadingInfo: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.6,
    }
});
