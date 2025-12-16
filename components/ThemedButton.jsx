/**
 * Komponent ThemedButton - Przycisk dostosowany do motywu aplikacji
 * 
 * Przycisk z efektem przezroczystości po naciśnięciu
 * Używa głównego koloru aplikacji (primary)
 * 
 * Styl: Minimalistyczny z zaokrągleniami 14px
 */

import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { Ionicons } from '@expo/vector-icons';

/**
 * @param {Object} style - Dodatkowe style
 * @param {string} icon - Nazwa ikony Ionicons (opcjonalna)
 * @param {string} variant - Wariant przycisku: 'primary' (domyślny), 'secondary', 'danger', 'outline'
 * @param {Object} children - Zawartość przycisku
 * @param {Object} props - Inne właściwości przekazywane do Pressable (np. onPress, disabled)
 */
function ThemedButton({style, icon, variant = 'primary', children, ...props}){
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    // Wybór koloru tła w zależności od wariantu
    const getBackgroundColor = () => {
        switch(variant) {
            case 'secondary': return theme.uiBackground;
            case 'danger': return Colors.warning;
            case 'outline': return 'transparent';
            default: return Colors.primary;
        }
    };
    
    // Wybór koloru tekstu w zależności od wariantu
    const getTextColor = () => {
        switch(variant) {
            case 'secondary': return theme.text;
            case 'outline': return Colors.primary;
            default: return '#fff';
        }
    };
    
    return(
        <Pressable 
            style={({pressed}) => [
                styles.btn,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && { borderWidth: 2, borderColor: Colors.primary },
                pressed && styles.pressed,
                props.disabled && styles.disabled,
                style
            ]}
            {...props}
        >
            {icon ? (
                <View style={styles.contentWithIcon}>
                    <Ionicons name={icon} size={18} color={getTextColor()} />
                    <Text style={[styles.text, { color: getTextColor() }]}>
                        {typeof children === 'string' ? children : null}
                    </Text>
                    {typeof children !== 'string' && children}
                </View>
            ) : (
                typeof children === 'string' ? (
                    <Text style={[styles.text, { color: getTextColor() }]}>{children}</Text>
                ) : children
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn:{
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        marginVertical: 6,
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    contentWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
});

export default ThemedButton;
