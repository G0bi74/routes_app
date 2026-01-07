/**
 * Komponent ThemedLogo - Logo aplikacji
 * 
 * Wyświetla logo RoutesApp
 */

import { Image, useColorScheme } from "react-native";

// Import logo aplikacji
import Logo from '../assets/img/logo.png';

/**
 * Wyświetla logo aplikacji
 * @param {number} size - Rozmiar logo (domyślnie 120)
 */
const ThemedLogo = ({ size = 120, style, ...props }) => {
    return (
        <Image 
            source={Logo} 
            style={[
                { 
                    width: size, 
                    height: size,
                    resizeMode: 'contain'
                }, 
                style
            ]} 
            {...props} 
        />
    );
}

export default ThemedLogo;
