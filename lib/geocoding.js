/**
 * Serwis Geokodowania (Geocoding Service)
 * 
 * Ten plik zawiera funkcje do zamiany adresów na współrzędne geograficzne
 * używając OpenRouteService Geocoding API
 * 
 * Dokumentacja API: https://openrouteservice.org/dev/#/api-docs/geocode
 */

// Klucz API OpenRouteService
// UWAGA: W produkcji powinien być przechowywany w zmiennych środowiskowych
// Zarejestruj się na: https://openrouteservice.org/dev/#/signup
// Klucz API OpenRouteService z zmiennych środowiskowych
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

// Bazowy URL dla API Geocoding
const GEOCODING_BASE_URL = 'https://api.openrouteservice.org/geocode';

/**
 * Zamienia adres tekstowy na współrzędne geograficzne (geocoding)
 * 
 * @param {string} address - Adres do geokodowania (np. "Warszawa, Marszałkowska 1")
 * @returns {Promise<Object>} Obiekt zawierający:
 *   - lat: szerokość geograficzna
 *   - lon: długość geograficzna
 *   - displayName: sformatowany adres
 * @throws {Error} Jeśli geokodowanie się nie powiedzie
 */
export async function geocodeAddress(address) {
    try {
        // Walidacja wejścia
        if (!address || address.trim().length === 0) {
            throw new Error('Adres nie może być pusty');
        }

        console.log('Geokodowanie adresu:', address);

        // Przygotowanie URL z parametrami
        const url = `${GEOCODING_BASE_URL}/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;

        // Wywołanie API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        // Sprawdzenie odpowiedzi
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Błąd API:', errorText);
            throw new Error(`Błąd geokodowania: ${response.status}`);
        }

        // Parsowanie JSON
        const data = await response.json();

        // Sprawdzenie czy znaleziono wyniki
        if (!data.features || data.features.length === 0) {
            throw new Error(`Nie znaleziono lokalizacji dla adresu: ${address}`);
        }

        // Pobranie pierwszego wyniku (najbardziej trafny)
        const firstResult = data.features[0];
        const coordinates = firstResult.geometry.coordinates; // [lon, lat]
        const properties = firstResult.properties;

        // Zwrócenie danych w czytelnym formacie
        const result = {
            lat: coordinates[1],              // Szerokość geograficzna
            lon: coordinates[0],              // Długość geograficzna
            displayName: properties.label,    // Sformatowany adres
            country: properties.country,      // Kraj
            city: properties.locality,        // Miasto
        };

        console.log('Geokodowanie zakończone:', result);
        return result;

    } catch (error) {
        console.error('Błąd podczas geokodowania:', error);
        throw error;
    }
}

/**
 * Geokoduje dwa adresy jednocześnie (optymalizacja)
 * 
 * @param {string} startAddress - Adres początkowy
 * @param {string} endAddress - Adres końcowy
 * @returns {Promise<Object>} Obiekt zawierający:
 *   - start: {lat, lon, displayName}
 *   - end: {lat, lon, displayName}
 * @throws {Error} Jeśli którekolwiek geokodowanie się nie powiedzie
 */
export async function geocodeBothAddresses(startAddress, endAddress) {
    try {
        console.log('Geokodowanie obu adresów...');

        // Wykonanie obu zapytań równolegle dla szybszego działania
        const [startCoords, endCoords] = await Promise.all([
            geocodeAddress(startAddress),
            geocodeAddress(endAddress)
        ]);

        return {
            start: startCoords,
            end: endCoords
        };

    } catch (error) {
        console.error('Błąd podczas geokodowania adresów:', error);
        throw error;
    }
}

/**
 * Zamienia współrzędne GPS na adres (reverse geocoding)
 * 
 * @param {number} lat - Szerokość geograficzna
 * @param {number} lon - Długość geograficzna
 * @returns {Promise<Object>} Obiekt zawierający:
 *   - displayName: sformatowany pełny adres
 *   - street: ulica z numerem
 *   - city: miasto
 *   - country: kraj
 *   - lat: szerokość geograficzna
 *   - lon: długość geograficzna
 * @throws {Error} Jeśli reverse geocoding się nie powiedzie
 */
export async function reverseGeocode(lat, lon) {
    try {
        // Walidacja wejścia
        if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
            throw new Error('Nieprawidłowe współrzędne');
        }

        console.log('Reverse geocoding:', lat, lon);

        // Przygotowanie URL dla reverse geocoding
        const url = `${GEOCODING_BASE_URL}/reverse?api_key=${ORS_API_KEY}&point.lon=${lon}&point.lat=${lat}`;

        // Wywołanie API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        // Sprawdzenie odpowiedzi
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Błąd API:', errorText);
            throw new Error(`Błąd reverse geocoding: ${response.status}`);
        }

        // Parsowanie JSON
        const data = await response.json();

        // Sprawdzenie czy znaleziono wyniki
        if (!data.features || data.features.length === 0) {
            throw new Error('Nie znaleziono adresu dla podanych współrzędnych');
        }

        // Pobranie pierwszego wyniku
        const firstResult = data.features[0];
        const properties = firstResult.properties;

        // Budowanie adresu ulicy
        let street = '';
        if (properties.street) {
            street = properties.street;
            if (properties.housenumber) {
                street += ' ' + properties.housenumber;
            }
        }

        // Zwrócenie danych w czytelnym formacie
        const result = {
            displayName: properties.label,         // Pełny adres
            street: street || properties.name,     // Ulica z numerem
            city: properties.locality || properties.region, // Miasto
            postalCode: properties.postalcode,     // Kod pocztowy
            country: properties.country,           // Kraj
            lat: lat,                              // Oryginalne współrzędne
            lon: lon,
        };

        console.log('Reverse geocoding zakończone:', result.displayName);
        return result;

    } catch (error) {
        console.error('Błąd podczas reverse geocoding:', error);
        throw error;
    }
}

/**
 * Sprawdza czy klucz API jest poprawny
 * 
 * @returns {Promise<boolean>} true jeśli klucz działa, false w przeciwnym razie
 */
export async function validateApiKey() {
    try {
        // Testowe geokodowanie prostego adresu
        await geocodeAddress('Warszawa, Polska');
        return true;
    } catch (error) {
        console.error('Błąd walidacji klucza API:', error);
        return false;
    }
}
