/**
 * Ekran tworzenia nowej trasy (Create)
 * 
 * Dwa tryby tworzenia tras:
 * 1. Tryb manualny - wpisywanie adresów początku i końca
 * 2. Tryb GPS - automatyczne pobieranie lokalizacji z telefonu
 * 
 * Styl: Minimalistyczne kafelki z zaokrągleniami
 */

import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, View, Modal, useColorScheme, ActivityIndicator, ScrollView } from 'react-native';
import { useRoutes } from '../../hooks/useRoutes';
import { useOcr } from '../../hooks/useOcr';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import ThemedDivider from '../../components/ThemedDivider';
import ImagePickerWithCrop from '../../components/ImagePickerWithCrop';
import { useAlertHelpers } from '../../components/ThemedAlert';


const Create = () => {
    // Motyw kolorystyczny
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    // Themed alerts
    const { success, error: showError, warning } = useAlertHelpers();


    // Stany dla pól formularza (tryb manualny)
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
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

    // Stany dla ręcznej korekty OCR
    const [showOcrModal, setShowOcrModal] = useState(false);
    const [ocrModalType, setOcrModalType] = useState(null); // 'start' lub 'end'
    const [ocrDetectedValue, setOcrDetectedValue] = useState('');
    const [ocrEditedValue, setOcrEditedValue] = useState('');
    const [ocrPhotoUri, setOcrPhotoUri] = useState(null);
    const [ocrValidationMessage, setOcrValidationMessage] = useState('');
    const [loadingMessage, setLoadingMessage] = useState(''); // Wiadomość dla loadera

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
                endAddress: endAddress.trim()
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
            success("Sukces!", "Trasa została utworzona pomyślnie");

            // Resetowanie formularza
            setStartAddress("");
            setEndAddress("");
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
            if (photoUri) {
                console.log('Rozpoczynam rozpoznawanie OCR...');
                const ocrResult = await recognizeText(photoUri, true);
                
                if (ocrResult.success) {
                    const detectedValue = ocrResult.correctedMileage || ocrResult.mileage || '';
                    
                    // Zapisz dane i pokaż modal do korekty
                    setOcrPhotoUri(photoUri);
                    setOcrModalType('start');
                    setOcrDetectedValue(detectedValue.toString());
                    setOcrEditedValue(detectedValue.toString());
                    setOcrValidationMessage(ocrResult.validationMessage || 'Sprawdź odczyt');
                    setShowOcrModal(true);
                    
                    console.log(`Wykryto stan licznika: ${detectedValue} km`);
                } else {
                    // Brak odczytu - pokaż modal z pustą wartością
                    setOcrPhotoUri(photoUri);
                    setOcrModalType('start');
                    setOcrDetectedValue('');
                    setOcrEditedValue('');
                    setOcrValidationMessage('Nie wykryto liczby - wpisz ręcznie');
                    setShowOcrModal(true);
                }
            }
        } catch (error) {
            console.error("Błąd OCR:", error);
            setError(error.message || "Nie można rozpoznać zdjęcia");
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
            if (photoUri) {
                console.log('Rozpoczynam rozpoznawanie OCR...');
                const ocrResult = await recognizeText(photoUri, false);
                
                if (ocrResult.success) {
                    const detectedValue = ocrResult.correctedMileage || ocrResult.mileage || '';
                    
                    // Zapisz dane i pokaż modal do korekty
                    setOcrPhotoUri(photoUri);
                    setOcrModalType('end');
                    setOcrDetectedValue(detectedValue.toString());
                    setOcrEditedValue(detectedValue.toString());
                    setOcrValidationMessage(ocrResult.validationMessage || 'Sprawdź odczyt');
                    setShowOcrModal(true);
                    
                    console.log(`Wykryto stan licznika: ${detectedValue} km`);
                } else {
                    // Brak odczytu - pokaż modal z pustą wartością
                    setOcrPhotoUri(photoUri);
                    setOcrModalType('end');
                    setOcrDetectedValue('');
                    setOcrEditedValue('');
                    setOcrValidationMessage('Nie wykryto liczby - wpisz ręcznie');
                    setShowOcrModal(true);
                }
            }
        } catch (error) {
            console.error("Błąd OCR:", error);
            setError(error.message || "Nie można rozpoznać zdjęcia");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Obsługa zatwierdzenia skorygowanej wartości OCR
     */
    const handleConfirmOcr = async () => {
        const mileageValue = parseInt(ocrEditedValue, 10);
        
        if (isNaN(mileageValue) || mileageValue <= 0) {
            showError('Błąd', 'Wprowadź poprawną liczbę kilometrów');
            return;
        }

        setShowOcrModal(false);
        setLoading(true);

        try {
            if (ocrModalType === 'start') {
                setLoadingMessage('Rozpoczynanie trasy...');
                
                // Rozpocznij trasę z poprawioną wartością
                setStartMileage(mileageValue);
                
                const routeId = await startLiveRoute(
                    ocrPhotoUri,
                    mileageValue
                );

                setLiveRouteId(routeId);

                success(
                    "Trasa rozpoczęta!",
                    `Lokalizacja początkowa i stan licznika (${mileageValue} km) zostały zapisane.`
                );

                setStartPhotoUri(null);
                
            } else if (ocrModalType === 'end') {
                setLoadingMessage('Kończenie trasy...');
                
                // Zakończ trasę z poprawioną wartością
                setEndMileage(mileageValue);
                
                await endLiveRoute(liveRouteId, ocrPhotoUri, mileageValue);

                let message = "Trasa została pomyślnie zakończona.";
                
                if (startMileage && mileageValue) {
                    const mileageDistance = mileageValue - startMileage;
                    if (mileageDistance > 0) {
                        message = `Trasa zakończona!\n\nStan licznika:\n- Początek: ${startMileage} km\n- Koniec: ${mileageValue} km\n- Przejechano: ${mileageDistance} km`;
                    }
                }

                success("Trasa zakończona!", message);

                setLiveRouteId(null);
                setEndPhotoUri(null);
                setStartMileage(null);
                setEndMileage(null);

                router.replace('/history');
            }
        } catch (error) {
            console.error("Błąd zapisywania trasy:", error);
            setError(error.message || "Nie można zapisać trasy");
        } finally {
            setLoading(false);
            setLoadingMessage('');
            // Resetuj stany modala
            setOcrPhotoUri(null);
            setOcrModalType(null);
            setOcrDetectedValue('');
            setOcrEditedValue('');
            setOcrValidationMessage('');
        }
    };

    /**
     * Obsługa anulowania korekty OCR
     */
    const handleCancelOcr = () => {
        setShowOcrModal(false);
        setOcrPhotoUri(null);
        setOcrModalType(null);
        setOcrDetectedValue('');
        setOcrEditedValue('');
        setOcrValidationMessage('');
    };

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView safe={true} style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Nagłówek */}
                    <View style={styles.header}>
                        <Ionicons name="add-circle" size={28} color={Colors.primary} />
                        <ThemedText title style={styles.heading}>
                            Nowa trasa
                        </ThemedText>
                    </View>

                    {/* Sekcja GPS - Trasa na żywo */}
                    {!showManualForm && (
                        <>
                            <ThemedCard style={styles.modeCard}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.modeIcon, { backgroundColor: Colors.primary + '20' }]}>
                                        <Ionicons name="navigate" size={24} color={Colors.primary} />
                                    </View>
                                    <View style={styles.cardHeaderText}>
                                        <ThemedText style={styles.cardTitle} title>Tryb GPS</ThemedText>
                                        <ThemedText style={styles.cardSubtitle}>
                                            {liveRouteId ? "Trasa w trakcie" : "Automatyczna lokalizacja"}
                                        </ThemedText>
                                    </View>
                                </View>
                                
                                <ThemedText style={styles.modeDescription}>
                                    {liveRouteId 
                                        ? "Zrób zdjęcie licznika aby zakończyć trasę"
                                        : "Zrób zdjęcie licznika aby rozpocząć trasę z bieżącą lokalizacją GPS"}
                                </ThemedText>
                                
                                <Spacer height={16} />

                                {!liveRouteId ? (
                                    <ImagePickerWithCrop
                                        onImageCaptured={handleStartLiveRoute}
                                        buttonText="Rozpocznij trasę"
                                        buttonIcon="play-circle"
                                    />
                                ) : (
                                    <ImagePickerWithCrop
                                        onImageCaptured={handleEndLiveRoute}
                                        buttonText="Zakończ trasę"
                                        buttonIcon="stop-circle"
                                        buttonVariant="danger"
                                    />
                                )}
                            </ThemedCard>

                            <ThemedDivider text="lub" />
                        </>
                    )}

                    {/* Sekcja Manualna */}
                    <ThemedCard style={styles.modeCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.modeIcon, { backgroundColor: Colors.primary + '20' }]}>
                                <Ionicons name="create" size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.cardHeaderText}>
                                <ThemedText style={styles.cardTitle} title>Tryb manualny</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Dodaj trasę z przeszłości
                                </ThemedText>
                            </View>
                        </View>

                        {!showManualForm ? (
                            <ThemedButton 
                                onPress={() => setShowManualForm(true)}
                                disabled={loading === true || !!liveRouteId}
                                variant="secondary"
                                icon="chevron-down"
                            >
                                Pokaż formularz
                            </ThemedButton>
                        ) : (
                            <>
                                <ThemedButton 
                                    onPress={() => {
                                        setShowManualForm(false);
                                        setStartAddress("");
                                        setEndAddress("");
                                        setStartDate("");
                                        setStartTime("");
                                        setEndTime("");
                                    }}
                                    disabled={loading === true}
                                    variant="secondary"
                                    icon="chevron-up"
                                >
                                    Ukryj formularz
                                </ThemedButton>

                                <Spacer height={16} />

                                <ThemedText style={styles.inputLabel}>Adres początkowy</ThemedText>
                                <ThemedTextInput
                                    placeholder="np. Warszawa, Marszałkowska 1"
                                    value={startAddress}
                                    onChangeText={setStartAddress}
                                    editable={loading !== true && !liveRouteId}
                                    icon="location"
                                />
                                
                                <Spacer height={12} />

                                <ThemedText style={styles.inputLabel}>Adres końcowy</ThemedText>
                                <ThemedTextInput
                                    placeholder="np. Kraków, Rynek Główny"
                                    value={endAddress}
                                    onChangeText={setEndAddress}
                                    editable={loading !== true && !liveRouteId}
                                    icon="flag"
                                />
                                
                                <Spacer height={20} />

                                <View style={styles.optionalHeader}>
                                    <Ionicons name="time-outline" size={16} color={theme.iconColor} />
                                    <ThemedText style={styles.optionalLabel}>
                                        Opcjonalnie - Data i godziny
                                    </ThemedText>
                                </View>
                                
                                <Spacer height={12} />

                                <ThemedTextInput
                                    placeholder="Data (DD.MM.YYYY)"
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    editable={loading !== true && !liveRouteId}
                                    icon="calendar"
                                />
                                
                                <Spacer height={10} />

                                <View style={styles.timeRow}>
                                    <View style={styles.timeInput}>
                                        <ThemedTextInput
                                            placeholder="Start (HH:MM)"
                                            value={startTime}
                                            onChangeText={setStartTime}
                                            editable={loading !== true && !liveRouteId}
                                        />
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color={theme.iconColor} />
                                    <View style={styles.timeInput}>
                                        <ThemedTextInput
                                            placeholder="Koniec (HH:MM)"
                                            value={endTime}
                                            onChangeText={setEndTime}
                                            editable={loading !== true && !liveRouteId}
                                        />
                                    </View>
                                </View>
                                
                                <Spacer height={16} />

                                <ThemedButton 
                                    onPress={handleSubmit} 
                                    disabled={loading === true || !!liveRouteId}
                                    icon="checkmark-circle"
                                >
                                    {loading ? "Obliczanie trasy..." : "Utwórz trasę"}
                                </ThemedButton>
                            </>
                        )}
                    </ThemedCard>

                    {/* Wyświetlenie błędu */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                        </View>
                    )}

                    <Spacer height={40} />
                </ScrollView>

                {/* Loader podczas operacji GPS */}
                {loading && !showOcrModal && (
                    <View style={styles.loaderOverlay}>
                        <View style={[styles.loaderContainer, { backgroundColor: theme.uiBackground }]}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Spacer height={16} />
                            <ThemedText style={styles.loaderText}>
                                {loadingMessage || 'Przetwarzanie...'}
                            </ThemedText>
                            <ThemedText style={styles.loaderSubtext}>
                                Pobieranie lokalizacji GPS
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* Modal OCR */}
                <Modal
                    visible={showOcrModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleCancelOcr}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                            <View style={styles.modalHeader}>
                                <Ionicons name="speedometer" size={24} color={Colors.primary} />
                                <ThemedText style={styles.modalTitle} title>
                                    {ocrModalType === 'start' ? 'Stan licznika (start)' : 'Stan licznika (koniec)'}
                                </ThemedText>
                            </View>
                            
                            {ocrDetectedValue && (
                                <View style={[styles.ocrDetected, { backgroundColor: Colors.primary + '15' }]}>
                                    <ThemedText style={styles.ocrDetectedLabel}>Wykryto przez OCR:</ThemedText>
                                    <ThemedText style={styles.ocrDetectedValue}>{ocrDetectedValue} km</ThemedText>
                                </View>
                            )}
                            
                            {ocrValidationMessage && (
                                <ThemedText style={styles.ocrValidation}>{ocrValidationMessage}</ThemedText>
                            )}
                            
                            <ThemedText style={styles.ocrEditLabel}>Popraw wartość jeśli potrzeba:</ThemedText>
                            
                            <ThemedTextInput
                                style={styles.ocrInput}
                                placeholder="Wpisz stan licznika (km)"
                                value={ocrEditedValue}
                                onChangeText={setOcrEditedValue}
                                keyboardType="numeric"
                                autoFocus={true}
                            />
                            
                            <View style={styles.modalButtons}>
                                <ThemedButton 
                                    onPress={handleCancelOcr}
                                    variant="danger"
                                    style={styles.modalButton}
                                >
                                    Anuluj
                                </ThemedButton>
                                
                                <ThemedButton 
                                    onPress={handleConfirmOcr}
                                    style={styles.modalButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Zapisywanie...' : 'Zatwierdź'}
                                </ThemedButton>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}

export default Create;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
        marginTop: 8,
    },
    heading: {
        fontSize: 22,
        fontWeight: '700',
    },
    modeCard: {
        marginBottom: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 14,
    },
    modeIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 2,
    },
    modeDescription: {
        fontSize: 14,
        opacity: 0.7,
        lineHeight: 20,
    },
    inputLabel: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 6,
        marginLeft: 4,
    },
    optionalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    optionalLabel: {
        fontSize: 13,
        opacity: 0.6,
        fontWeight: '500',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timeInput: {
        flex: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        backgroundColor: Colors.warning + '15',
        borderRadius: 12,
        marginTop: 12,
    },
    errorText: {
        flex: 1,
        color: Colors.warning,
        fontSize: 14,
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loaderContainer: {
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 25,
        alignItems: 'center',
        width: 280,
        maxWidth: '85%',
    },
    loaderText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    loaderSubtext: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 6,
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '88%',
        borderRadius: 20,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    ocrDetected: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    ocrDetectedLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    ocrDetectedValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.primary,
    },
    ocrValidation: {
        fontSize: 13,
        textAlign: 'center',
        color: Colors.warning,
        marginBottom: 16,
    },
    ocrEditLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    ocrInput: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
    },
});
