/**
 * Layout dla sekcji autoryzacji (auth)
 * 
 * Ten layout opakowuje wszystkie strony związane z autoryzacją:
 * - Logowanie (login)
 * - Rejestracja (register)
 * 
 * Używa komponentu GuestsOnly do ochrony - tylko niezalogowani użytkownicy
 * mogą zobaczyć te strony
 */

import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import GuestsOnly from "../../components/auth/GuestsOnly";

export default function AuthLayout(){
    return (
        <GuestsOnly>
            {/* Pasek statusu (godzina, bateria, etc.) */}
            <StatusBar style="auto"/>
            
            {/* Stack Navigator dla ekranów autoryzacji */}
            <Stack
                screenOptions={{
                    headerShown: false,      // Ukrycie nagłówka
                    animation: "none"        // Brak animacji między ekranami
                }}
            />
        </GuestsOnly>
    );
}
