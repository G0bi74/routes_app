/**
 * Komponent ThemedAlert - Stylowane powiadomienia/alerty
 * 
 * Zastępuje standardowe Alert.alert z React Native
 * Automatycznie dostosowuje się do motywu jasnego/ciemnego
 * 
 * Warianty:
 * - success: Zielony (potwierdzenie sukcesu)
 * - error: Czerwony (błędy)
 * - warning: Pomarańczowy (ostrzeżenia)
 * - info: Niebieski (informacje)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    Pressable, 
    StyleSheet, 
    useColorScheme,
    Animated,
    Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Kontekst dla globalnych alertów
 */
const AlertContext = createContext(null);

/**
 * Hook do używania alertów w aplikacji
 * @returns {Object} - { showAlert, hideAlert }
 */
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

/**
 * Konfiguracja wariantów alertów
 */
const VARIANTS = {
    success: {
        icon: 'checkmark-circle',
        color: Colors.primary,
        lightBg: '#e8f5e9',
        darkBg: '#1b3d24',
    },
    error: {
        icon: 'close-circle',
        color: Colors.warning,
        lightBg: '#ffebee',
        darkBg: '#3d1b1b',
    },
    warning: {
        icon: 'warning',
        color: '#FF9800',
        lightBg: '#fff3e0',
        darkBg: '#3d2e1b',
    },
    info: {
        icon: 'information-circle',
        color: '#2196F3',
        lightBg: '#e3f2fd',
        darkBg: '#1b2d3d',
    },
};

/**
 * Provider dla alertów - umieść w głównym komponencie aplikacji
 */
export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const isDark = colorScheme === 'dark';

    /**
     * Pokazuje alert
     * @param {string} title - Tytuł alertu
     * @param {string} message - Treść alertu
     * @param {Object} options - Opcje alertu
     * @param {string} options.variant - 'success' | 'error' | 'warning' | 'info'
     * @param {Array} options.buttons - Przyciski [{text, onPress, style}]
     * @param {boolean} options.dismissable - Czy można zamknąć klikając tło
     */
    const showAlert = useCallback((title, message, options = {}) => {
        const {
            variant = 'info',
            buttons = [{ text: 'OK' }],
            dismissable = true,
        } = options;

        setAlert({ title, message, variant, buttons, dismissable });
        
        // Animacja wejścia
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    /**
     * Ukrywa alert
     */
    const hideAlert = useCallback((callback) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setAlert(null);
            if (callback) callback();
        });
    }, [fadeAnim, scaleAnim]);

    /**
     * Obsługa kliknięcia przycisku
     */
    const handleButtonPress = (button) => {
        hideAlert(() => {
            if (button.onPress) button.onPress();
        });
    };

    /**
     * Obsługa kliknięcia tła
     */
    const handleBackdropPress = () => {
        if (alert?.dismissable) {
            hideAlert();
        }
    };

    const variantConfig = alert ? VARIANTS[alert.variant] || VARIANTS.info : VARIANTS.info;

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            
            <Modal
                visible={!!alert}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={handleBackdropPress}
            >
                <Animated.View 
                    style={[
                        styles.overlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Pressable 
                        style={[
                            styles.backdrop,
                            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)' }
                        ]} 
                        onPress={handleBackdropPress}
                    />
                    
                    <Animated.View 
                        style={[
                            styles.alertContainer,
                            { 
                                backgroundColor: theme.uiBackground,
                                transform: [{ scale: scaleAnim }],
                            },
                            isDark ? styles.alertShadowDark : styles.alertShadowLight,
                        ]}
                    >
                        {/* Nagłówek z ikoną */}
                        <View 
                            style={[
                                styles.header,
                                { backgroundColor: isDark ? variantConfig.darkBg : variantConfig.lightBg }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: variantConfig.color }]}>
                                <Ionicons 
                                    name={variantConfig.icon} 
                                    size={28} 
                                    color="#fff" 
                                />
                            </View>
                        </View>
                        
                        {/* Treść */}
                        <View style={styles.content}>
                            <Text style={[styles.title, { color: theme.title }]}>
                                {alert?.title}
                            </Text>
                            {alert?.message && (
                                <Text style={[styles.message, { color: theme.text }]}>
                                    {alert.message}
                                </Text>
                            )}
                        </View>
                        
                        {/* Przyciski */}
                        <View style={[styles.buttonsContainer, { borderTopColor: isDark ? '#3a3649' : '#e0dfe8' }]}>
                            {alert?.buttons.map((button, index) => {
                                const isDestructive = button.style === 'destructive';
                                const isCancel = button.style === 'cancel';
                                const isPrimary = !isDestructive && !isCancel && index === alert.buttons.length - 1;
                                
                                return (
                                    <Pressable
                                        key={index}
                                        style={({ pressed }) => [
                                            styles.button,
                                            isPrimary && { backgroundColor: Colors.primary },
                                            isDestructive && { backgroundColor: Colors.warning },
                                            isCancel && { backgroundColor: theme.background },
                                            alert.buttons.length === 1 && styles.singleButton,
                                            pressed && styles.buttonPressed,
                                        ]}
                                        onPress={() => handleButtonPress(button)}
                                    >
                                        <Text 
                                            style={[
                                                styles.buttonText,
                                                isPrimary && { color: '#fff' },
                                                isDestructive && { color: '#fff' },
                                                isCancel && { color: theme.text },
                                                !isPrimary && !isDestructive && !isCancel && { color: Colors.primary },
                                            ]}
                                        >
                                            {button.text}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>
        </AlertContext.Provider>
    );
};

/**
 * Pomocnicze funkcje do szybkiego wywoływania alertów
 * Użycie: const { success, error, warning, info } = useAlertHelpers();
 */
export const useAlertHelpers = () => {
    const { showAlert } = useAlert();
    
    return {
        success: (title, message, buttons) => 
            showAlert(title, message, { variant: 'success', buttons }),
        
        error: (title, message, buttons) => 
            showAlert(title, message, { variant: 'error', buttons }),
        
        warning: (title, message, buttons) => 
            showAlert(title, message, { variant: 'warning', buttons }),
        
        info: (title, message, buttons) => 
            showAlert(title, message, { variant: 'info', buttons }),
        
        confirm: (title, message, onConfirm, onCancel) =>
            showAlert(title, message, {
                variant: 'warning',
                dismissable: false,
                buttons: [
                    { text: 'Anuluj', style: 'cancel', onPress: onCancel },
                    { text: 'Potwierdź', onPress: onConfirm },
                ],
            }),
    };
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    alertContainer: {
        width: Math.min(SCREEN_WIDTH - 48, 340),
        borderRadius: 20,
        overflow: 'hidden',
    },
    alertShadowLight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    alertShadowDark: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 16,
    },
    header: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    singleButton: {
        borderRadius: 0,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AlertProvider;
