/**
 * Ekran szczegółów trasy (Route Details)
 * 
 * Wyświetla wszystkie informacje o wybranej trasie:
 * - Adresy początkowy i końcowy
 * - Obliczoną odległość w km
 * - Czas podróży
 * - Opis
 * Umożliwia:
 * - Usunięcie trasy
 * - Zakończenie trasy w trakcie (GPS)
 */

import { StyleSheet, Text, ScrollView, Alert } from 'react-native';
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

const RouteDetails = () => {
    // Stan dla przechowywania szczegółów trasy
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pobranie ID trasy z parametrów URL
    const { id } = useLocalSearchParams();
    
    // Pobranie funkcji z kontekstu
    const { fetchRouteById, deleteRoute, endLiveRoute } = useRoutes();
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
     * Obsługa zakończenia trasy GPS
     */
    const handleEndRoute = async () => {
        setLoading(true);
        try {
            await endLiveRoute(id);
            
            Alert.alert(
                "Trasa zakończona!",
                "Trasa została pomyślnie zapisana z obliczoną odległością.",
                [{ text: "OK" }]
            );

            // Odśwież dane trasy
            const updatedRoute = await fetchRouteById(id);
            setRoute(updatedRoute);
            
        } catch (error) {
            Alert.alert(
                "Błąd",
                error.message || "Nie można zakończyć trasy",
                [{ text: "OK" }]
            );
        } finally {
            setLoading(false);
        }
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
                                Ta trasa jest w trakcie. Zakończ ją aby obliczyć odległość.
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
                    
                    {/* Sekcja informacji o trasie - tylko dla zakończonych tras */}
                    {route.status !== 'in-progress' && (
                        <>
                            <ThemedText style={styles.sectionTitle}>Informacje</ThemedText>
                            
                            <ThemedView style={styles.infoRow}>
                                <ThemedView style={styles.infoLabelContainer}>
                                    
                                    <ThemedText style={styles.infoLabel}>Odległość</ThemedText>
                                </ThemedView>
                                <ThemedText style={styles.infoValue}>
                                    {formatDistance(route.distance)}
                                </ThemedText>
                            </ThemedView>
                            
                            {route.duration && (
                                <ThemedView style={styles.infoRow}>
                                    <ThemedView style={styles.infoLabelContainer}>
                                        
                                        <ThemedText style={styles.infoLabel}>Przewidywany czas jazdy</ThemedText>
                                    </ThemedView>
                                    <ThemedText style={styles.infoValue}>
                                        {formatDuration(route.duration)}
                                    </ThemedText>
                                </ThemedView>
                            )}
                            
                            {route.createdAt && (
                                <ThemedView style={styles.infoRow}>
                                    <ThemedView style={styles.infoLabelContainer}>
                                        
                                        <ThemedText style={styles.infoLabel}>Data</ThemedText>
                                    </ThemedView>
                                    <ThemedText style={styles.infoValue}>
                                        {route.createdAt.toDate().toLocaleDateString('pl-PL', { 
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </ThemedText>
                                </ThemedView>
                            )}
                            
                            {route.startedAt && (
                                <ThemedView style={styles.infoRow}>
                                    <ThemedView style={styles.infoLabelContainer}>
                                        
                                        <ThemedText style={styles.infoLabel}>Rozpoczęto</ThemedText>
                                    </ThemedView>
                                    <ThemedText style={styles.infoValue}>
                                        {route.startedAt.toDate().toLocaleTimeString('pl-PL', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </ThemedText>
                                </ThemedView>
                            )}
                            
                            {route.completedAt && (
                                <ThemedView style={styles.infoRow}>
                                    <ThemedView style={styles.infoLabelContainer}>
                                        
                                        <ThemedText style={styles.infoLabel}>Zakończono</ThemedText>
                                    </ThemedView>
                                    <ThemedText style={styles.infoValue}>
                                        {route.completedAt.toDate().toLocaleTimeString('pl-PL', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                        
                                    </ThemedText>
                                </ThemedView>
                            )}
                            
                            <Spacer height={20} />
                            <ThemedView style={styles.separator} />
                            <Spacer height={20} />
                        </>
                    )}
                    
                    {/* Sekcja opisu */}
                    {route.description && route.description !== "Brak opisu" && (
                        <>
                            <ThemedText style={styles.sectionTitle}>Opis</ThemedText>
                            <ThemedText style={styles.description}>
                                {route.description}
                            </ThemedText>
                        </>
                    )}
                </ThemedCard>
                
                {/* Przycisk zakończenia trasy GPS */}
                {route.status === 'in-progress' && (
                    <>
                        <ThemedButton 
                            style={styles.endButton} 
                            onPress={handleEndRoute}
                            disabled={loading}
                        >
                            <Text style={{color: "#fff", textAlign: 'center', fontSize: 16}}>
                                {loading ? "Kończenie trasy..." : "✓ Zakończ trasę GPS"}
                            </Text>
                        </ThemedButton>
                        <Spacer height={10} />
                    </>
                )}
                
                {/* Przycisk usuwania trasy */}
                <ThemedButton style={styles.delete} onPress={handleDelete}>
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
    endButton: {
        marginTop: 20,
        marginHorizontal: 40,
        backgroundColor: '#2196F3',
    },
    delete: {
        marginTop: 20,
        marginHorizontal: 40,
        backgroundColor: Colors.warning,
    }
});
