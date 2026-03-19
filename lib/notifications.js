import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const NOTIFICATION_ID_KEY = "@active_route_notification_id";

const isExpoGo = () => {
  return Constants.appOwnership === "expo";
};

if (!isExpoGo()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("active-route", {
      name: "Aktywna Trasa",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF9800",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
      enableLights: true,
      enableVibrate: true,
      showBadge: false,
    });
  }
}

export async function requestNotificationPermissions() {
  if (isExpoGo()) {
    console.warn(
      "Powiadomienia w Expo Go mają ograniczoną funkcjonalność. Użyj development build dla pełnej funkcjonalności.",
    );
  }

  if (!Device.isDevice) {
    console.warn("Powiadomienia działają tylko na fizycznym urządzeniu");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Brak uprawnień do powiadomień");
    return false;
  }

  await setupNotificationChannel();

  return true;
}

export async function createActiveRouteNotification(routeData) {
  try {
    const existingNotificationId =
      await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingNotificationId) {
      console.log("Powiadomienie już istnieje, pomijam tworzenie duplikatu");
      return existingNotificationId;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Brak uprawnień - powiadomienie nie zostanie utworzone");
      return null;
    }

    const startTime = routeData.startedAt?.toDate
      ? routeData.startedAt.toDate()
      : new Date(routeData.startedAt);

    const timeString = startTime.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const shortAddress =
      routeData.startAddress?.split(",").slice(0, 2).join(",").trim() ||
      "Nieznana lokalizacja";

    const notificationConfig = {
      content: {
        title: "🚗 Trasa w trakcie",
        body: `Rozpoczęto o ${timeString} z ${shortAddress}. Pamiętaj o zakończeniu trasy!`,
        data: {
          routeId: routeData.id,
          type: "active_route",
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: true,
        autoDismiss: false,
        categoryIdentifier: "active-route",
      },
      trigger: null,
    };

    if (Platform.OS === "android") {
      notificationConfig.content.channelId = "active-route";
      notificationConfig.content.android = {
        sticky: true,
        autoCancel: false,
        ongoing: true,
        priority: "high",
      };
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync(notificationConfig);

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);

    console.log(
      "✅ Utworzono powiadomienie o trasie w trakcie:",
      notificationId,
    );
    console.log("📍 Trasa ID:", routeData.id);
    console.log("⏰ Rozpoczęto:", timeString);
    console.log("🗺️  Adres:", shortAddress);

    return notificationId;
  } catch (error) {
    console.error("Błąd tworzenia powiadomienia:", error);
    return null;
  }
}

export async function updateActiveRouteNotification(
  notificationId,
  updatedData,
) {
  try {
    await Notifications.dismissNotificationAsync(notificationId);

    const newId = await createActiveRouteNotification(updatedData);

    return newId;
  } catch (error) {
    console.error("Błąd aktualizacji powiadomienia:", error);
    return null;
  }
}

export async function dismissActiveRouteNotification() {
  try {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);

    if (notificationId) {
      console.log("🗑️  Usuwam powiadomienie:", notificationId);

      await Notifications.dismissNotificationAsync(notificationId);

      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);

      console.log("✅ Powiadomienie usunięte");
    } else {
      console.log("ℹ️  Brak powiadomienia do usunięcia");
    }
  } catch (error) {
    console.error("❌ Błąd usuwania powiadomienia:", error);
  }
}

export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    if (data.type === "active_route" && data.routeId) {
      callback(data.routeId);
    }
  });
}

export async function hasActiveRouteNotification() {
  try {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    return notificationId !== null;
  } catch (error) {
    console.error("Błąd sprawdzania powiadomienia:", error);
    return false;
  }
}
