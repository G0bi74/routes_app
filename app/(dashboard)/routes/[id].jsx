/**
 * Ekran szczegółów trasy (Route Details)
 * 
 * Wyświetla wszystkie informacje o wybranej trasie:
 * - Adresy początkowy i końcowy
 * - Obliczoną odległość w km
 * - Czas podróży
 * - Zdjęcia startowe i końcowe (jeśli istnieją)
 * Umożliwia:
 * - Usunięcie trasy
 */

import { StyleSheet, Text, ScrollView, Image, View, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRoutes } from '../../../hooks/useRoutes';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { formatDistance, formatDuration } from '../../../lib/routing';
import { Ionicons } from '@expo/vector-icons';

// Importowanie themed components
import Spacer from '../../../components/Spacer';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';
import ThemedCard from '../../../components/ThemedCard';
import ThemedButton from '../../../components/ThemedButton';
import ThemedLoader from '../../../components/ThemedLoader';
import LiveRouteBadge from '../../../components/LiveRouteBadge';
import { Colors } from '../../../constants/Colors';

// Dodanie funkcji formatujących
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Błąd formatowania daty:', error);
        return '';
    }
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Błąd formatowania czasu:', error);
        return '';
    }
};

const RouteDetails = () => {
    // Stan dla przechowywania szczegółów trasy
    const [route, setRoute] = useState(null);

    // Pobranie ID trasy z parametrów URL
    const { id } = useLocalSearchParams();
    
    // Pobranie funkcji z kontekstu
    const { fetchRouteById, deleteRoute } = useRoutes();
    const router = useRouter();
    
    // Pobranie aktualnego motywu
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    /**
     * Obsługa usuwania trasy
     * Usuwa trasę i wraca do historii
     */
    const handleDelete = async () => {
        await deleteRoute(id);
        setRoute(null);
        router.replace('/history');
    }

    /**
     * Effect hook - pobiera szczegóły trasy przy montowaniu komponentu
     * I AKTUALIZUJE za każdym razem gdy użytkownik wraca na ten ekran
     */
    useFocusEffect(
        React.useCallback(() => {
            async function loadRoute(){
                console.log("Odświeżanie szczegółów trasy:", id);
                const routeData = await fetchRouteById(id);
                setRoute(routeData);
            }
            loadRoute();
        }, [id, fetchRouteById])
    );

    // Komponent kafelka informacyjnego
    const InfoTile = ({ icon, label, value, fullWidth = false }) => (
        <View style={[
            styles.infoTile,
            { backgroundColor: theme.uiBackground },
            fullWidth && styles.infoTileFullWidth
        ]}>
            <View style={styles.tileIconContainer}>
                <Ionicons name={icon} size={22} color={Colors.primary} />
            </View>
            <ThemedText style={styles.tileLabel}>{label}</ThemedText>
            <ThemedText style={styles.tileValue}>{value}</ThemedText>
        </View>
    );

    // Komponent kafelka adresowego
    const AddressTile = ({ icon, label, address, color }) => (
        <View style={[styles.addressTile, { backgroundColor: theme.uiBackground }]}>
            <View style={[styles.addressIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.addressContent}>
                <ThemedText style={styles.addressLabel}>{label}</ThemedText>
                <ThemedText style={styles.addressText}>{address}</ThemedText>
            </View>
        </View>
    );

    // Wyświetlenie loadera jeśli trasa nie została jeszcze pobrana
    if(!route){
        return(
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        );
    }

    // Wyświetlenie szczegółów trasy
    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Badge dla tras w trakcie */}
                {route.status === 'in-progress' && (
                    <View style={[styles.warningBanner, { backgroundColor: '#ffc10720' }]}>
                        <Ionicons name="time-outline" size={20} color="#ffc107" />
                        <ThemedText style={styles.warningText}>
                            Trasa w trakcie — zakończ ją w zakładce "Utwórz"
                        </ThemedText>
                    </View>
                )}

                {/* Sekcja adresów */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="navigate" size={20} color={Colors.primary} />
                        <ThemedText style={styles.sectionTitle} title>Trasa</ThemedText>
                    </View>
                    
                    <AddressTile 
                        icon="location"
                        label="Start"
                        address={route.startAddressFormatted || route.startAddress}
                        color={Colors.primary}
                    />
                    
                    {/* Linia łącząca */}
                    <View style={styles.routeLine}>
                        <View style={[styles.routeLineDot, { backgroundColor: Colors.primary }]} />
                        <View style={[styles.routeLineBar, { backgroundColor: isDark ? '#444' : '#ddd' }]} />
                        <View style={[styles.routeLineDot, { backgroundColor: Colors.warning }]} />
                    </View>
                    
                    <AddressTile 
                        icon="flag"
                        label="Cel"
                        address={route.endAddress && route.endAddress !== "" 
                            ? (route.endAddressFormatted || route.endAddress)
                            : "Oczekiwanie na zakończenie..."}
                        color={Colors.warning}
                    />
                </View>

                {/* Sekcja informacji - tylko dla zakończonych tras */}
                {route.status !== 'in-progress' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="stats-chart" size={20} color={Colors.primary} />
                            <ThemedText style={styles.sectionTitle} title>Statystyki</ThemedText>
                        </View>
                        
                        <View style={styles.tilesGrid}>
                            {route.distance > 0 && (
                                <InfoTile 
                                    icon="speedometer-outline"
                                    label="Dystans"
                                    value={`${route.distance.toFixed(1)} km`}
                                />
                            )}
                            
                            {route.duration > 0 && (
                                <InfoTile 
                                    icon="timer-outline"
                                    label="Czas"
                                    value={`${route.duration} min`}
                                />
                            )}
                            
                            {route.createdAt && (
                                <InfoTile 
                                    icon="calendar-outline"
                                    label="Data"
                                    value={formatDate(route.createdAt)}
                                />
                            )}
                            
                            {route.startedAt && (
                                <InfoTile 
                                    icon="play-circle-outline"
                                    label="Start"
                                    value={formatTime(route.startedAt)}
                                />
                            )}
                            
                            {route.completedAt && (
                                <InfoTile 
                                    icon="checkmark-circle-outline"
                                    label="Koniec"
                                    value={formatTime(route.completedAt)}
                                />
                            )}
                        </View>
                        
                        {/* Sekcja licznika - pełna szerokość */}
                        {(route.startMileage > 0 || route.endMileage > 0) && (
                            <View style={styles.mileageSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="speedometer" size={18} color={Colors.primary} />
                                    <ThemedText style={[styles.sectionTitle, { fontSize: 15 }]} title>
                                        Licznik
                                    </ThemedText>
                                </View>
                                <View style={styles.mileageRow}>
                                    {route.startMileage > 0 && (
                                        <View style={[styles.mileageTile, { backgroundColor: theme.uiBackground }]}>
                                            <ThemedText style={styles.mileageLabel}>Początek</ThemedText>
                                            <ThemedText style={styles.mileageValue}>
                                                {route.startMileage.toLocaleString('pl-PL')} km
                                            </ThemedText>
                                        </View>
                                    )}
                                    {route.endMileage > 0 && (
                                        <View style={[styles.mileageTile, { backgroundColor: theme.uiBackground }]}>
                                            <ThemedText style={styles.mileageLabel}>Koniec</ThemedText>
                                            <ThemedText style={styles.mileageValue}>
                                                {route.endMileage.toLocaleString('pl-PL')} km
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                )}
                
                {/* Sekcja zdjęć */}
                {(route.startImageUri || route.endImageUri) && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="images" size={20} color={Colors.primary} />
                            <ThemedText style={styles.sectionTitle} title>Dokumentacja</ThemedText>
                        </View>
                        
                        {route.startImageUri && (
                            <View style={[styles.imageCard, { backgroundColor: theme.uiBackground }]}>
                                <View style={styles.imageLabelRow}>
                                    <Ionicons name="camera" size={16} color={Colors.primary} />
                                    <ThemedText style={styles.imageLabel}>Zdjęcie startowe</ThemedText>
                                </View>
                                <Image 
                                    source={{ uri: route.startImageUri }} 
                                    style={styles.routeImage}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        
                        {route.endImageUri && (
                            <View style={[styles.imageCard, { backgroundColor: theme.uiBackground }]}>
                                <View style={styles.imageLabelRow}>
                                    <Ionicons name="camera" size={16} color={Colors.warning} />
                                    <ThemedText style={styles.imageLabel}>Zdjęcie końcowe</ThemedText>
                                </View>
                                <Image 
                                    source={{ uri: route.endImageUri }} 
                                    style={styles.routeImage}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </View>
                )}
                
                {/* Przycisk usuwania trasy */}
                <ThemedButton style={styles.deleteButton} onPress={handleDelete}>
                    <View style={styles.deleteButtonContent}>
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                        <Text style={styles.deleteButtonText}>Usuń trasę</Text>
                    </View>
                </ThemedButton>
                
                <Spacer height={40} />
            </ScrollView>
        </ThemedView>
    );
}

export default RouteDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    
    // Sekcje
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    
    // Banner ostrzeżenia
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 16,
        marginBottom: 20,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        opacity: 0.9,
    },
    
    // Kafelki adresowe
    addressTile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
    },
    addressIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressContent: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
        fontWeight: '500',
    },
    addressText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
    
    // Linia łącząca adresy
    routeLine: {
        alignItems: 'center',
        paddingVertical: 4,
        marginLeft: 36,
    },
    routeLineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    routeLineBar: {
        width: 2,
        height: 20,
    },
    
    // Siatka kafelków informacyjnych
    tilesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    infoTile: {
        width: '48%',
        flexGrow: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    infoTileFullWidth: {
        width: '100%',
    },
    tileIconContainer: {
        marginBottom: 8,
    },
    tileLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
    tileValue: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Sekcja licznika
    mileageSection: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.15)',
    },
    mileageRow: {
        flexDirection: 'row',
        gap: 10,
    },
    mileageTile: {
        flex: 1,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    mileageLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    mileageValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    
    // Karty zdjęć
    imageCard: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        overflow: 'hidden',
    },
    imageLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    imageLabel: {
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.8,
    },
    routeImage: {
        width: '100%',
        height: 220,
        borderRadius: 12,
    },
    
    // Przycisk usuwania
    deleteButton: {
        marginTop: 10,
        marginHorizontal: 20,
        backgroundColor: Colors.warning,
        borderRadius: 14,
    },
    deleteButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});


