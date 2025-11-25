/**
 * Hook useOcr - Łatwy dostęp do funkcjonalności OCR
 * 
 * Umożliwia rozpoznawanie tekstu ze zdjęć w dowolnym komponencie
 */

import { useContext } from 'react';
import { OcrContext } from '../context/OcrContext';

/**
 * Hook do obsługi OCR (rozpoznawania tekstu ze zdjęć)
 * @returns {Object} - { isProcessing, recognizeText, recognizeAndShowAlert }
 * 
 * @example
 * const { recognizeText, isProcessing } = useOcr();
 * 
 * const handleImage = async (imageUri) => {
 *   const result = await recognizeText(imageUri);
 *   if (result.success) {
 *     console.log('Przebieg:', result.mileage);
 *     console.log('Tekst:', result.fullText);
 *   }
 * };
 */
export const useOcr = () => {
    const context = useContext(OcrContext);

    if (!context) {
        throw new Error('useOcr musi być użyty wewnątrz OcrProvider');
    }

    return context;
};
