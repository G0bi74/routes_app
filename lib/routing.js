/**
 * Serwis Obliczania Tras (Routing Service)
 * 
 * Ten plik zawiera funkcje do obliczania odległości i tras między punktami
 * używając OpenRouteService Directions API
 * 
 * Dokumentacja API: https://openrouteservice.org/dev/#/api-docs/v2/directions
 */

// Klucz API OpenRouteService (ten sam co w geocoding.js)
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjIxODY4MDNhNWI2MzQ4NjBiZjEzN2E4YTUyN2UzMWIxIiwiaCI6Im11cm11cjY0In0=';

// Bazowy URL dla API Directions
const DIRECTIONS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

/**
 * Oblicza odległość drogową między dwoma punktami
 * 
 * @param {Object} startCoords - Współrzędne punktu początkowego {lat, lon}
 * @param {Object} endCoords - Współrzędne punktu końcowego {lat, lon}
 * @param {string} profile - Profil podróży ('driving-car', 'cycling-regular', 'foot-walking')
 * @returns {Promise<Object>} Obiekt zawierający:
 *   - distance: odległość w kilometrach (zaokrąglona do 2 miejsc)
 *   - duration: czas podróży w minutach
 *   - distanceMeters: odległość w metrach (dokładna wartość)
 * @throws {Error} Jeśli obliczenie się nie powiedzie
 */
export async function calculateRouteDistance(startCoords, endCoords, profile = 'driving-car') {
    try {
        // Walidacja wejścia
        if (!startCoords || !startCoords.lat || !startCoords.lon) {
            throw new Error('Nieprawidłowe współrzędne punktu początkowego');
        }
        if (!endCoords || !endCoords.lat || !endCoords.lon) {
            throw new Error('Nieprawidłowe współrzędne punktu końcowego');
        }

        console.log('Obliczanie trasy:', {
            start: `${startCoords.lat}, ${startCoords.lon}`,
            end: `${endCoords.lat}, ${endCoords.lon}`,
            profile
        });

        // Przygotowanie URL
        const url = `${DIRECTIONS_BASE_URL}/${profile}`;

        // Przygotowanie body (współrzędne w formacie [lon, lat])
        const requestBody = {
            coordinates: [
                [startCoords.lon, startCoords.lat],  // Punkt początkowy
                [endCoords.lon, endCoords.lat]       // Punkt końcowy
            ]
        };

        // Wywołanie API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json',
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Sprawdzenie odpowiedzi
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Błąd API:', errorText);
            throw new Error(`Błąd obliczania trasy: ${response.status}`);
        }

        // Parsowanie JSON
        const data = await response.json();

        // Sprawdzenie czy są dane
        if (!data.routes || data.routes.length === 0) {
            throw new Error('Nie znaleziono trasy między podanymi punktami');
        }

        // Pobranie pierwszej trasy (najkrótsza)
        const route = data.routes[0];
        const summary = route.summary;

        // Obliczenie wartości
        const distanceMeters = summary.distance;        // w metrach
        const distanceKm = distanceMeters / 1000;       // w kilometrach
        const durationSeconds = summary.duration;       // w sekundach
        const durationMinutes = durationSeconds / 60;   // w minutach

        // Zwrócenie danych w czytelnym formacie
        const result = {
            distance: parseFloat(distanceKm.toFixed(2)),        // Zaokrąglone do 2 miejsc
            distanceMeters: distanceMeters,                     // Dokładna wartość
            duration: Math.round(durationMinutes),              // Zaokrąglone minuty
            durationSeconds: durationSeconds,                   // Dokładne sekundy
        };

        console.log('Obliczanie zakończone:', result);
        return result;

    } catch (error) {
        console.error('Błąd podczas obliczania trasy:', error);
        throw error;
    }
}

/**
 * Oblicza trasę na podstawie adresów (łączy geocoding + routing)
 * 
 * @param {Object} startCoords - Współrzędne punktu początkowego {lat, lon}
 * @param {Object} endCoords - Współrzędne punktu końcowego {lat, lon}
 * @returns {Promise<Object>} Obiekt zawierający dane o trasie
 * @throws {Error} Jeśli obliczenie się nie powiedzie
 */
export async function getRouteInfo(startCoords, endCoords) {
    try {
        console.log('Pobieranie informacji o trasie...');

        // Obliczenie odległości
        const routeData = await calculateRouteDistance(startCoords, endCoords);

        // Przygotowanie pełnych informacji o trasie
        return {
            ...routeData,
            start: {
                lat: startCoords.lat,
                lon: startCoords.lon
            },
            end: {
                lat: endCoords.lat,
                lon: endCoords.lon
            }
        };

    } catch (error) {
        console.error('Błąd podczas pobierania informacji o trasie:', error);
        throw error;
    }
}

/**
 * Formatuje odległość do wyświetlenia
 * 
 * @param {number} kilometers - Odległość w kilometrach
 * @returns {string} Sformatowana odległość (np. "15.5 km" lub "850 m")
 */
export function formatDistance(kilometers) {
    // Obsługa undefined, null lub nieprawidłowych wartości
    if (kilometers === undefined || kilometers === null || isNaN(kilometers)) {
        return 'brak danych';
    }
    
    if (kilometers < 1) {
        // Jeśli mniej niż 1 km, wyświetl w metrach
        const meters = Math.round(kilometers * 1000);
        return `${meters} m`;
    } else {
        // W przeciwnym razie wyświetl w kilometrach
        return `${kilometers.toFixed(2)} km`;
    }
}

/**
 * Formatuje czas podróży do wyświetlenia
 * 
 * @param {number} minutes - Czas w minutach
 * @returns {string} Sformatowany czas (np. "1 godz 30 min" lub "45 min")
 */
export function formatDuration(minutes) {
    // Obsługa undefined, null lub nieprawidłowych wartości
    if (minutes === undefined || minutes === null || isNaN(minutes)) {
        return 'brak danych';
    }
    
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} godz`;
        } else {
            return `${hours} godz ${remainingMinutes} min`;
        }
    }
}
