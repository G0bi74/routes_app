const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

const DIRECTIONS_BASE_URL = "https://api.openrouteservice.org/v2/directions";

export async function calculateRouteDistance(
  startCoords,
  endCoords,
  profile = "driving-car",
) {
  try {
    if (!startCoords || !startCoords.lat || !startCoords.lon) {
      throw new Error("Nieprawidłowe współrzędne punktu początkowego");
    }
    if (!endCoords || !endCoords.lat || !endCoords.lon) {
      throw new Error("Nieprawidłowe współrzędne punktu końcowego");
    }

    console.log("Obliczanie trasy:", {
      start: `${startCoords.lat}, ${startCoords.lon}`,
      end: `${endCoords.lat}, ${endCoords.lon}`,
      profile,
    });

    const url = `${DIRECTIONS_BASE_URL}/${profile}`;

    const requestBody = {
      coordinates: [
        [startCoords.lon, startCoords.lat],
        [endCoords.lon, endCoords.lat],
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, application/geo+json",
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd API:", errorText);
      throw new Error(`Błąd obliczania trasy: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("Nie znaleziono trasy między podanymi punktami");
    }

    const route = data.routes[0];
    const summary = route.summary;

    const distanceMeters = summary.distance;
    const distanceKm = distanceMeters / 1000;
    const durationSeconds = summary.duration;
    const durationMinutes = durationSeconds / 60;

    const result = {
      distance: parseFloat(distanceKm.toFixed(2)),
      distanceMeters: distanceMeters,
      duration: Math.round(durationMinutes),
      durationSeconds: durationSeconds,
    };

    console.log("Obliczanie zakończone:", result);
    return result;
  } catch (error) {
    console.error("Błąd podczas obliczania trasy:", error);
    throw error;
  }
}

export async function getRouteInfo(startCoords, endCoords) {
  try {
    console.log("Pobieranie informacji o trasie...");

    const routeData = await calculateRouteDistance(startCoords, endCoords);

    return {
      ...routeData,
      start: {
        lat: startCoords.lat,
        lon: startCoords.lon,
      },
      end: {
        lat: endCoords.lat,
        lon: endCoords.lon,
      },
    };
  } catch (error) {
    console.error("Błąd podczas pobierania informacji o trasie:", error);
    throw error;
  }
}

export function formatDistance(kilometers) {
  if (kilometers === undefined || kilometers === null || isNaN(kilometers)) {
    return "brak danych";
  }

  if (kilometers < 1) {
    const meters = Math.round(kilometers * 1000);
    return `${meters} m`;
  } else {
    return `${kilometers.toFixed(2)} km`;
  }
}

export function formatDuration(minutes) {
  if (minutes === undefined || minutes === null || isNaN(minutes)) {
    return "brak danych";
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
