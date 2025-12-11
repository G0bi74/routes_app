/**
 * Hook zarządzający powiadomieniem systemowym o trasie w trakcie
 * 
 * Automatycznie:
 * - Tworzy powiadomienie gdy użytkownik rozpoczyna trasę
 * - Usuwa powiadomienie gdy trasa jest zakończona
 * - Obsługuje kliknięcia w powiadomienie (otwiera ekran zakończenia)
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useRoutes } from './useRoutes';
import {
    createActiveRouteNotification,
    dismissActiveRouteNotification,
    addNotificationResponseListener,
    hasActiveRouteNotification,
} from '../lib/notifications';

export const useActiveRouteNotification = () => {
    const { routes } = useRoutes();
    const router = useRouter();
    const notificationListener = useRef();
    const previousActiveRoute = useRef(null);
    const notificationCreated = useRef(false);

    useEffect(() => {
        // Znajdź aktywną trasę
        const activeRoute = routes.find(route => route.status === 'in-progress');

        // SCENARIUSZ 1: Nowa trasa została rozpoczęta
        if (activeRoute && !previousActiveRoute.current && !notificationCreated.current) {
            console.log('[Hook] Wykryto nową trasę - powiadomienie już powinno istnieć (utworzone przez RoutesContext)');
            notificationCreated.current = true;
        }

        // SCENARIUSZ 2: Trasa została zakończona
        if (!activeRoute && previousActiveRoute.current) {
            console.log('[Hook] Trasa zakończona - resetuję flagę');
            notificationCreated.current = false;
        }

        // SCENARIUSZ 3: Sprawdź czy po restarcie aplikacji istnieje powiadomienie bez trasy
        if (!activeRoute && !notificationCreated.current) {
            hasActiveRouteNotification().then(hasNotification => {
                if (hasNotification) {
                    console.log('[Hook] Znaleziono osierocone powiadomienie - usuwam');
                    dismissActiveRouteNotification();
                }
            });
        }

        // Zapisz obecną trasę dla następnego cyklu
        previousActiveRoute.current = activeRoute;

    }, [routes]);

    useEffect(() => {
        // Nasłuchuj na kliknięcia w powiadomienie
        notificationListener.current = addNotificationResponseListener((routeId) => {
            console.log('Użytkownik kliknął powiadomienie - przekierowuję do Create');
            
            // Przejdź do ekranu zakończenia trasy
            router.push('/(dashboard)/create');
        });

        // Cleanup
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
        };
    }, [router]);
};
