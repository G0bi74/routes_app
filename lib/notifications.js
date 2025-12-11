/**
 * Serwis obsługi powiadomień systemowych
 * 
 * Obsługuje:
 * - Tworzenie trwałych powiadomień o trasie w trakcie
 * - Aktualizowanie powiadomień
 * - Usuwanie powiadomień
 * - Nasłuchiwanie na kliknięcia w powiadomienia
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Klucz do przechowywania ID powiadomienia w AsyncStorage
 */
const NOTIFICATION_ID_KEY = '@active_route_notification_id';

/**
 * Sprawdza czy aplikacja działa w Expo Go
 * W Expo Go powiadomienia mają ograniczoną funkcjonalność
 */
const isExpoGo = () => {
    return Constants.appOwnership === 'expo';
};

/**
 * Konfiguracja domyślnego zachowania powiadomień
 * - Powiadomienia będą widoczne nawet gdy aplikacja jest w foreground
 */
if (!isExpoGo()) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

/**
 * Konfiguracja kanału powiadomień dla Android
 * WYMAGANE dla Android 8.0+
 */
async function setupNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('active-route', {
            name: 'Aktywna Trasa',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF9800',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: false,
            enableLights: true,
            enableVibrate: true,
            showBadge: false,
        });
    }
}

/**
 * Żądanie uprawnień do powiadomień
 * iOS wymaga explicite zgody użytkownika
 * 
 * @returns {Promise<boolean>} true jeśli uprawnienia przyznane
 */
export async function requestNotificationPermissions() {
    // Sprawdź czy to Expo Go (ograniczona funkcjonalność)
    if (isExpoGo()) {
        console.warn('Powiadomienia w Expo Go mają ograniczoną funkcjonalność. Użyj development build dla pełnej funkcjonalności.');
        // W Expo Go możemy spróbować, ale może nie działać
    }
    
    // Sprawdź czy to fizyczne urządzenie (emulator nie wspiera powiadomień)
    if (!Device.isDevice) {
        console.warn('Powiadomienia działają tylko na fizycznym urządzeniu');
        return false;
    }

    // Pobierz obecne uprawnienia
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Jeśli nie przyznane, zapytaj użytkownika
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Brak uprawnień do powiadomień');
        return false;
    }

    // Skonfiguruj kanał dla Android
    await setupNotificationChannel();

    return true;
}

/**
 * Tworzy trwałe powiadomienie o trasie w trakcie
 * Powiadomienie będzie widoczne nawet po zamknięciu aplikacji
 * 
 * @param {Object} routeData - Dane trasy
 * @param {string} routeData.id - ID trasy
 * @param {string} routeData.startAddress - Adres startu
 * @param {Date} routeData.startedAt - Czas rozpoczęcia
 * @returns {Promise<string|null>} ID powiadomienia lub null jeśli błąd
 */
export async function createActiveRouteNotification(routeData) {
    try {
        // Sprawdź czy powiadomienie już istnieje (zabezpieczenie przed duplikacją)
        const existingNotificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
        if (existingNotificationId) {
            console.log('Powiadomienie już istnieje, pomijam tworzenie duplikatu');
            return existingNotificationId;
        }

        // Sprawdź uprawnienia
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.log('Brak uprawnień - powiadomienie nie zostanie utworzone');
            return null;
        }

        // Formatuj czas rozpoczęcia
        const startTime = routeData.startedAt?.toDate 
            ? routeData.startedAt.toDate() 
            : new Date(routeData.startedAt);
        
        const timeString = startTime.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Skróć adres
        const shortAddress = routeData.startAddress
            ?.split(',')
            .slice(0, 2)
            .join(',')
            .trim() || 'Nieznana lokalizacja';

        // Utwórz powiadomienie
        const notificationConfig = {
            content: {
                title: '🚗 Trasa w trakcie',
                body: `Rozpoczęto o ${timeString} z ${shortAddress}. Pamiętaj o zakończeniu trasy!`,
                data: {
                    routeId: routeData.id,
                    type: 'active_route',
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                sticky: true, // Nie można odrzucić przesunięciem (Android)
                autoDismiss: false, // Nie znikaj automatycznie po kliknięciu
                categoryIdentifier: 'active-route',
            },
            trigger: null, // Natychmiastowe wyświetlenie
        };

        // Android-specyficzne ustawienia
        if (Platform.OS === 'android') {
            notificationConfig.content.channelId = 'active-route';
            notificationConfig.content.android = {
                sticky: true,
                autoCancel: false, // Nie usuwaj po kliknięciu
                ongoing: true, // Trwałe powiadomienie
                priority: 'high',
            };
        }

        const notificationId = await Notifications.scheduleNotificationAsync(notificationConfig);

        // Zapisz ID powiadomienia w AsyncStorage
        await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);

        console.log('✅ Utworzono powiadomienie o trasie w trakcie:', notificationId);
        console.log('📍 Trasa ID:', routeData.id);
        console.log('⏰ Rozpoczęto:', timeString);
        console.log('🗺️  Adres:', shortAddress);
        
        return notificationId;

    } catch (error) {
        console.error('Błąd tworzenia powiadomienia:', error);
        return null;
    }
}

/**
 * Aktualizuje istniejące powiadomienie o trasie
 * Przydatne gdy zmienia się status trasy (np. odległość, czas)
 * 
 * @param {string} notificationId - ID powiadomienia do aktualizacji
 * @param {Object} updatedData - Zaktualizowane dane
 */
export async function updateActiveRouteNotification(notificationId, updatedData) {
    try {
        // Anuluj stare powiadomienie
        await Notifications.dismissNotificationAsync(notificationId);
        
        // Utwórz nowe z zaktualizowanymi danymi
        const newId = await createActiveRouteNotification(updatedData);
        
        return newId;
    } catch (error) {
        console.error('Błąd aktualizacji powiadomienia:', error);
        return null;
    }
}

/**
 * Usuwa powiadomienie o trasie w trakcie
 * Wywoływane po zakończeniu trasy
 * 
 * @returns {Promise<void>}
 */
export async function dismissActiveRouteNotification() {
    try {
        // Pobierz ID powiadomienia z AsyncStorage
        const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
        
        if (notificationId) {
            console.log('🗑️  Usuwam powiadomienie:', notificationId);
            
            // Usuń powiadomienie
            await Notifications.dismissNotificationAsync(notificationId);
            
            // Wyczyść z AsyncStorage
            await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
            
            console.log('✅ Powiadomienie usunięte');
        } else {
            console.log('ℹ️  Brak powiadomienia do usunięcia');
        }
    } catch (error) {
        console.error('❌ Błąd usuwania powiadomienia:', error);
    }
}

/**
 * Nasłuchuje na kliknięcia w powiadomienia
 * Gdy użytkownik kliknie powiadomienie, aplikacja otworzy ekran zakończenia trasy
 * 
 * @param {Function} callback - Funkcja wywoływana po kliknięciu
 * @returns {Subscription} Subskrypcja do odłączenia
 */
export function addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        // Sprawdź czy to powiadomienie o trasie
        if (data.type === 'active_route' && data.routeId) {
            callback(data.routeId);
        }
    });
}

/**
 * Sprawdza czy istnieje aktywne powiadomienie o trasie
 * 
 * @returns {Promise<boolean>}
 */
export async function hasActiveRouteNotification() {
    try {
        const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
        return notificationId !== null;
    } catch (error) {
        console.error('Błąd sprawdzania powiadomienia:', error);
        return false;
    }
}
