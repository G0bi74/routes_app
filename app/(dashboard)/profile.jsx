/**
 * Ekran profilu użytkownika (Profile)
 * 
 * Wyświetla informacje o zalogowanym użytkowniku
 * Umożliwia wylogowanie się z aplikacji
 * Zawiera funkcjonalność generowania raportów PDF
 * 
 * Styl: Minimalistyczne kafelki z zaokrągleniami
 */

import { StyleSheet, ScrollView, View, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../hooks/useUser';
import { useRoutes } from '../../hooks/useRoutes';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedDivider from '../../components/ThemedDivider';
import { Colors } from '../../constants/Colors';
import { useAlertHelpers } from '../../components/ThemedAlert';

/**
 * Funkcja pomocnicza - formatuje datę
 */
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Funkcja pomocnicza - formatuje godzinę
 */
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Funkcja pomocnicza - skraca adres do pierwszych dwóch części
 * Np. "Rudnik 19d, Wólka, LU, Poland" -> "Rudnik 19d, Wólka"
 */
const shortenAddress = (address) => {
    if (!address) return 'Brak danych';
    const parts = address.split(',').map(part => part.trim());
    return parts.slice(0, 2).join(', ') || address;
};

/**
 * Funkcja pomocnicza - pobiera zakres dat (tydzień/miesiąc)
 */
const getDateRange = (type) => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    if (type === 'week') {
        start.setDate(start.getDate() - 7);
    } else if (type === 'month') {
        start.setDate(start.getDate() - 30);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

/**
 * Funkcja pomocnicza - filtruje trasy po zakresie dat
 */
const filterRoutesByDateRange = (routes, start, end) => {
    return routes.filter(route => {
        if (!route.createdAt) return false;
        const routeDate = route.createdAt.toDate ? route.createdAt.toDate() : new Date(route.createdAt);
        return routeDate >= start && routeDate <= end && route.status === 'completed';
    }).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA - dateB;
    });
};

/**
 * Konwertuje obraz URI na Base64
 */
const imageToBase64 = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Błąd konwersji obrazu:', error);
        return null;
    }
};

/**
 * Generuje HTML dla raportu
 * Layout: LP | Siatka danych (3 wiersze x 2 kolumny) | Zdjęcia
 * Zoptymalizowany pod druk - minimalne kolory, bez przycinania zdjęć
 */
const generateReportHTML = async (routes, title, dateRange, fuelConsumption, fuelPrice) => {
    const totalKm = routes.reduce((sum, route) => sum + (route.distance || 0), 0);
    
    // Obliczenia paliwowe
    const consumption = parseFloat(fuelConsumption) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const totalFuelLiters = consumption > 0 ? (totalKm / 100) * consumption : 0;
    const totalFuelCost = price > 0 ? totalFuelLiters * price : 0;
    
    // Konwertuj wszystkie zdjęcia na Base64
    // Preferuje URL z Appwrite, fallback na lokalne URI
    const routesWithImages = await Promise.all(
        routes.map(async (route) => {
            const startImageSource = route.startImageUrl || route.startImageUri;
            const endImageSource = route.endImageUrl || route.endImageUri;
            const startImageBase64 = startImageSource ? await imageToBase64(startImageSource) : null;
            const endImageBase64 = endImageSource ? await imageToBase64(endImageSource) : null;
            return { ...route, startImageBase64, endImageBase64 };
        })
    );
    
    // Layout: LP | Dane (siatka 3x2) | Zdjęcia
    const routesHTML = routesWithImages.map((route, index) => {
        const hasImages = route.startImageBase64 || route.endImageBase64;
        
        return `
        <div class="route-block">
            <div class="route-lp">${index + 1}</div>
            <div class="route-data">
                <table class="data-grid">
                    <tr>
                        <td class="label">Data:</td>
                        <td class="value">${formatDate(route.createdAt)}</td>
                    </tr>
                    <tr>
                        <td class="label">Start:</td>
                        <td class="value">${shortenAddress(route.startAddress)}</td>
                    </tr>
                    <tr>
                        <td class="label">Godz. startu:</td>
                        <td class="value">${formatTime(route.startedAt)}</td>
                    </tr>
                    <tr>
                        <td class="label">Dystans:</td>
                        <td class="value bold">${(route.distance || 0).toFixed(2)} km</td>
                    </tr>
                    <tr>
                        <td class="label">Koniec:</td>
                        <td class="value">${shortenAddress(route.endAddress)}</td>
                    </tr>
                    <tr>
                        <td class="label">Godz. końca:</td>
                        <td class="value">${formatTime(route.completedAt)}</td>
                    </tr>
                </table>
            </div>
            <div class="route-images">
                ${hasImages ? `
                    ${route.startImageBase64 ? `
                    <div class="image-box">
                        <img src="${route.startImageBase64}" alt="Start" />
                        <span class="img-label">Start</span>
                    </div>
                    ` : ''}
                    ${route.endImageBase64 ? `
                    <div class="image-box">
                        <img src="${route.endImageBase64}" alt="Koniec" />
                        <span class="img-label">Koniec</span>
                    </div>
                    ` : ''}
                ` : '<div class="no-images">Brak zdjęć</div>'}
            </div>
        </div>
    `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @page {
                    margin: 15mm 10mm 15mm 10mm;
                }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 10px;
                    color: #333;
                    font-size: 10px;
                    line-height: 1.3;
                }
                h1 {
                    font-size: 18px;
                    color: #1a5276;
                    border-bottom: 3px solid #1a5276;
                    padding-bottom: 6px;
                    margin-bottom: 10px;
                }
                .header-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding: 6px 10px;
                    background-color: #f8f9fa;
                    border-left: 3px solid #1a5276;
                    font-size: 9px;
                    color: #555;
                }
                
                /* Blok pojedynczej trasy - layout: LP | DANE | ZDJĘCIA */
                .route-block {
                    display: flex;
                    border: 1px solid #aaa;
                    margin-bottom: 8px;
                    page-break-inside: avoid;
                    min-height: 120px;
                }
                
                /* Kolumna LP */
                .route-lp {
                    width: 30px;
                    min-width: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    color: #fff;
                    border-right: 1px solid #aaa;
                    background-color: #1a5276;
                }
                
                /* Kolumna danych - siatka */
                .route-data {
                    flex: 1;
                    padding: 6px 8px;
                    border-right: 1px solid #aaa;
                    display: flex;
                    align-items: center;
                }
                .data-grid {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-grid td {
                    padding: 3px 6px;
                    border: 1px solid #ddd;
                    vertical-align: middle;
                }
                .data-grid .label {
                    width: 80px;
                    font-weight: bold;
                    color: #1a5276;
                    background-color: #f8f9fa;
                    white-space: nowrap;
                }
                .data-grid .value {
                    color: #333;
                }
                .data-grid .value.bold {
                    font-weight: bold;
                    color: #1a5276;
                }
                
                /* Kolumna zdjęć - duże zdjęcia */
                .route-images {
                    width: 360px;
                    min-width: 360px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 8px;
                    background-color: #fafafa;
                }
                .image-box {
                    text-align: center;
                    flex: 1;
                }
                .image-box img {
                    max-width: 165px;
                    max-height: 100px;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border: 1px solid #bbb;
                    display: block;
                    margin: 0 auto;
                }
                .img-label {
                    font-size: 8px;
                    color: #1a5276;
                    font-weight: bold;
                    display: block;
                    margin-top: 3px;
                }
                .no-images {
                    color: #999;
                    font-size: 9px;
                    font-style: italic;
                }
                
                /* Podsumowanie */
                .summary-section {
                    margin-top: 15px;
                    border: 1px solid #aaa;
                    border-left: 4px solid #1a5276;
                    padding: 10px 12px;
                    background-color: #f8f9fa;
                }
                .summary-title {
                    font-weight: bold;
                    font-size: 12px;
                    color: #1a5276;
                    margin-bottom: 8px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                .summary-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 25px;
                }
                .summary-item {
                    display: flex;
                    gap: 6px;
                    font-size: 10px;
                }
                .summary-item .label {
                    color: #666;
                }
                .summary-item .value {
                    font-weight: bold;
                    color: #1a5276;
                }
                
                .footer {
                    margin-top: 25px;
                    text-align: center;
                    font-size: 8px;
                    color: #999;
                    border-top: 1px solid #ddd;
                    padding-top: 8px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    .route-block {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            
            <div class="header-info">
                <span><strong>Okres:</strong> ${formatDate({ toDate: () => dateRange.start })} - ${formatDate({ toDate: () => dateRange.end })}</span>
                <span><strong>Wygenerowano:</strong> ${new Date().toLocaleString('pl-PL')}</span>
            </div>

            ${routesHTML}

            <div class="summary-section">
                <div class="summary-title">Podsumowanie</div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Liczba tras:</span>
                        <span class="value">${routes.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Łączna odległość:</span>
                        <span class="value">${totalKm.toFixed(2)} km</span>
                    </div>
                    ${consumption > 0 && price > 0 ? `
                    <div class="summary-item">
                        <span class="label">Spalanie:</span>
                        <span class="value">${consumption.toFixed(2)} l/100km</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Cena paliwa:</span>
                        <span class="value">${price.toFixed(2)} zł/l</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Zużycie paliwa:</span>
                        <span class="value">${totalFuelLiters.toFixed(2)} l</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Koszt paliwa:</span>
                        <span class="value">${totalFuelCost.toFixed(2)} zł</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="footer">
                Raport wygenerowany przez Routes App
            </div>
        </body>
        </html>
    `;
};

const Profile = () => {
    // Pobranie danych użytkownika i funkcji wylogowania
    const { logout, user } = useUser();
    const { routes } = useRoutes();
    const [loading, setLoading] = useState(false);
    
    // Themed alerts
    const { success, error: showError, warning } = useAlertHelpers();
    
    // Motyw kolorystyczny
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    // Stany dla spalania i ceny paliwa
    const [fuelConsumption, setFuelConsumption] = useState(''); // litry/100km
    const [fuelPrice, setFuelPrice] = useState(''); // zł/litr

    // Wczytanie zapisanych wartości przy starcie
    useEffect(() => {
        const loadFuelData = async () => {
            try {
                const savedConsumption = await AsyncStorage.getItem('fuelConsumption');
                const savedPrice = await AsyncStorage.getItem('fuelPrice');
                
                if (savedConsumption !== null) {
                    setFuelConsumption(savedConsumption);
                }
                if (savedPrice !== null) {
                    setFuelPrice(savedPrice);
                }
            } catch (error) {
                console.error('Błąd wczytywania danych paliwowych:', error);
            }
        };
        
        loadFuelData();
    }, []);

    // Zapisywanie wartości spalania
    const handleFuelConsumptionChange = async (value) => {
        setFuelConsumption(value);
        try {
            await AsyncStorage.setItem('fuelConsumption', value);
        } catch (error) {
            console.error('Błąd zapisywania spalania:', error);
        }
    };

    // Zapisywanie wartości ceny
    const handleFuelPriceChange = async (value) => {
        setFuelPrice(value);
        try {
            await AsyncStorage.setItem('fuelPrice', value);
        } catch (error) {
            console.error('Błąd zapisywania ceny:', error);
        }
    };

    /**
     * Generuje raport PDF
     */
    const generateReport = async (type) => {
        setLoading(true);
        try {
            const { start, end } = getDateRange(type);
            const filteredRoutes = filterRoutesByDateRange(routes, start, end);

            if (filteredRoutes.length === 0) {
                warning(
                    'Brak tras',
                    `Nie znaleziono żadnych zakończonych tras w wybranym okresie (${type === 'week' ? 'ostatnie 7 dni' : 'ostatnie 30 dni'}).`
                );
                setLoading(false);
                return;
            }

            const title = type === 'week' ? 'Raport Tygodniowy' : 'Raport Miesięczny';
            const html = await generateReportHTML(
                filteredRoutes, 
                title, 
                { start, end },
                fuelConsumption,
                fuelPrice
            );

            // Generowanie PDF
            const { uri } = await Print.printToFileAsync({ html });

            // Udostępnianie pliku
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Zapisz ${title}`,
                    UTI: 'com.adobe.pdf'
                });
            } else {
                success('Sukces', `Raport zapisany: ${uri}`);
            }

        } catch (error) {
            console.error('Błąd generowania raportu:', error);
            showError('Błąd', 'Nie udało się wygenerować raportu');
        } finally {
            setLoading(false);
        }
    };

    // Statystyki
    const completedRoutes = routes.filter(r => r.status === 'completed');
    const totalKm = completedRoutes.reduce((sum, r) => sum + (r.distance || 0), 0);
    
    // Obliczenia paliwowe
    const consumption = parseFloat(fuelConsumption) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const totalFuelLiters = (totalKm / 100) * consumption;
    const totalFuelCost = totalFuelLiters * price;

    return(
        <ThemedView style={styles.container} safe={true}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Nagłówek z avatarem */}
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                        <Ionicons name="person" size={32} color={Colors.primary} />
                    </View>
                    <ThemedText title style={styles.email}>
                        {user.email}
                    </ThemedText>
                </View>

                {/* Kafelki statystyk */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statTile, { backgroundColor: theme.uiBackground }]}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                        <ThemedText style={styles.statValue}>{completedRoutes.length}</ThemedText>
                        <ThemedText style={styles.statLabel}>Ukończone trasy</ThemedText>
                    </View>
                    <View style={[styles.statTile, { backgroundColor: theme.uiBackground }]}>
                        <Ionicons name="trail-sign" size={24} color={Colors.primary} />
                        <ThemedText style={styles.statValue}>{totalKm.toFixed(0)}</ThemedText>
                        <ThemedText style={styles.statLabel}>Przejechane km</ThemedText>
                    </View>
                </View>

                {/* Ustawienia paliwa */}
                <ThemedCard style={styles.fuelCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="car" size={20} color={Colors.primary} />
                        <ThemedText style={styles.cardTitle} title>Ustawienia paliwa</ThemedText>
                    </View>
                    
                    <View style={styles.inputRow}>
                        <ThemedText style={styles.inputLabel}>Spalanie (l/100km)</ThemedText>
                        <ThemedTextInput
                            placeholder="np. 7.5"
                            value={fuelConsumption}
                            onChangeText={handleFuelConsumptionChange}
                            keyboardType="decimal-pad"
                            style={styles.fuelInput}
                        />
                    </View>
                    
                    <View style={styles.inputRow}>
                        <ThemedText style={styles.inputLabel}>Cena paliwa (zł/l)</ThemedText>
                        <ThemedTextInput
                            placeholder="np. 6.50"
                            value={fuelPrice}
                            onChangeText={handleFuelPriceChange}
                            keyboardType="decimal-pad"
                            style={styles.fuelInput}
                        />
                    </View>
                    
                    {consumption > 0 && price > 0 && (
                        <View style={[styles.fuelStats, { backgroundColor: Colors.primary + '10' }]}>
                            <View style={styles.fuelStatRow}>
                                <Ionicons name="water" size={16} color={Colors.primary} />
                                <ThemedText style={styles.fuelStatLabel}>Zużycie paliwa:</ThemedText>
                                <ThemedText style={styles.fuelStatValue}>
                                    {totalFuelLiters.toFixed(1)} l
                                </ThemedText>
                            </View>
                            <View style={styles.fuelStatRow}>
                                <Ionicons name="cash" size={16} color={Colors.primary} />
                                <ThemedText style={styles.fuelStatLabel}>Koszt paliwa:</ThemedText>
                                <ThemedText style={styles.fuelStatValue}>
                                    {totalFuelCost.toFixed(2)} zł
                                </ThemedText>
                            </View>
                        </View>
                    )}
                </ThemedCard>

                {/* Raporty PDF */}
                <ThemedCard style={styles.reportsCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text" size={20} color={Colors.primary} />
                        <ThemedText style={styles.cardTitle} title>Raporty PDF</ThemedText>
                    </View>
                    
                    <View style={styles.reportButtons}>
                        <ThemedButton
                            onPress={() => generateReport('week')}
                            disabled={loading}
                            style={styles.reportButton}
                            icon="calendar-outline"
                        >
                            {loading ? 'Generowanie...' : '7 dni'}
                        </ThemedButton>
                        
                        <ThemedButton
                            onPress={() => generateReport('month')}
                            disabled={loading}
                            style={styles.reportButton}
                            icon="calendar"
                        >
                            {loading ? 'Generowanie...' : '30 dni'}
                        </ThemedButton>
                    </View>
                </ThemedCard>

                <ThemedDivider />

                {/* Przycisk wylogowania */}
                <ThemedButton 
                    onPress={logout} 
                    variant="danger"
                    icon="log-out-outline"
                >
                    Wyloguj się
                </ThemedButton>

                <Spacer height={40} />
            </ScrollView>
        </ThemedView>
    );
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    email: {
        fontSize: 16,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statTile: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
        textAlign: 'center',
    },
    fuelCard: {
        marginBottom: 16,
    },
    reportsCard: {
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    inputRow: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 6,
    },
    fuelInput: {
        fontSize: 15,
    },
    fuelStats: {
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    fuelStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    fuelStatLabel: {
        flex: 1,
        fontSize: 14,
    },
    fuelStatValue: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.primary,
    },
    reportButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    reportButton: {
        flex: 1,
    },
});
