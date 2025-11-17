/**
 * Ekran tworzenia nowej trasy (Create)
 * 
 * Dwa tryby tworzenia tras:
 * 1. Tryb manualny - wpisywanie adresów początku i końca
 * 2. Tryb GPS - automatyczne pobieranie lokalizacji z telefonu
 * 
 * W trybie GPS:
 * - Rozpoczęcie trasy pobiera aktualną lokalizację jako start
 * - Trasa zapisywana ze statusem "in-progress"
 * - Użytkownik może zakończyć trasę później
 * - Przy zakończeniu pobierana jest lokalizacja końcowa i obliczana odległość
 */

import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Alert, View } from 'react-native';
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
    // Stany dla pól formularza (tryb manualny)
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stan dla trybu GPS
    const [liveRouteId, setLiveRouteId] = useState(null); // ID rozpoczętej trasy GPS

    // Pobranie funkcji z kontekstu
    const { createRoute, startLiveRoute, endLiveRoute } = useRoutes();
    const router = useRouter();

    /**
     * Obsługa submitowania formularza (tryb manualny)
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

    /**
     * Obsługa rozpoczęcia trasy GPS
     * 
     * Proces:
     * 1. Pobranie aktualnej lokalizacji GPS
     * 2. Reverse geocoding (współrzędne -> adres)
     * 3. Zapis trasy ze statusem "in-progress"
     */
    const handleStartLiveRoute = async () => {
        setError(null);
        setLoading(true);

        try {
            // Rozpoczęcie trasy na żywo
            const routeId = await startLiveRoute(
                description.trim() || "Trasa na żywo"
            );

            // Zapisanie ID trasy
            setLiveRouteId(routeId);

            // Pokazanie komunikatu
            Alert.alert(
                "Trasa rozpoczęta!",
                "Lokalizacja początkowa została zapisana. Możesz teraz zakończyć trasę w dowolnym momencie.",
                [{ text: "OK" }]
            );

            // Resetowanie opisu
            setDescription("");

        } catch (error) {
            console.error("Błąd rozpoczynania trasy GPS:", error);
            
            // Szczegółowy komunikat dla uprawnień Firebase
            if (error.message.includes('Firebase') || error.message.includes('uprawnień do zapisu')) {
                setError('Błąd Firebase: Sprawdź reguły bezpieczeństwa w konsoli Firebase. Zobacz plik FIREBASE_PERMISSIONS_FIX.md');
            } else {
                setError(error.message || "Nie można rozpocząć trasy GPS");
            }
        } finally {
            setLoading(false);
        }
    }

    /**
     * Obsługa zakończenia trasy GPS
     * 
     * Proces:
     * 1. Pobranie aktualnej lokalizacji GPS
     * 2. Reverse geocoding
     * 3. Obliczenie odległości
     * 4. Aktualizacja trasy ze statusem "completed"
     */
    const handleEndLiveRoute = async () => {
        if (!liveRouteId) {
            setError("Nie ma rozpoczętej trasy do zakończenia");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Zakończenie trasy
            await endLiveRoute(liveRouteId);

            // Pokazanie komunikatu sukcesu
            Alert.alert(
                "Trasa zakończona!",
                "Trasa została pomyślnie zapisana z obliczoną odległością.",
                [{ text: "OK" }]
            );

            // Resetowanie stanu
            setLiveRouteId(null);

            // Przekierowanie do historii
            router.replace('/history');

        } catch (error) {
            console.error("Błąd kończenia trasy GPS:", error);
            setError(error.message || "Nie można zakończyć trasy GPS");
        } finally {
            setLoading(false);
        }
    }

    return(
        // TouchableWithoutFeedback - ukrywa klawiaturę po kliknięciu poza polem
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <ThemedText title={true} style={styles.heading}>
                    Utwórz nową trasę
                </ThemedText>
                
                <Spacer height={20} />

                {/* Sekcja GPS - Trasa na żywo */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                        📍 Tryb GPS - Trasa na żywo
                    </ThemedText>
                    
                    <Spacer height={10} />
                    
                    <ThemedText style={styles.subtitle}>
                        {liveRouteId 
                            ? "Trasa w trakcie - zakończ ją aby zapisać" 
                            : "Użyj GPS aby automatycznie zapisać lokalizację"}
                    </ThemedText>
                    
                    <Spacer height={15} />

                    {/* Pole opisu dla trasy GPS */}
                    {!liveRouteId && (
                        <>
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Opis trasy (opcjonalnie)"
                                value={description}
                                onChangeText={setDescription}
                                editable={loading !== true}
                            />
                            <Spacer height={15} />
                        </>
                    )}

                    {/* Przyciski GPS */}
                    {!liveRouteId ? (
                        <ThemedButton 
                            onPress={handleStartLiveRoute} 
                            disabled={loading === true}
                            style={styles.gpsButton}
                        >
                            <Text style={{color: "#fff", textAlign: 'center', fontSize: 16}}>
                                {loading ? "Pobieranie lokalizacji..." : "📍 Rozpocznij trasę GPS"}
                            </Text>
                        </ThemedButton>
                    ) : (
                        <ThemedButton 
                            onPress={handleEndLiveRoute} 
                            disabled={loading === true}
                            style={styles.endButton}
                        >
                            <Text style={{color: "#fff", textAlign: 'center', fontSize: 16}}>
                                {loading ? "Kończenie trasy..." : "✓ Zakończ trasę GPS"}
                            </Text>
                        </ThemedButton>
                    )}
                </View>

                <Spacer height={30} />

                {/* Separator */}
                <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <ThemedText style={styles.separatorText}>LUB</ThemedText>
                    <View style={styles.separatorLine} />
                </View>

                <Spacer height={30} />

                {/* Sekcja Manualna - Wpisywanie adresów */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                        ✏️ Tryb manualny - Wpisz adresy
                    </ThemedText>
                    
                    <Spacer height={10} />
                    
                    <ThemedText style={styles.subtitle}>
                        Odległość zostanie obliczona automatycznie
                    </ThemedText>
                    
                    <Spacer height={15} />
                    
                    {/* Pole: Adres początku trasy */}
                    <ThemedTextInput
                        style={styles.input}
                        placeholder="Adres początku (np. Warszawa, Marszałkowska 1)"
                        value={startAddress}
                        onChangeText={setStartAddress}
                        editable={loading !== true && !liveRouteId}
                    />
                    
                    <Spacer height={15} />

                    {/* Pole: Adres końca trasy */}
                    <ThemedTextInput
                        style={styles.input}
                        placeholder="Adres końca (np. Kraków, Rynek Główny)"
                        value={endAddress}
                        onChangeText={setEndAddress}
                        editable={loading !== true && !liveRouteId}
                    />
                    
                    <Spacer height={15} />

                    {/* Przycisk tworzenia trasy manualnej */}
                    <ThemedButton 
                        onPress={handleSubmit} 
                        disabled={loading === true || !!liveRouteId}
                    >
                        <Text style={{color: "#fff", textAlign: 'center'}}>
                            {loading ? "Obliczanie trasy..." : "Utwórz trasę"}
                        </Text>
                    </ThemedButton>
                </View>

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

                {/* Info o czasie oczekiwania */}
                {loading && (
                    <>
                        <ThemedText style={styles.loadingInfo}>
                            Może to potrwać kilka sekund...
                        </ThemedText>
                        <Spacer height={10} />
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
        fontSize: 24,
        textAlign: 'center',
    },
    section: {
        width: '100%',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
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
    gpsButton: {
        backgroundColor: '#4CAF50', // Zielony dla GPS
    },
    endButton: {
        backgroundColor: '#2196F3', // Niebieski dla zakończenia
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
        opacity: 0.3,
    },
    separatorText: {
        marginHorizontal: 10,
        fontSize: 12,
        opacity: 0.5,
        fontWeight: 'bold',
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
