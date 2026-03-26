import { createContext, useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { uploadRouteImage, deleteRouteImage } from "../lib/appwrite";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useUser } from "../hooks/useUser";
import { geocodeBothAddresses, reverseGeocode } from "../lib/geocoding";
import { getRouteInfo } from "../lib/routing";
import { getCurrentLocation } from "../lib/location";
import {
  createActiveRouteNotification,
  dismissActiveRouteNotification,
} from "../lib/notifications";

const COLLECTION_NAME = "routes";

export const RoutesContext = createContext();

async function uploadPhotoToStorage(userId, routeId, photoUri, type) {
  if (!photoUri) return null;

  try {
    console.log(`[Upload] Przesyłanie zdjęcia ${type} do Appwrite...`);
    const result = await uploadRouteImage(userId, routeId, photoUri, type);
    console.log(`[Upload] Zdjęcie ${type} przesłane, URL: ${result.url}`);
    return result;
  } catch (error) {
    console.error(`[Upload] Błąd uploadu zdjęcia ${type}:`, error);

    return null;
  }
}

export const RoutesProvider = ({ children }) => {
  const [routes, setRoutes] = useState([]);

  const { user } = useUser();

  async function fetchRouteById(id) {
    try {
      const routeRef = doc(db, COLLECTION_NAME, id);

      const routeSnap = await getDoc(routeRef);

      if (routeSnap.exists()) {
        return { id: routeSnap.id, ...routeSnap.data() };
      } else {
        console.log("Trasa nie istnieje");
        return null;
      }
    } catch (error) {
      console.log("Błąd pobierania trasy:", error.message);

      const cachedRoute = routes.find((r) => r.id === id);
      if (cachedRoute) {
        console.log("Znaleziono trasę w lokalnym cache:", id);
        return cachedRoute;
      }

      return null;
    }
  }

  async function createRoute(data) {
    try {
      console.log("Rozpoczęcie tworzenia trasy...");

      console.log("Geokodowanie adresów...");
      const coordinates = await geocodeBothAddresses(
        data.startAddress,
        data.endAddress,
      );

      console.log("Obliczanie odległości...");
      const routeInfo = await getRouteInfo(coordinates.start, coordinates.end);

      const routeData = {
        startAddress: data.startAddress,
        endAddress: data.endAddress,

        startCoordinates: {
          lat: coordinates.start.lat,
          lon: coordinates.start.lon,
        },
        endCoordinates: {
          lat: coordinates.end.lat,
          lon: coordinates.end.lon,
        },

        startAddressFormatted: coordinates.start.displayName,
        endAddressFormatted: coordinates.end.displayName,

        distance: routeInfo.distance,
        distanceMeters: routeInfo.distanceMeters,
        duration: routeInfo.duration,

        userId: user.uid,
        createdAt: data.createdAt || Timestamp.now(),

        ...(data.startedAt && { startedAt: data.startedAt }),
        ...(data.completedAt && { completedAt: data.completedAt }),
        status: data.status || "completed",
      };

      console.log("Zapisywanie do bazy danych...");
      await addDoc(collection(db, COLLECTION_NAME), routeData);

      console.log("Trasa została utworzona pomyślnie!");
      console.log("Obliczona odległość:", routeInfo.distance, "km");
    } catch (error) {
      console.error("Błąd tworzenia trasy:", error.message);

      if (error.message.includes("Nie znaleziono lokalizacji")) {
        throw new Error(
          "Nie można znaleźć podanego adresu. Sprawdź czy jest poprawny.",
        );
      } else if (error.message.includes("Nie znaleziono trasy")) {
        throw new Error("Nie można obliczyć trasy między podanymi punktami.");
      } else if (
        error.message.includes("Błąd geokodowania") ||
        error.message.includes("Błąd obliczania trasy")
      ) {
        throw new Error("Problem z połączeniem do serwera. Spróbuj ponownie.");
      } else {
        throw new Error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      }
    }
  }

  async function deleteRoute(id) {
    try {
      const routeRef = doc(db, COLLECTION_NAME, id);
      const routeSnap = await getDoc(routeRef);

      if (routeSnap.exists()) {
        const routeData = routeSnap.data();

        if (routeData.startImageFileId) {
          await deleteRouteImage(routeData.startImageFileId);
        }
        if (routeData.endImageFileId) {
          await deleteRouteImage(routeData.endImageFileId);
        }
      }

      await deleteDoc(routeRef);

      console.log("Trasa i zdjęcia zostały usunięte");
    } catch (error) {
      console.log("Błąd usuwania trasy:", error.message);
    }
  }

  async function startLiveRoute(photoUri = null, mileageOcr = null) {
    try {
      console.log("Rozpoczynanie trasy na żywo...");

      console.log("Pobieranie lokalizacji GPS...");
      const location = await getCurrentLocation();

      console.log("Geokodowanie lokalizacji...");
      const addressData = await reverseGeocode(location.lat, location.lon);

      const tempRouteId = `temp_${Date.now()}`;

      let startImageData = null;
      if (photoUri) {
        startImageData = await uploadPhotoToStorage(
          user.uid,
          tempRouteId,
          photoUri,
          "start",
        );
      }

      const routeData = {
        startAddress: addressData.displayName,
        endAddress: "",

        startCoordinates: {
          lat: location.lat,
          lon: location.lon,
        },

        startAddressFormatted: addressData.displayName,
        endAddressFormatted: "",

        endCoordinates: {
          lat: 0,
          lon: 0,
        },

        distance: 0,
        distanceMeters: 0,
        duration: 0,

        startImageUri: photoUri || null,
        startImageUrl: startImageData?.url || null,
        startImageFileId: startImageData?.fileId || null,
        endImageUri: null,
        endImageUrl: null,
        endImageFileId: null,

        startMileage: mileageOcr || null,
        endMileage: null,
        mileageDistance: null,

        userId: user.uid,
        createdAt: Timestamp.now(),

        status: "in-progress",
        startedAt: Timestamp.now(),
      };

      console.log("Zapisywanie trasy do bazy...");
      const docRef = await addDoc(collection(db, COLLECTION_NAME), routeData);

      await createActiveRouteNotification({
        id: docRef.id,
        startAddress: addressData.displayName,
        startedAt: Timestamp.now(),
      });

      console.log("Trasa na żywo rozpoczęta! ID:", docRef.id);
      console.log("Lokalizacja startu:", addressData.displayName);

      return docRef.id;
    } catch (error) {
      console.error("Błąd rozpoczynania trasy na żywo:", error);
      console.error("Szczegóły błędu:", error.message, error.code);

      if (
        error.code === "permission-denied" ||
        error.message.includes("insufficient permissions")
      ) {
        throw new Error(
          "Brak uprawnień do zapisu w bazie. Sprawdź reguły Firebase.",
        );
      } else if (
        error.message.includes("uprawnienia") ||
        error.message.includes("GPS")
      ) {
        throw new Error(error.message);
      } else if (error.message.includes("lokalizacji")) {
        throw new Error(
          "Nie można pobrać lokalizacji. Sprawdź czy GPS jest włączony.",
        );
      } else {
        throw new Error(
          "Wystąpił błąd podczas rozpoczynania trasy. Spróbuj ponownie.",
        );
      }
    }
  }

  async function endLiveRoute(routeId, photoUri = null, mileageOcr = null) {
    try {
      console.log("Kończenie trasy na żywo...");

      const routeData = await fetchRouteById(routeId);

      if (!routeData) {
        throw new Error("Nie znaleziono trasy");
      }

      if (routeData.status !== "in-progress") {
        throw new Error("Trasa nie jest w trakcie");
      }

      console.log("Pobieranie lokalizacji końcowej...");
      const location = await getCurrentLocation();

      console.log("Geokodowanie lokalizacji końcowej...");
      const endAddressData = await reverseGeocode(location.lat, location.lon);

      let finalDistance = 0;
      let finalDuration = 0;
      let mileageDistance = null;
      let usedMileageForDistance = false;

      if (
        mileageOcr &&
        routeData.startMileage &&
        mileageOcr > routeData.startMileage
      ) {
        mileageDistance = mileageOcr - routeData.startMileage;
        finalDistance = mileageDistance;
        usedMileageForDistance = true;

        console.log(
          `Użyto odległości z licznika: ${mileageDistance} km (${routeData.startMileage} -> ${mileageOcr})`,
        );

        if (routeData.startedAt) {
          const startTime = routeData.startedAt.toDate();
          const endTime = new Date();
          const durationMs = endTime - startTime;
          finalDuration = Math.round(durationMs / 60000);

          console.log(`Rzeczywisty czas trasy: ${finalDuration} minut`);
        } else {
          finalDuration = Math.round((mileageDistance / 60) * 60);
          console.log(
            `Szacunkowy czas trasy: ${finalDuration} minut (brak startedAt)`,
          );
        }
      } else {
        console.log("Brak danych z licznika, obliczanie odległości z OSRM...");
        const routeInfo = await getRouteInfo(routeData.startCoordinates, {
          lat: location.lat,
          lon: location.lon,
        });

        finalDistance = routeInfo.distance;
        finalDuration = routeInfo.duration;

        console.log(
          `Użyto odległości z OSRM: ${finalDistance} km, czas: ${finalDuration} min`,
        );
      }

      let endImageData = null;
      if (photoUri) {
        endImageData = await uploadPhotoToStorage(
          user.uid,
          routeId,
          photoUri,
          "end",
        );
      }

      const updateData = {
        endAddress: endAddressData.displayName,
        endAddressFormatted: endAddressData.displayName,
        endCoordinates: {
          lat: location.lat,
          lon: location.lon,
        },

        distance: finalDistance,
        distanceMeters: finalDistance * 1000,
        duration: finalDuration,

        endMileage: mileageOcr || null,
        mileageDistance: mileageDistance,
        usedMileageForDistance: usedMileageForDistance,

        endImageUri: photoUri || null,
        endImageUrl: endImageData?.url || null,
        endImageFileId: endImageData?.fileId || null,

        status: "completed",
        completedAt: Timestamp.now(),
      };

      console.log("Aktualizacja trasy w bazie...");
      const routeRef = doc(db, COLLECTION_NAME, routeId);
      await updateDoc(routeRef, updateData);

      await dismissActiveRouteNotification();

      console.log("Trasa zakończona pomyślnie!");
      console.log("Przebyta odległość:", finalDistance, "km");
    } catch (error) {
      console.error("Błąd kończenia trasy na żywo:", error);
      console.error("Szczegóły błędu:", error.message, error.code);

      if (
        error.code === "permission-denied" ||
        error.message.includes("insufficient permissions")
      ) {
        throw new Error(
          "Brak uprawnień do aktualizacji w bazie. Sprawdź reguły Firebase.",
        );
      } else if (error.message.includes("Nie znaleziono trasy")) {
        throw new Error("Nie znaleziono trasy do zakończenia.");
      } else if (error.message.includes("nie jest w trakcie")) {
        throw new Error("Ta trasa została już zakończona.");
      } else if (
        error.message.includes("lokalizacji") ||
        error.message.includes("GPS")
      ) {
        throw new Error(
          "Nie można pobrać lokalizacji końcowej. Sprawdź czy GPS jest włączony.",
        );
      } else if (error.message.includes("Nie znaleziono trasy między")) {
        throw new Error(
          "Nie można obliczyć trasy. Sprawdź połączenie internetowe.",
        );
      } else {
        throw new Error(
          "Wystąpił błąd podczas kończenia trasy. Spróbuj ponownie.",
        );
      }
    }
  }

  useEffect(() => {
    let unsubscribe;

    if (user) {
      try {
        const q = query(
          collection(db, COLLECTION_NAME),
          where("userId", "==", user.uid),
        );

        unsubscribe = onSnapshot(q,(querySnapshot) => {
            const routesData = [];
            querySnapshot.forEach((doc) => {
              routesData.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            routesData.sort((a, b) => {
              const dateA = a.createdAt?.toDate() || new Date(0);
              const dateB = b.createdAt?.toDate() || new Date(0);
              return dateB - dateA;
            });

            setRoutes(routesData);
            console.log("Pobrano trasy:", routesData.length);
          },
          (error) => {
            console.error("Błąd nasłuchiwania tras:", error.message);
            console.error("Kod błędu:", error.code);

            if (error.code === "permission-denied") {
              console.error(
                "BŁĄD UPRAWNIEŃ: Sprawdź czy Firebase Security Rules są poprawnie skonfigurowane",
              );
              console.error(
                "Upewnij się że reguła 'allow list' jest ustawiona dla /routes/{routeId}",
              );
            }

            setRoutes([]);
          },
        );
      } catch (error) {
        console.error("Błąd tworzenia zapytania:", error.message);
        setRoutes([]);
      }
    } else {
      setRoutes([]);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <RoutesContext.Provider
      value={{
        routes,
        setRoutes,
        fetchRouteById,
        createRoute,
        startLiveRoute,
        endLiveRoute,
        deleteRoute,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
};

export default RoutesProvider;
