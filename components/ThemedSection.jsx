/**
 * Komponent ThemedSection - Sekcja z nagłówkiem i ikoną
 * 
 * Używany do grupowania treści z nagłówkiem sekcji
 * Styl: Minimalistyczny z ikonami Ionicons
 */

import { View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

/**
 * @param {string} title - Tytuł sekcji
 * @param {string} icon - Nazwa ikony Ionicons
 * @param {Object} style - Dodatkowe style kontenera
 * @param {Object} children - Zawartość sekcji
 */
const ThemedSection = ({ title, icon, style, children }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.section, style]}>
            {title && (
                <View style={styles.header}>
                    {icon && (
                        <Ionicons 
                            name={icon} 
                            size={20} 
                            color={Colors.primary} 
                        />
                    )}
                    <ThemedText style={styles.title} title>
                        {title}
                    </ThemedText>
                </View>
            )}
            {children}
        </View>
    );
};

export default ThemedSection;

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
});
