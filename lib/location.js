/**
 * Serwis Lokalizacji (Location Service)
 * 
 * Ten plik zawiera funkcje do pobierania lokalizacji GPS z urządzenia
 * oraz zarządzania uprawnieniami lokalizacyjnymi.
 * 
 * Używa Expo Location API: https://docs.expo.dev/versions/latest/sdk/location/
 */

import * as Location from 'expo-location';

/**
 * Sprawdza i żąda uprawnień do lokalizacji
 * 
 * @returns {Promise<boolean>} true jeśli uprawnienia zostały przyznane, false w przeciwnym razie
 */
export async function requestLocationPermissions() {
    try {
        console.log('Sprawdzanie uprawnień do lokalizacji...');

        // Sprawdzenie obecnego statusu uprawnień
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

        let finalStatus = existingStatus;

        // Jeśli uprawnienia nie zostały jeszcze przyznane, poproś o nie
        if (existingStatus !== 'granted') {
            console.log('Żądanie uprawnień do lokalizacji...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            finalStatus = status;
        }

        // Sprawdzenie wyniku
        if (finalStatus !== 'granted') {
            console.log('Uprawnienia do lokalizacji zostały odrzucone');
            return false;
        }

        console.log('Uprawnienia do lokalizacji przyznane');
        return true;

    } catch (error) {
        console.error('Błąd podczas żądania uprawnień:', error);
        return false;
    }
}

/**
 * Pobiera aktualną lokalizację urządzenia
 * 
 * @param {Object} options - Opcje pobierania lokalizacji
 * @param {string} options.accuracy - Dokładność ('low', 'balanced', 'high', 'highest', 'best')
 * @param {number} options.timeout - Maksymalny czas oczekiwania w ms (domyślnie 15000)
 * @returns {Promise<Object>} Obiekt zawierający:
 *   - lat: szerokość geograficzna
 *   - lon: długość geograficzna
 *   - accuracy: dokładność w metrach
 *   - altitude: wysokość npm
 *   - timestamp: znacznik czasu
 * @throws {Error} Jeśli nie można pobrać lokalizacji
 */
export async function getCurrentLocation(options = {}) {
    try {
        console.log('Pobieranie aktualnej lokalizacji...');

        // Sprawdzenie uprawnień
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            throw new Error('Brak uprawnień do lokalizacji. Włącz lokalizację w ustawieniach aplikacji.');
        }

        // Domyślne opcje
        const defaultOptions = {
            accuracy: Location.Accuracy.High, // Wysoka dokładność
            timeout: 15000,                    // 15 sekund timeout
            maximumAge: 10000,                 // Akceptuj lokalizację nie starszą niż 10 sekund
        };

        // Połączenie domyślnych opcji z przekazanymi
        const finalOptions = { ...defaultOptions, ...options };

        // Mapowanie łatwiejszych nazw accuracy
        if (typeof finalOptions.accuracy === 'string') {
            const accuracyMap = {
                'lowest': Location.Accuracy.Lowest,
                'low': Location.Accuracy.Low,
                'balanced': Location.Accuracy.Balanced,
                'high': Location.Accuracy.High,
                'highest': Location.Accuracy.Highest,
                'best': Location.Accuracy.BestForNavigation,
            };
            finalOptions.accuracy = accuracyMap[finalOptions.accuracy] || Location.Accuracy.High;
        }

        // Pobranie lokalizacji
        const location = await Location.getCurrentPositionAsync(finalOptions);

        // Ekstrakcja współrzędnych
        const result = {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            accuracy: location.coords.accuracy,          // Dokładność w metrach
            altitude: location.coords.altitude,          // Wysokość npm
            speed: location.coords.speed,                // Prędkość m/s
            heading: location.coords.heading,            // Kierunek w stopniach
            timestamp: location.timestamp,               // Timestamp
        };

        console.log('Lokalizacja pobrana:', {
            lat: result.lat,
            lon: result.lon,
            accuracy: `${result.accuracy?.toFixed(0)}m`
        });

        return result;

    } catch (error) {
        console.error('Błąd podczas pobierania lokalizacji:', error);
        
        // Obsługa różnych błędów
        if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
            throw new Error('Lokalizacja jest wyłączona. Włącz GPS w ustawieniach telefonu.');
        } else if (error.code === 'E_LOCATION_TIMEOUT') {
            throw new Error('Nie udało się pobrać lokalizacji. Upewnij się, że masz dobry sygnał GPS.');
        } else if (error.message.includes('uprawnienia')) {
            throw new Error(error.message);
        } else {
            throw new Error('Nie można pobrać lokalizacji. Spróbuj ponownie.');
        }
    }
}

/**
 * Monitoruje lokalizację w czasie rzeczywistym
 * 
 * @param {Function} callback - Funkcja wywoływana przy każdej zmianie lokalizacji
 * @param {Object} options - Opcje monitorowania
 * @param {string} options.accuracy - Dokładność ('low', 'balanced', 'high')
 * @param {number} options.distanceInterval - Minimalna odległość zmiany w metrach (domyślnie 10)
 * @param {number} options.timeInterval - Minimalny czas między aktualizacjami w ms (domyślnie 5000)
 * @returns {Promise<Object>} Obiekt z metodą remove() do zatrzymania monitorowania
 * @throws {Error} Jeśli nie można rozpocząć monitorowania
 * 
 * @example
 * const subscription = await watchLocation((location) => {
 *   console.log('Nowa lokalizacja:', location.lat, location.lon);
 * });
 * // Zatrzymanie monitorowania
 * subscription.remove();
 */
export async function watchLocation(callback, options = {}) {
    try {
        console.log('Rozpoczynanie monitorowania lokalizacji...');

        // Sprawdzenie uprawnień
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) {
            throw new Error('Brak uprawnień do lokalizacji');
        }

        // Domyślne opcje
        const defaultOptions = {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,   // Aktualizuj co 10 metrów
            timeInterval: 5000,     // Aktualizuj co 5 sekund
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Mapowanie accuracy
        if (typeof finalOptions.accuracy === 'string') {
            const accuracyMap = {
                'low': Location.Accuracy.Low,
                'balanced': Location.Accuracy.Balanced,
                'high': Location.Accuracy.High,
            };
            finalOptions.accuracy = accuracyMap[finalOptions.accuracy] || Location.Accuracy.High;
        }

        // Rozpoczęcie monitorowania
        const subscription = await Location.watchPositionAsync(
            finalOptions,
            (location) => {
                // Przetworzenie lokalizacji
                const result = {
                    lat: location.coords.latitude,
                    lon: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                    altitude: location.coords.altitude,
                    speed: location.coords.speed,
                    heading: location.coords.heading,
                    timestamp: location.timestamp,
                };

                // Wywołanie callback
                callback(result);
            }
        );

        console.log('Monitorowanie lokalizacji rozpoczęte');
        return subscription;

    } catch (error) {
        console.error('Błąd podczas monitorowania lokalizacji:', error);
        throw new Error('Nie można rozpocząć monitorowania lokalizacji');
    }
}

/**
 * Sprawdza czy usługi lokalizacyjne są włączone
 * 
 * @returns {Promise<boolean>} true jeśli GPS jest włączony, false w przeciwnym razie
 */
export async function isLocationEnabled() {
    try {
        const enabled = await Location.hasServicesEnabledAsync();
        console.log('Usługi lokalizacyjne:', enabled ? 'włączone' : 'wyłączone');
        return enabled;
    } catch (error) {
        console.error('Błąd sprawdzania usług lokalizacyjnych:', error);
        return false;
    }
}

/**
 * Sprawdza status uprawnień bez ich żądania
 * 
 * @returns {Promise<string>} Status uprawnień ('granted', 'denied', 'undetermined')
 */
export async function getLocationPermissionStatus() {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status;
    } catch (error) {
        console.error('Błąd sprawdzania uprawnień:', error);
        return 'undetermined';
    }
}

/**
 * Formatuje współrzędne do wyświetlenia
 * 
 * @param {number} lat - Szerokość geograficzna
 * @param {number} lon - Długość geograficzna
 * @returns {string} Sformatowane współrzędne (np. "52.2297° N, 21.0122° E")
 */
export function formatCoordinates(lat, lon) {
    if (!lat || !lon) return 'brak danych';

    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';

    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

/**
 * Oblicza odległość w linii prostej między dwoma punktami (Haversine formula)
 * 
 * @param {Object} point1 - Pierwszy punkt {lat, lon}
 * @param {Object} point2 - Drugi punkt {lat, lon}
 * @returns {number} Odległość w metrach
 */
export function calculateStraightDistance(point1, point2) {
    const R = 6371e3; // Promień Ziemi w metrach
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Odległość w metrach
}
