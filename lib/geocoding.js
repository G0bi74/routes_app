const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

const GEOCODING_BASE_URL = "https://api.openrouteservice.org/geocode";

export async function geocodeAddress(address) {
  try {
    if (!address || address.trim().length === 0) {
      throw new Error("Adres nie może być pusty");
    }

    console.log("Geokodowanie adresu:", address);

    const url = `${GEOCODING_BASE_URL}/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd API:", errorText);
      throw new Error(`Błąd geokodowania: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error(`Nie znaleziono lokalizacji dla adresu: ${address}`);
    }

    const firstResult = data.features[0];
    const coordinates = firstResult.geometry.coordinates;
    const properties = firstResult.properties;

    const result = {
      lat: coordinates[1],
      lon: coordinates[0],
      displayName: properties.label,
      country: properties.country,
      city: properties.locality,
    };

    console.log("Geokodowanie zakończone:", result);
    return result;
  } catch (error) {
    console.error("Błąd podczas geokodowania:", error);
    throw error;
  }
}

export async function geocodeBothAddresses(startAddress, endAddress) {
  try {
    console.log("Geokodowanie obu adresów...");

    const [startCoords, endCoords] = await Promise.all([
      geocodeAddress(startAddress),
      geocodeAddress(endAddress),
    ]);

    return {
      start: startCoords,
      end: endCoords,
    };
  } catch (error) {
    console.error("Błąd podczas geokodowania adresów:", error);
    throw error;
  }
}

export async function reverseGeocode(lat, lon) {
  try {
    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      throw new Error("Nieprawidłowe współrzędne");
    }

    console.log("Reverse geocoding:", lat, lon);

    const url = `${GEOCODING_BASE_URL}/reverse?api_key=${ORS_API_KEY}&point.lon=${lon}&point.lat=${lat}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd API:", errorText);
      throw new Error(`Błąd reverse geocoding: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("Nie znaleziono adresu dla podanych współrzędnych");
    }

    const firstResult = data.features[0];
    const properties = firstResult.properties;

    let street = "";
    if (properties.street) {
      street = properties.street;
      if (properties.housenumber) {
        street += " " + properties.housenumber;
      }
    }

    const result = {
      displayName: properties.label,
      street: street || properties.name,
      city: properties.locality || properties.region,
      postalCode: properties.postalcode,
      country: properties.country,
      lat: lat,
      lon: lon,
    };

    console.log("Reverse geocoding zakończone:", result.displayName);
    return result;
  } catch (error) {
    console.error("Błąd podczas reverse geocoding:", error);
    throw error;
  }
}

export async function validateApiKey() {
  try {
    await geocodeAddress("Warszawa, Polska");
    return true;
  } catch (error) {
    console.error("Błąd walidacji klucza API:", error);
    return false;
  }
}
