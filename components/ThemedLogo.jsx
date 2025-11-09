/**
 * Komponent ThemedLogo - Logo aplikacji dostosowane do motywu
 * 
 * Automatycznie wybiera odpowiednie logo (jasne/ciemne) w zależności od motywu
 * 
 * UWAGA: Ten komponent używa placeholder'a (kolorowy kwadrat) zamiast prawdziwego logo.
 * Aby dodać prawdziwe logo:
 * 1. Dodaj pliki logo_dark.png i logo_light.png do assets/img/
 * 2. Odkomentuj import'y poniżej
 * 3. Odkomentuj kod Image
 * 4. Usuń kod View (placeholder)
 */

import { View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

// Import obrazów logo (jasne i ciemne)
// UWAGA: Odkomentuj te linie gdy dodasz pliki logo
// import DarkLogo from '../assets/img/logo_dark.png';
// import LightLogo from '../assets/img/logo_light.png';

/**
 * Wyświetla logo aplikacji odpowiednie dla aktualnego motywu
 */
const ThemedLogo = ( ...props) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();

    // TYMCZASOWY PLACEHOLDER - kolorowy kwadrat zamiast logo
    // Usuń ten kod gdy dodasz prawdziwe logo
    return(
        <View style={{
            width: 100, 
            height: 100, 
            backgroundColor: Colors.primary,
            borderRadius: 20
        }} {...props} />
    );

    // Gdy dodasz prawdziwe logo, odkomentuj ten kod:
    // const logo = colorScheme === 'dark' ? DarkLogo : LightLogo;
    // return <Image source={logo} style={{width: 100, height: 100}} {...props} />;
}

export default ThemedLogo;
