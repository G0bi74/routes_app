/**
 * Ekran historii tras (History)
 * 
 * Wyświetla listę wszystkich tras użytkownika
 * Każda trasa jest klikalną kartą prowadzącą do szczegółów
 */

import { StyleSheet, FlatList, Pressable } from 'react-native';
import { useRoutes } from '../../hooks/useRoutes';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

// Importowanie themed components
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';
import ThemedCard from '../../components/ThemedCard';

const History = () => {
    // Pobranie listy tras z kontekstu
    const { routes } = useRoutes();
    const router = useRouter();

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer/>
            
            {/* Nagłówek strony */}
            <ThemedText title={true} style={styles.heading}>
                Przejechane Trasy:
            </ThemedText>
            
            <Spacer/>
            
            {/* Lista tras */}
            <FlatList
                data={routes}
                keyExtractor={(item) => item.id}  // Unikalny klucz dla każdej trasy
                contentContainerStyle={styles.list}
                renderItem={({item}) => (
                    // Każda trasa jest klikalną kartą
                    <Pressable onPress={() => router.push(`/routes/${item.id}`)}>
                        <ThemedCard style={styles.card}>
                            {/* Wyświetlenie danych trasy */}
                            <ThemedText style={styles.title}>
                                {item.startAdress} → {item.endAdress}
                            </ThemedText>
                            <ThemedText>
                                Data: {item.date}
                            </ThemedText>
                            <ThemedText>
                                {item.startTime} - {item.endTime}
                            </ThemedText>
                        </ThemedCard>
                    </Pressable>
                )}
            />
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
        fontSize: 18,
        textAlign: 'center',
    },
    list: {
        marginTop: 40, 
    },
    card: {
        width: '90%',
        marginHorizontal: '5%',
        marginVertical: 10,
        padding: 10,
        paddingLeft: 14,
        borderLeftColor: Colors.primary,  // Kolorowy pasek z lewej strony karty
        borderLeftWidth: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
