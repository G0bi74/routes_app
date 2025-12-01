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

import { StyleSheet, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRoutes } from '../../../hooks/useRoutes';
import { useRouter } from 'expo-router';
import { formatDistance, formatDuration } from '../../../lib/routing';

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
     */
    useEffect(() => {
        async function loadRoute(){
            const routeData = await fetchRouteById(id);
            setRoute(routeData);
        }
        loadRoute();  
    }, [id]);

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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedCard style={styles.card}>
                    {/* Badge dla tras w trakcie */}
                    {route.status === 'in-progress' && (
                        <>
                            <LiveRouteBadge status={route.status} />
                            <Spacer height={20} />
                            <ThemedText style={styles.inProgressWarning}>
                                Ta trasa jest w trakcie. Zakończ ją w zakładce "Utwórz" aby obliczyć odległość.
                            </ThemedText>
                            <Spacer height={20} />
                        </>
                    )}
                    
                    {/* Sekcja adresów */}
                    <ThemedText style={styles.sectionTitle}>Trasa</ThemedText>
                    
                    <ThemedText style={styles.label}>Punkt początkowy:</ThemedText>
                    <ThemedText style={styles.address}>
                        {route.startAddressFormatted || route.startAddress}
                    </ThemedText>
                    
                    <Spacer height={15} />
                    
                    <ThemedText style={styles.label}>Punkt końcowy:</ThemedText>
                    <ThemedText style={styles.address}>
                        {route.endAddress && route.endAddress !== "" 
                            ? (route.endAddressFormatted || route.endAddress)
                            : "Oczekiwanie na zakończenie..."}
                    </ThemedText>
                    
                    <Spacer height={20} />
                    
                    {/* Separator */}
                    <ThemedView style={styles.separator} />
                    
                    <Spacer height={20} />
                    
                    {/* Sekcja informacji - tylko dla zakończonych tras */}
                    {route.status !== 'in-progress' && (
                        <>
                            {/* Sekcja informacji */}
                            <ThemedView style={styles.section}>
                                <ThemedText style={styles.sectionTitle}>Informacje</ThemedText>
                                
                                {route.distance > 0 && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Odległość:</ThemedText>
                                        <ThemedText style={styles.infoValue}>
                                            {route.distance.toFixed(2)} km
                                            {route.mileageDistance > 0 && <ThemedText style={styles.mileageNote}> (z licznika)</ThemedText>}
                                        </ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.duration > 0 && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Czas jazdy:</ThemedText>
                                        <ThemedText style={styles.infoValue}>{route.duration} min</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.createdAt && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Data:</ThemedText>
                                        <ThemedText style={styles.infoValue}>{formatDate(route.createdAt)}</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.startedAt && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Rozpoczęto:</ThemedText>
                                        <ThemedText style={styles.infoValue}>{formatTime(route.startedAt)}</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.completedAt && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Zakończono:</ThemedText>
                                        <ThemedText style={styles.infoValue}>{formatTime(route.completedAt)}</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.startMileage > 0 && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Stan licznika (start):</ThemedText>
                                        <ThemedText style={styles.infoValue}>{route.startMileage.toLocaleString('pl-PL')} km</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.endMileage > 0 && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Stan licznika (koniec):</ThemedText>
                                        <ThemedText style={styles.infoValue}>{route.endMileage.toLocaleString('pl-PL')} km</ThemedText>
                                    </ThemedView>
                                )}
                                
                                {route.mileageDistance > 0 && (
                                    <ThemedView style={styles.infoRow}>
                                        <ThemedText style={styles.infoLabel}>Różnica (licznik):</ThemedText>
                                        <ThemedText style={[styles.infoValue, styles.mileageHighlight]}>
                                            {route.mileageDistance.toFixed(2)} km
                                        </ThemedText>
                                    </ThemedView>
                                )}
                            </ThemedView>
                            
                            <Spacer height={20} />
                            <ThemedView style={styles.separator} />
                            <Spacer height={20} />
                        </>
                    )}
                    
                    {/* Sekcja zdjęć */}
                    {(route.startImageUri || route.endImageUri) && (
                        <>
                            <ThemedText style={styles.sectionTitle}>Zdjęcia trasy</ThemedText>
                            
                            {route.startImageUri && (
                                <ThemedView style={styles.imageContainer}>
                                    <ThemedText style={styles.imageLabel}>Punkt początkowy:</ThemedText>
                                    <Image 
                                        source={{ uri: route.startImageUri }} 
                                        style={styles.routeImage}
                                        resizeMode="contain"
                                    />
                                </ThemedView>
                            )}
                            
                            {route.endImageUri && (
                                <ThemedView style={styles.imageContainer}>
                                    <ThemedText style={styles.imageLabel}>Punkt końcowy:</ThemedText>
                                    <Image 
                                        source={{ uri: route.endImageUri }} 
                                        style={styles.routeImage}
                                        resizeMode="contain"
                                    />
                                </ThemedView>
                            )}
                        </>
                    )}
                </ThemedCard>
                
                {/* Przycisk usuwania trasy */}
                <ThemedButton style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={{color: "#fff", textAlign: 'center'}}>
                        Usuń Trasę
                    </Text>
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
        alignItems: 'stretch',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    card: {
        margin: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        opacity: 0.7,
    },
    address: {
        fontSize: 16,
        lineHeight: 24,
    },
    formattedAddress: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    separator: {
        height: 1,
        opacity: 0.2,
        backgroundColor: '#888',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        
    },
    infoLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        
    },
    infoIcon: {
        fontSize: 18,
    },
    infoLabel: {
        fontSize: 15,
        opacity: 0.8,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    mileageNote: {
        fontSize: 12,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    mileageHighlight: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.9,
    },
    inProgressWarning: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.9,
        fontStyle: 'italic',
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ffc107',
    },
    deleteButton: {
        marginTop: 20,
        marginHorizontal: 40,
        backgroundColor: Colors.warning,
    },
    imageContainer: {
        marginBottom: 20,
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    routeImage: {
        width: '100%',
        height: 250,
        borderRadius: 4,
        backgroundColor: Colors.uiBackground,
    },
    
    section: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: Colors.uiBackground,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    
});

