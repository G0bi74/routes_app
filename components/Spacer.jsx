/**
 * Komponent Spacer - Tworzy odstęp o określonej wysokości i szerokości
 * 
 * Prosty komponent pomocniczy do tworzenia przestrzeni między elementami UI
 * Używany zamiast dodawania marginów do każdego komponentu
 */

import { View } from 'react-native';

/**
 * @param {number} width - Szerokość odstępu (domyślnie 100%)
 * @param {number} height - Wysokość odstępu (domyślnie 40px)
 */
const Spacer = ({width = "100%", height = 40}) => {
    return (
        <View style={{ width, height}} />
    );
}

export default Spacer;
