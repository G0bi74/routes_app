/**
 * LiveRouteBadge - Komponent wyświetlający badge dla tras w trakcie
 * 
 * Pokazuje wizualną wskazówkę że trasa jest aktywna i wymaga zakończenia
 * 
 * Styl: Minimalistyczny z zaokrągleniami, pulsujący punkt
 */

import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';

const LiveRouteBadge = ({ status, size = 'normal' }) => {
    // Animacja pulsowania
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Nie pokazuj badge jeśli trasa zakończona
    if (status !== 'in-progress') {
        return null;
    }
    
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.badge,
            isSmall && styles.badgeSmall
        ]}>
            <Animated.View style={[
                styles.pulse,
                isSmall && styles.pulseSmall,
                { transform: [{ scale: pulseAnim }] }
            ]} />
            <ThemedText style={[
                styles.badgeText,
                isSmall && styles.badgeTextSmall
            ]}>
                W TRAKCIE
            </ThemedText>
        </View>
    );
};

export default LiveRouteBadge;

const styles = StyleSheet.create({
    badge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.primary + '40',
    },
    badgeSmall: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badgeTextSmall: {
        fontSize: 10,
    },
    pulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginRight: 8,
    },
    pulseSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
});
