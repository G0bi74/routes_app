import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useRoutes } from "./useRoutes";
import {
  dismissActiveRouteNotification,
  addNotificationResponseListener,
  hasActiveRouteNotification,
} from "../lib/notifications";

export const useActiveRouteNotification = () => {
  const { routes } = useRoutes();
  const router = useRouter();
  const notificationListener = useRef();
  const previousActiveRoute = useRef(null);
  const notificationCreated = useRef(false);

  useEffect(() => {
    const activeRoute = routes.find((route) => route.status === "in-progress");

    if (
      activeRoute &&
      !previousActiveRoute.current &&
      !notificationCreated.current
    ) {
      console.log(
        "[Hook] Wykryto nową trasę - powiadomienie już powinno istnieć (utworzone przez RoutesContext)",
      );
      notificationCreated.current = true;
    }

    if (!activeRoute && previousActiveRoute.current) {
      console.log("[Hook] Trasa zakończona - resetuję flagę");
      notificationCreated.current = false;
    }

    if (!activeRoute && !notificationCreated.current) {
      hasActiveRouteNotification().then((hasNotification) => {
        if (hasNotification) {
          console.log("[Hook] Znaleziono osierocone powiadomienie - usuwam");
          dismissActiveRouteNotification();
        }
      });
    }

    previousActiveRoute.current = activeRoute;
  }, [routes]);

  useEffect(() => {
    notificationListener.current = addNotificationResponseListener(() => {
      console.log("Użytkownik kliknął powiadomienie - przekierowuję do Create");

      router.push("/(dashboard)/create");
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, [router]);
};
