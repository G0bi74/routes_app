/**
 * Ekran szczegółów trasy (Route Details)
 * 
 * Wyświetla wszystkie informacje o wybranej trasie
 * Umożliwia usunięcie trasy
 */

import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRoutes } from '../../../hooks/useRoutes';
import { useRouter } from 'expo-router';

// Importowanie themed components
import Spacer from '../../../components/Spacer';
import ThemedText from '../../../components/ThemedText';
import ThemedView from '../../../components/ThemedView';
import ThemedCard from '../../../components/ThemedCard';
import ThemedButton from '../../../components/ThemedButton';
import ThemedLoader from '../../../components/ThemedLoader';
import { Colors } from '../../../constants/Colors';

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
            <ThemedCard style={styles.card}>
                {/* Tytuł - trasa od-do */}
                <ThemedText style={styles.title}>
                    {route.startAdress} → {route.endAdress}
                </ThemedText>
                
                {/* Data i godziny */}
                <ThemedText>Data: {route.date}</ThemedText>
                <ThemedText>
                    Rozpoczęcie: {route.startTime}
                </ThemedText>
                <ThemedText>
                    Zakończenie: {route.endTime}
                </ThemedText>
                
                <Spacer/>
                
                {/* Sekcja opisu */}
                <ThemedText title={true}>Opis trasy:</ThemedText>
                <Spacer/>
                <ThemedText>{route.description}</ThemedText>
            </ThemedCard>
            
            {/* Przycisk usuwania trasy */}
            <ThemedButton style={styles.delete} onPress={handleDelete}>
                <Text style={{color: "#fff", textAlign: 'center'}}>
                    Usuń Trasę
                </Text>
            </ThemedButton>
        </ThemedView>
    );
}

export default RouteDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
    },
    title:{
        fontSize: 22,
        marginVertical: 10,
    },
    card: {
        margin: 20,
    },
    delete: {
        marginTop: 40,
        backgroundColor: Colors.warning,  // Czerwony kolor dla przycisku usuwania
        width: 200,
        alignSelf: 'center',
    }
});
