/**
 * Ekran historii tras (History)
 * 
 * Wyświetla listę wszystkich tras użytkownika z podstawowymi informacjami:
 * - Adresy (od → do)
 * - Obliczona odległość w km
 * Każda trasa jest klikalną kartą prowadzącą do szczegółów
 */

import { StyleSheet, FlatList, Pressable } from 'react-native';
import { useRoutes } from '../../hooks/useRoutes';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { formatDistance } from '../../lib/routing';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedCard from '../../components/ThemedCard';
import LiveRouteBadge from '../../components/LiveRouteBadge';

const History = () => {
    // Pobranie listy tras z kontekstu
    const { routes } = useRoutes();
    const router = useRouter();

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer/>
            
            {/* Nagłówek strony */}
            <ThemedText title={true} style={styles.heading}>
                Twoje Trasy ({routes.length})
            </ThemedText>
            
            <Spacer/>
            
            {/* Lista tras */}
            {routes.length === 0 ? (
                // Wyświetl gdy brak tras
                <ThemedView style={styles.emptyContainer}>
                    <ThemedText style={styles.emptyText}>
                        Nie masz jeszcze żadnych tras
                    </ThemedText>
                    <ThemedText style={styles.emptySubtext}>
                        Kliknij "Utwórz" aby dodać pierwszą trasę
                    </ThemedText>
                </ThemedView>
            ) : (
                // Wyświetl listę tras
                <FlatList
                    data={routes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({item}) => (
                        <Pressable onPress={() => router.push(`/routes/${item.id}`)}>
                            <ThemedCard style={styles.card}>
                                {/* Badge dla tras w trakcie */}
                                {item.status === 'in-progress' && (
                                    <>
                                        <LiveRouteBadge status={item.status} />
                                        <Spacer height={10} />
                                    </>
                                )}
                                
                                {/* Wyświetlenie adresów */}
                                <ThemedText style={styles.title}>
                                    {item.startAddress}
                                    {item.endAddress && item.endAddress !== "" && ` → ${item.endAddress}`}
                                    {(!item.endAddress || item.endAddress === "") && ' (w trakcie...)'}
                                </ThemedText>
                                
                                {/* Wyświetlenie odległości tylko dla zakończonych tras */}
                                {item.distance && item.distance > 0 && (
                                    <ThemedText style={styles.distance}>
                                        Odległość: {formatDistance(item.distance)}
                                    </ThemedText>
                                )}
                                
                                {/* Wyświetlenie czasu podróży jeśli dostępny */}
                                {item.duration && item.duration > 0 && (
                                    <ThemedText style={styles.duration}>
                                        Czas: ~{item.duration} min
                                    </ThemedText>
                                )}
                                
                                {/* Info dla tras w trakcie */}
                                {item.status === 'in-progress' && (
                                    <ThemedText style={styles.inProgressInfo}>
                                        Kliknij aby zakończyć trasę
                                    </ThemedText>
                                )}
                            </ThemedCard>
                        </Pressable>
                    )}
                />
            )}
        </ThemedView>
    );
}

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        width: '90%',
        marginHorizontal: '5%',
        marginVertical: 10,
        padding: 15,
        paddingLeft: 14,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    distance: {
        fontSize: 16,
        marginTop: 5,
    },
    duration: {
        fontSize: 14,
        marginTop: 3,
        opacity: 0.8,
    },
    inProgressInfo: {
        fontSize: 12,
        marginTop: 8,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    }
});
