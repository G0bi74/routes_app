/**
 * Ekran profilu użytkownika (Profile)
 * 
 * Wyświetla informacje o zalogowanym użytkowniku
 * Umożliwia wylogowanie się z aplikacji
 * Zawiera funkcjonalność generowania raportów PDF
 */

import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useRoutes } from '../../hooks/useRoutes';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';
import ThemedCard from '../../components/ThemedCard';
import ThemedTextInput from '../../components/ThemedTextInput';

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
 */
const generateReportHTML = async (routes, title, dateRange, fuelConsumption, fuelPrice) => {
    const totalKm = routes.reduce((sum, route) => sum + (route.distance || 0), 0);
    
    // Obliczenia paliwowe
    const consumption = parseFloat(fuelConsumption) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const totalFuelLiters = consumption > 0 ? (totalKm / 100) * consumption : 0;
    const totalFuelCost = price > 0 ? totalFuelLiters * price : 0;
    
    // Konwertuj wszystkie zdjęcia na Base64
    const routesWithImages = await Promise.all(
        routes.map(async (route) => {
            const startImageBase64 = route.startImageUri ? await imageToBase64(route.startImageUri) : null;
            const endImageBase64 = route.endImageUri ? await imageToBase64(route.endImageUri) : null;
            return { ...route, startImageBase64, endImageBase64 };
        })
    );
    
    const routesHTML = routesWithImages.map((route, index) => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 12px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 12px;">${formatDate(route.createdAt)}</td>
            <td style="border: 1px solid #ddd; padding: 12px;">
                <strong>Start:</strong> ${shortenAddress(route.startAddress)}<br/>
                <strong>Koniec:</strong> ${shortenAddress(route.endAddress)}
            </td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">
                ${formatTime(route.startedAt)}<br/>
                ${formatTime(route.completedAt)}
            </td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${(route.distance || 0).toFixed(2)} km</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">
                ${route.startImageBase64 ? `<img src="${route.startImageBase64}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px; margin: 5px;" />` : '—'}<br/>
                ${route.endImageBase64 ? `<img src="${route.endImageBase64}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px; margin: 5px;" />` : '—'}
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1 {
                    color: #2196F3;
                    border-bottom: 3px solid #2196F3;
                    padding-bottom: 10px;
                }
                .info {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f5f5f5;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background-color: #2196F3;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    border: 1px solid #1976D2;
                }
                td img {
                    display: block;
                    margin: 5px auto;
                }
                .summary {
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #e3f2fd;
                    border-radius: 5px;
                    font-size: 18px;
                }
                .fuel-summary {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #e8f5e9;
                    border-radius: 5px;
                    font-size: 16px;
                    border-left: 4px solid #4CAF50;
                }
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            
            <div class="info">
                <p><strong>Okres:</strong> ${formatDate({ toDate: () => dateRange.start })} - ${formatDate({ toDate: () => dateRange.end })}</p>
                <p><strong>Data wygenerowania:</strong> ${new Date().toLocaleString('pl-PL')}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">Lp.</th>
                        <th style="width: 12%;">Data</th>
                        <th style="width: 30%;">Trasa</th>
                        <th style="width: 13%;">Godziny<br/>(Start/Koniec)</th>
                        <th style="width: 10%;">Odległość</th>
                        <th style="width: 20%;">Zdjęcia<br/>(Start/Koniec)</th>
                    </tr>
                </thead>
                <tbody>
                    ${routesHTML}
                </tbody>
            </table>

            <div class="summary">
                <strong>Podsumowanie:</strong><br/>
                Liczba tras: ${routes.length}<br/>
                Łączna odległość: ${totalKm.toFixed(2)} km
            </div>

            ${consumption > 0 && price > 0 ? `
            <div class="fuel-summary">
                <strong>⛽ Statystyki paliwowe:</strong><br/>
                <div style="margin-top: 10px;">
                    <span style="color: #666;">Średnie spalanie:</span> <strong>${consumption.toFixed(2)} l/100km</strong><br/>
                    <span style="color: #666;">Cena paliwa:</span> <strong>${price.toFixed(2)} zł/litr</strong><br/>
                    <hr style="margin: 10px 0; border: none; border-top: 1px solid #ccc;"/>
                    <span style="color: #666;">Zużycie paliwa:</span> <strong style="color: #4CAF50;">${totalFuelLiters.toFixed(2)} litrów</strong><br/>
                    <span style="color: #666;">Koszt paliwa:</span> <strong style="color: #4CAF50;">${totalFuelCost.toFixed(2)} zł</strong>
                </div>
            </div>
            ` : ''}

            <div class="footer">
                <p>Raport wygenerowany automatycznie przez Routes App</p>
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
    
    // Stany dla spalania i ceny paliwa
    const [fuelConsumption, setFuelConsumption] = useState(''); // litry/100km
    const [fuelPrice, setFuelPrice] = useState(''); // zł/litr

    /**
     * Generuje raport PDF
     */
    const generateReport = async (type) => {
        setLoading(true);
        try {
            const { start, end } = getDateRange(type);
            const filteredRoutes = filterRoutesByDateRange(routes, start, end);

            if (filteredRoutes.length === 0) {
                Alert.alert(
                    'Brak tras',
                    `Nie znaleziono żadnych zakończonych tras w wybranym okresie (${type === 'week' ? 'ostatnie 7 dni' : 'ostatnie 30 dni'}).`,
                    [{ text: 'OK' }]
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
                Alert.alert('Sukces', `Raport zapisany: ${uri}`);
            }

        } catch (error) {
            console.error('Błąd generowania raportu:', error);
            Alert.alert('Błąd', 'Nie udało się wygenerować raportu');
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
    const totalFuelLiters = (totalKm / 100) * consumption; // litry
    const totalFuelCost = totalFuelLiters * price; // zł

    return(
        <ThemedView style={styles.container} safe={true}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Spacer height={20} />

                {/* Wyświetlenie emaila użytkownika */}
                <ThemedText title={true} style={styles.heading}>
                    {user.email} 
                </ThemedText>
                
                <Spacer height={30} />

                {/* Statystyki ogólne */}
                <ThemedCard style={styles.statsCard}>
                    <ThemedText style={styles.statsTitle}>📊 Statystyki</ThemedText>
                    <Spacer height={15} />
                    <View style={styles.statsRow}>
                        <ThemedText style={styles.statsLabel}>Zakończone trasy:</ThemedText>
                        <ThemedText style={styles.statsValue}>{completedRoutes.length}</ThemedText>
                    </View>
                    <View style={styles.statsRow}>
                        <ThemedText style={styles.statsLabel}>Łączna odległość:</ThemedText>
                        <ThemedText style={styles.statsValue}>{totalKm.toFixed(2)} km</ThemedText>
                    </View>
                    
                    <Spacer height={20} />
                    <ThemedText style={styles.statsSubtitle}>⛽ Parametry paliwa</ThemedText>
                    <Spacer height={10} />
                    
                    <ThemedText style={styles.inputLabel}>Średnie spalanie (l/100km):</ThemedText>
                    <ThemedTextInput
                        placeholder="np. 7.5"
                        value={fuelConsumption}
                        onChangeText={setFuelConsumption}
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />
                    
                    <Spacer height={10} />
                    
                    <ThemedText style={styles.inputLabel}>Cena paliwa (zł/litr):</ThemedText>
                    <ThemedTextInput
                        placeholder="np. 6.50"
                        value={fuelPrice}
                        onChangeText={setFuelPrice}
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />
                    
                    {consumption > 0 && price > 0 && (
                        <>
                            <Spacer height={20} />
                            <View style={styles.fuelStatsContainer}>
                                <View style={styles.statsRow}>
                                    <ThemedText style={styles.statsLabel}>Zużycie paliwa:</ThemedText>
                                    <ThemedText style={styles.statsValueHighlight}>
                                        {totalFuelLiters.toFixed(2)} l
                                    </ThemedText>
                                </View>
                                <View style={styles.statsRow}>
                                    <ThemedText style={styles.statsLabel}>Koszt paliwa:</ThemedText>
                                    <ThemedText style={styles.statsValueHighlight}>
                                        {totalFuelCost.toFixed(2)} zł
                                    </ThemedText>
                                </View>
                            </View>
                        </>
                    )}
                </ThemedCard>

                <Spacer height={30} />

                {/* Sekcja raportów */}
                <ThemedText style={styles.sectionTitle}>📄 Raporty PDF</ThemedText>
                <Spacer height={15} />

                {/* Raport tygodniowy */}
                <ThemedCard style={styles.reportCard}>
                    <ThemedText style={styles.reportTitle}>Raport Tygodniowy</ThemedText>
                    <ThemedText style={styles.reportDescription}>
                        Ostatnie 7 dni
                    </ThemedText>
                    <Spacer height={10} />
                    <ThemedButton
                        onPress={() => generateReport('week')}
                        disabled={loading}
                        style={styles.reportButton}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? 'Generowanie...' : 'Generuj'}
                        </ThemedText>
                    </ThemedButton>
                </ThemedCard>

                <Spacer height={15} />

                {/* Raport miesięczny */}
                <ThemedCard style={styles.reportCard}>
                    <ThemedText style={styles.reportTitle}>Raport Miesięczny</ThemedText>
                    <ThemedText style={styles.reportDescription}>
                        Ostatnie 30 dni
                    </ThemedText>
                    <Spacer height={10} />
                    <ThemedButton
                        onPress={() => generateReport('month')}
                        disabled={loading}
                        style={styles.reportButton}
                    >
                        <ThemedText style={styles.buttonText}>
                            {loading ? 'Generowanie...' : 'Generuj'}
                        </ThemedText>
                    </ThemedButton>
                </ThemedCard>

                <Spacer height={30} />

                {/* Przycisk wylogowania */}
                <ThemedButton onPress={logout} style={styles.logoutButton}>
                    <ThemedText style={styles.buttonText}>Wyloguj</ThemedText>
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
        paddingHorizontal: 20,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statsCard: {
        padding: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statsLabel: {
        fontSize: 15,
    },
    statsValue: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    statsValueHighlight: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 5,
        opacity: 0.8,
    },
    input: {
        fontSize: 15,
    },
    fuelStatsContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    reportCard: {
        padding: 15,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    reportDescription: {
        fontSize: 13,
        opacity: 0.7,
    },
    reportButton: {
        backgroundColor: '#2196F3',
    },
    logoutButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
