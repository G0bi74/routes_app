/**
 * LiveRouteBadge - Komponent wyświetlający badge dla tras w trakcie
 * 
 * Pokazuje wizualną wskazówkę że trasa jest aktywna i wymaga zakończenia
 */

import { View, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const LiveRouteBadge = ({ status }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Nie pokazuj badge jeśli trasa zakończona
    if (status !== 'in-progress') {
        return null;
    }

    return (
        <View style={[styles.badge, { backgroundColor: colors.tint }]}>
            <View style={styles.pulse} />
            <ThemedText style={styles.badgeText}>
                W TRAKCIE
            </ThemedText>
        </View>
    );
};

export default LiveRouteBadge;

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    pulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff4444',
        marginRight: 6,
    }
});
