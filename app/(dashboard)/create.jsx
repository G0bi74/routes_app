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
import { useOcr } from '../../hooks/useOcr';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import ImagePickerWithCrop from '../../components/ImagePickerWithCrop';

const Create = () => {
    // Stany dla pól formularza (tryb manualny)
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stan dla trybu GPS
    const [liveRouteId, setLiveRouteId] = useState(null); // ID rozpoczętej trasy GPS

    // Stan dla pokazywania/ukrywania formularza manualnego
    const [showManualForm, setShowManualForm] = useState(false);
    
    // Stany dla daty i godzin (tryb manualny)
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Stany dla zdjęć
    const [startPhotoUri, setStartPhotoUri] = useState(null);
    const [endPhotoUri, setEndPhotoUri] = useState(null);
    
    // Stany dla przebiegów z OCR
    const [startMileage, setStartMileage] = useState(null);
    const [endMileage, setEndMileage] = useState(null);

    // Pobranie funkcji z kontekstu
    const { createRoute, startLiveRoute, endLiveRoute, routes, fetchRouteById } = useRoutes();
    const { recognizeText, isProcessing } = useOcr();
    const router = useRouter();

    /**
     * Effect - sprawdza czy trasa w trakcie nadal istnieje
     * Uruchamia się gdy użytkownik wraca na ekran
     */
    useFocusEffect(
        React.useCallback(() => {
            async function checkLiveRoute() {
                if (liveRouteId) {
                    try {
                        const route = await fetchRouteById(liveRouteId);
                        // Jeśli trasa została zakończona lub nie istnieje, zresetuj ID
                        if (!route || route.status !== 'in-progress') {
                            setLiveRouteId(null);
                        }
                    } catch (error) {
                        // Jeśli nie można pobrać trasy, zresetuj ID
                        setLiveRouteId(null);
                    }
                }
            }
            checkLiveRoute();
        }, [liveRouteId, fetchRouteById])
    );

    /**
     * Effect - automatycznie wykrywa trasy w trakcie przy montowaniu
     */
    useEffect(() => {
        // Znajdź trasę w trakcie jeśli istnieje
        const inProgressRoute = routes.find(r => r.status === 'in-progress');
        if (inProgressRoute && !liveRouteId) {
            setLiveRouteId(inProgressRoute.id);
        } else if (!inProgressRoute && liveRouteId) {
            setLiveRouteId(null);
        }
    }, [routes]);

    /**
     * Obsługa submitowania formularza (tryb manualny)
     * 
     * Proces:
     * 1. Walidacja pól
     * 2. Parsowanie daty i godzin jeśli podane
     * 3. Wywołanie createRoute (geokodowanie + obliczanie odległości)
     * 4. Przekierowanie do historii
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
            // Przygotowanie danych do zapisu
            const routeData = {
                startAddress: startAddress.trim(),
                endAddress: endAddress.trim(),
                description: description.trim() || "Brak opisu"
            };

            // Jeśli podano datę i godziny, parsuj je
            if (startDate && startTime && endTime) {
                try {
                    // Format daty: DD.MM.YYYY lub DD/MM/YYYY
                    const [day, month, year] = startDate.split(/[./]/).map(num => parseInt(num));
                    
                    // Format godziny: HH:MM
                    const [startHour, startMinute] = startTime.split(':').map(num => parseInt(num));
                    const [endHour, endMinute] = endTime.split(':').map(num => parseInt(num));

                    // Utworzenie obiektów Date
                    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
                    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

                    // Walidacja dat
                    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                        throw new Error("Nieprawidłowy format daty lub godziny");
                    }

                    if (endDateTime <= startDateTime) {
                        throw new Error("Godzina zakończenia musi być później niż rozpoczęcia");
                    }

                    // Dodanie do danych trasy
                    routeData.createdAt = Timestamp.fromDate(startDateTime);
                    routeData.startedAt = Timestamp.fromDate(startDateTime);
                    routeData.completedAt = Timestamp.fromDate(endDateTime);
                    routeData.status = "completed";
                    
                } catch (dateError) {
                    setError(dateError.message || "Błąd parsowania daty/godziny. Użyj formatów: DD.MM.YYYY i HH:MM");
                    setLoading(false);
                    return;
                }
            }

            // Utworzenie nowej trasy (geokodowanie + routing + zapis)
            await createRoute(routeData);

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
            setStartDate("");
            setStartTime("");
            setEndTime("");
            setShowManualForm(false);

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
     * 1. Otwiera aparat do zrobienia zdjęcia
     * 2. Po zrobieniu zdjęcia pobiera lokalizację GPS
     * 3. Reverse geocoding (współrzędne -> adres)
     * 4. Zapis trasy ze statusem "in-progress"
     */
    const handleStartLiveRoute = async (photoUri) => {
        setError(null);
        setLoading(true);

        try {
            // Rozpoznaj stan licznika ze zdjęcia
            let mileageOcr = null;
            if (photoUri) {
                console.log('Rozpoczynam rozpoznawanie OCR...');
                const ocrResult = await recognizeText(photoUri);
                
                if (ocrResult.success && ocrResult.mileage) {
                    mileageOcr = ocrResult.mileage;
                    setStartMileage(mileageOcr);
                    console.log(`Wykryto stan licznika początkowy: ${mileageOcr} km`);
                } else {
                    console.log('Nie wykryto stanu licznika na zdjęciu');
                }
            }
            
            // Rozpoczęcie trasy na żywo ze zdjęciem i stanem licznika
            const routeId = await startLiveRoute(
                description.trim() || "Trasa na żywo",
                photoUri,
                mileageOcr
            );

            // Zapisanie ID trasy
            setLiveRouteId(routeId);

            // Pokazanie komunikatu
            const message = mileageOcr 
                ? `Lokalizacja początkowa, zdjęcie i stan licznika (${mileageOcr} km) zostały zapisane. Możesz teraz zakończyć trasę w dowolnym momencie.`
                : "Lokalizacja początkowa i zdjęcie zostały zapisane. Możesz teraz zakończyć trasę w dowolnym momencie.";
            
            Alert.alert(
                "Trasa rozpoczęta!",
                message,
                [{ text: "OK" }]
            );

            // Resetowanie formularza
            setDescription("");
            setStartPhotoUri(null);

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
     * 1. Otwiera aparat do zrobienia zdjęcia końca
     * 2. Po zrobieniu zdjęcia pobiera lokalizację GPS
     * 3. Reverse geocoding
     * 4. Obliczenie odległości
     * 5. Aktualizacja trasy ze statusem "completed"
     */
    const handleEndLiveRoute = async (photoUri) => {
        if (!liveRouteId) {
            setError("Nie ma rozpoczętej trasy do zakończenia");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Rozpoznaj stan licznika ze zdjęcia
            let mileageOcr = null;
            if (photoUri) {
                console.log('Rozpoczynam rozpoznawanie OCR...');
                const ocrResult = await recognizeText(photoUri);
                
                if (ocrResult.success && ocrResult.mileage) {
                    mileageOcr = ocrResult.mileage;
                    setEndMileage(mileageOcr);
                    console.log(`Wykryto stan licznika końcowy: ${mileageOcr} km`);
                } else {
                    console.log('Nie wykryto stanu licznika na zdjęciu');
                }
            }
            
            // Zakończenie trasy ze zdjęciem i stanem licznika
            await endLiveRoute(liveRouteId, photoUri, mileageOcr);

            // Oblicz odległość ze stanów licznika jeśli oba są dostępne
            let message = "Trasa została pomyślnie zapisana ze zdjęciem końca i obliczoną odległością.";
            
            if (startMileage && mileageOcr) {
                const mileageDistance = mileageOcr - startMileage;
                if (mileageDistance > 0) {
                    message = `Trasa zakończona!\n\nStan licznika:\n- Początek: ${startMileage} km\n- Koniec: ${mileageOcr} km\n- Przejechano: ${mileageDistance} km`;
                }
            }

            // Pokazanie komunikatu sukcesu
            Alert.alert(
                "Trasa zakończona!",
                message,
                [{ text: "OK" }]
            );

            // Resetowanie stanu
            setLiveRouteId(null);
            setEndPhotoUri(null);
            setStartMileage(null);
            setEndMileage(null);

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
            <ThemedView safe={true} style={styles.container}>
                <ThemedText title={true} style={styles.heading}>
                    Utwórz nową trasę
                </ThemedText>
                
                <Spacer height={15} />

                {/* Sekcja GPS - Trasa na żywo */}
                {!showManualForm && (
                    <>
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>
                                Tryb GPS
                            </ThemedText>
                            
                            <Spacer height={8} />
                            
                            <ThemedText style={styles.subtitle}>
                                {liveRouteId 
                                    ? "Trasa w trakcie - zakończ ją" 
                                    : "Automatyczne zapisywanie lokalizacji"}
                            </ThemedText>
                            
                            <Spacer height={12} />

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
                                    
                                    {/* Informacja o przycisku */}
                                    <ThemedText style={styles.subtitle}>
                                        Przycisk otworzy aparat do zrobienia zdjęcia i rozpocznie trasę z lokalizacją GPS
                                    </ThemedText>
                                    <Spacer height={15} />
                                </>
                            )}
                            
                            {/* Informacja dla zakończenia trasy */}
                            {liveRouteId && (
                                <>
                                    <ThemedText style={styles.subtitle}>
                                        Przycisk otworzy aparat do zrobienia zdjęcia i zakończy trasę z lokalizacją GPS
                                    </ThemedText>
                                    <Spacer height={15} />
                                </>
                            )}

                            {/* Przyciski GPS z aparatem */}
                            {!liveRouteId ? (
                                <ImagePickerWithCrop
                                    onImageCaptured={handleStartLiveRoute}
                                    buttonText="Rozpocznij trasę"
                                />
                            ) : (
                                <ImagePickerWithCrop
                                    onImageCaptured={handleEndLiveRoute}
                                    buttonText="Zakończ trasę"
                                />
                            )}
                        </View>

                        <Spacer height={20} />

                        {/* Separator */}
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <ThemedText style={styles.separatorText}>LUB</ThemedText>
                            <View style={styles.separatorLine} />
                        </View>

                        <Spacer height={20} />
                    </>
                )}

                {/* Sekcja Manualna - Wpisywanie adresów */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                        Tryb manualny
                    </ThemedText>
                    
                    <Spacer height={8} />
                    
                    <ThemedText style={styles.subtitle}>
                        Dodaj trasę z przeszłości
                    </ThemedText>
                    
                    <Spacer height={12} />

                    {/* Przycisk pokazujący/ukrywający formularz */}
                    {!showManualForm ? (
                        <ThemedButton 
                            onPress={() => setShowManualForm(true)}
                            disabled={loading === true || !!liveRouteId}
                            style={styles.showFormButton}
                        >
                            <Text style={{color: "#fff", textAlign: 'center'}}>
                                Pokaż formularz
                            </Text>
                        </ThemedButton>
                    ) : (
                        <>
                            {/* Przycisk do ukrycia formularza */}
                            <ThemedButton 
                                onPress={() => {
                                    setShowManualForm(false);
                                    setStartAddress("");
                                    setEndAddress("");
                                    setDescription("");
                                    setStartDate("");
                                    setStartTime("");
                                    setEndTime("");
                                }}
                                disabled={loading === true}
                                style={styles.hideFormButton}
                            >
                                <Text style={{color: "#fff", textAlign: 'center'}}>
                                    ▲ Ukryj formularz
                                </Text>
                            </ThemedButton>

                            <Spacer height={12} />

                            {/* Pole: Adres początku trasy */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Adres początku (np. Warszawa, Marszałkowska 1)"
                                value={startAddress}
                                onChangeText={setStartAddress}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={10} />

                            {/* Pole: Adres końca trasy */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Adres końca (np. Kraków, Rynek Główny)"
                                value={endAddress}
                                onChangeText={setEndAddress}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={10} />

                            {/* Pole: Opis */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Opis trasy (opcjonalnie)"
                                value={description}
                                onChangeText={setDescription}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={15} />


                            <ThemedText style={styles.subsectionTitle}>
                                Opcjonalnie - Data i godziny
                            </ThemedText>
                            
                            <Spacer height={8} />

                            {/* Pole: Data */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Data (DD.MM.YYYY, np. 18.11.2025)"
                                value={startDate}
                                onChangeText={setStartDate}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={10} />

                            {/* Pole: Godzina rozpoczęcia */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Godzina rozpoczęcia (HH:MM, np. 14:30)"
                                value={startTime}
                                onChangeText={setStartTime}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={10} />

                            {/* Pole: Godzina zakończenia */}
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Godzina zakończenia (HH:MM, np. 16:45)"
                                value={endTime}
                                onChangeText={setEndTime}
                                editable={loading !== true && !liveRouteId}
                            />
                            
                            <Spacer height={12} />

                            {/* Przycisk tworzenia trasy manualnej */}
                            <ThemedButton 
                                onPress={handleSubmit} 
                                disabled={loading === true || !!liveRouteId}
                            >
                                <Text style={{color: "#fff", textAlign: 'center'}}>
                                    {loading ? "Obliczanie trasy..." : "Utwórz trasę"}
                                </Text>
                            </ThemedButton>
                        </>
                    )}
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
        paddingHorizontal: 15,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'center',
    },
    section: {
        width: '100%',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.7,
    },
    subsectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.8,
    },
    input: {
        padding: 15,
        borderRadius: 6,
        alignSelf: 'stretch',
        marginHorizontal: 15,
        fontSize: 15,
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
    showFormButton: {
        backgroundColor: '#9C27B0', // Fioletowy dla pokazania formularza
    },
    hideFormButton: {
        backgroundColor: '#757575', // Szary dla ukrycia formularza
    },
    cancelButton: {
        backgroundColor: '#757575', // Szary dla anulowania
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
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    photoConfirm: {
        fontSize: 13,
        textAlign: 'center',
        color: '#4CAF50',
        marginTop: 8,
    }
});
