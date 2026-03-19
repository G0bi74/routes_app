import * as Location from "expo-location";

export async function requestLocationPermissions() {
  try {
    console.log("Sprawdzanie uprawnień do lokalizacji...");

    const { status: existingStatus } =
      await Location.getForegroundPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      console.log("Żądanie uprawnień do lokalizacji...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Uprawnienia do lokalizacji zostały odrzucone");
      return false;
    }

    console.log("Uprawnienia do lokalizacji przyznane");
    return true;
  } catch (error) {
    console.error("Błąd podczas żądania uprawnień:", error);
    return false;
  }
}

export async function getCurrentLocation(options = {}) {
  try {
    console.log("Pobieranie aktualnej lokalizacji...");

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error(
        "Brak uprawnień do lokalizacji. Włącz lokalizację w ustawieniach aplikacji.",
      );
    }

    const defaultOptions = {
      accuracy: Location.Accuracy.High,
      timeout: 15000,
      maximumAge: 10000,
    };

    const finalOptions = { ...defaultOptions, ...options };

    if (typeof finalOptions.accuracy === "string") {
      const accuracyMap = {
        lowest: Location.Accuracy.Lowest,
        low: Location.Accuracy.Low,
        balanced: Location.Accuracy.Balanced,
        high: Location.Accuracy.High,
        highest: Location.Accuracy.Highest,
        best: Location.Accuracy.BestForNavigation,
      };
      finalOptions.accuracy =
        accuracyMap[finalOptions.accuracy] || Location.Accuracy.High;
    }

    const location = await Location.getCurrentPositionAsync(finalOptions);

    const result = {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp,
    };

    console.log("Lokalizacja pobrana:", {
      lat: result.lat,
      lon: result.lon,
      accuracy: `${result.accuracy?.toFixed(0)}m`,
    });

    return result;
  } catch (error) {
    console.error("Błąd podczas pobierania lokalizacji:", error);

    if (error.code === "E_LOCATION_SERVICES_DISABLED") {
      throw new Error(
        "Lokalizacja jest wyłączona. Włącz GPS w ustawieniach telefonu.",
      );
    } else if (error.code === "E_LOCATION_TIMEOUT") {
      throw new Error(
        "Nie udało się pobrać lokalizacji. Upewnij się, że masz dobry sygnał GPS.",
      );
    } else if (error.message.includes("uprawnienia")) {
      throw new Error(error.message);
    } else {
      throw new Error("Nie można pobrać lokalizacji. Spróbuj ponownie.");
    }
  }
}

export async function watchLocation(callback, options = {}) {
  try {
    console.log("Rozpoczynanie monitorowania lokalizacji...");

    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error("Brak uprawnień do lokalizacji");
    }

    const defaultOptions = {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
      timeInterval: 5000,
    };

    const finalOptions = { ...defaultOptions, ...options };

    if (typeof finalOptions.accuracy === "string") {
      const accuracyMap = {
        low: Location.Accuracy.Low,
        balanced: Location.Accuracy.Balanced,
        high: Location.Accuracy.High,
      };
      finalOptions.accuracy =
        accuracyMap[finalOptions.accuracy] || Location.Accuracy.High;
    }

    const subscription = await Location.watchPositionAsync(
      finalOptions,
      (location) => {
        const result = {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
          heading: location.coords.heading,
          timestamp: location.timestamp,
        };

        callback(result);
      },
    );

    console.log("Monitorowanie lokalizacji rozpoczęte");
    return subscription;
  } catch (error) {
    console.error("Błąd podczas monitorowania lokalizacji:", error);
    throw new Error("Nie można rozpocząć monitorowania lokalizacji");
  }
}

export async function isLocationEnabled() {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    console.log("Usługi lokalizacyjne:", enabled ? "włączone" : "wyłączone");
    return enabled;
  } catch (error) {
    console.error("Błąd sprawdzania usług lokalizacyjnych:", error);
    return false;
  }
}

export async function getLocationPermissionStatus() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch (error) {
    console.error("Błąd sprawdzania uprawnień:", error);
    return "undetermined";
  }
}

export function formatCoordinates(lat, lon) {
  if (!lat || !lon) return "brak danych";

  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";

  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function calculateStraightDistance(point1, point2) {
  const R = 6371e3;
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
