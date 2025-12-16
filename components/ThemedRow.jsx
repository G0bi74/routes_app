/**
 * Komponent ThemedRow - Wiersz z etykietą i wartością
 * 
 * Używany do wyświetlania par etykieta-wartość
 * Styl: Minimalistyczny, flexbox row
 */

import { View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

/**
 * @param {string} icon - Nazwa ikony Ionicons (opcjonalna)
 * @param {string} label - Etykieta po lewej
 * @param {string} value - Wartość po prawej
 * @param {boolean} highlight - Czy podświetlić wartość kolorem primary
 * @param {Object} style - Dodatkowe style
 */
const ThemedRow = ({ icon, label, value, highlight = false, style }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.row, style]}>
            <View style={styles.labelContainer}>
                {icon && (
                    <Ionicons 
                        name={icon} 
                        size={18} 
                        color={theme.iconColor} 
                        style={styles.icon}
                    />
                )}
                <ThemedText style={styles.label}>{label}</ThemedText>
            </View>
            <ThemedText style={[
                styles.value,
                highlight && { color: Colors.primary }
            ]}>
                {value}
            </ThemedText>
        </View>
    );
};

export default ThemedRow;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 10,
    },
    label: {
        fontSize: 15,
        opacity: 0.8,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
    },
});
