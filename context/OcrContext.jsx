/**
 * OcrContext - Kontekst dla rozpoznawania tekstu ze zdjęć (OCR)
 * 
 * Wykorzystuje OCR.space API do rozpoznawania:
 * - Stanu licznika (przebieg pojazdu)
 * - Numerów rejestracyjnych
 * - Innych tekstów ze zdjęć tras
 */

import { createContext, useState } from "react";
import { Alert } from "react-native";

// Klucz API do OCR.space - darmowy API key lub własny z ocr.space
const OCR_SPACE_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY || 'K87899142388957';

// Tworzenie kontekstu dla OCR
export const OcrContext = createContext();

/**
 * Provider dla kontekstu OCR
 * Zarządza rozpoznawaniem tekstu ze zdjęć
 */
export const OcrProvider = ({ children }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Rozpoznaje tekst ze zdjęcia przy użyciu OCR.space API
     * @param {string} imageUri - URI lokalnego zdjęcia (file://)
     * @returns {Object} - { fullText, detectedTexts, numbers, mileage }
     */
    const recognizeText = async (imageUri) => {
        setIsProcessing(true);
        
        try {
            // Konwertuj obraz do Base64
            const base64Image = await convertImageToBase64(imageUri);
            
            // Przygotuj dane dla OCR.space API
            const formData = new FormData();
            formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
            formData.append('language', 'pol'); // Polski + angielski
            formData.append('isOverlayRequired', 'false');
            formData.append('detectOrientation', 'true');
            formData.append('scale', 'true');
            formData.append('OCREngine', '2'); // Engine 2 - lepszy dla liczb
            
            // Wywołaj OCR.space API
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                    'apikey': OCR_SPACE_API_KEY,
                },
                body: formData,
            });

            const result = await response.json();
            
            if (result.IsErroredOnProcessing) {
                throw new Error(result.ErrorMessage || 'Błąd przetwarzania obrazu');
            }

            if (result.ParsedResults && result.ParsedResults.length > 0) {
                const parsedResult = result.ParsedResults[0];
                const fullText = parsedResult.ParsedText || '';
                
                if (!fullText || fullText.trim() === '') {
                    return {
                        success: false,
                        fullText: '',
                        detectedTexts: [],
                        numbers: [],
                        mileage: null,
                        error: 'Nie wykryto tekstu na zdjęciu'
                    };
                }

                // Podziel tekst na linie i słowa
                const lines = fullText.split(/[\r\n]+/).filter(line => line.trim());
                const detectedTexts = lines.flatMap(line => 
                    line.split(/\s+/).filter(word => word.trim())
                );
                
                // Wyciągnij wszystkie liczby
                const numbers = extractNumbers(fullText);
                
                // Spróbuj znaleźć przebieg (licznik)
                const mileage = detectMileage(fullText, numbers);

                return {
                    success: true,
                    fullText: fullText.trim(),
                    detectedTexts,
                    numbers,
                    mileage,
                };
            } else {
                throw new Error('Brak wyników z API');
            }
            
        } catch (error) {
            console.error('Błąd OCR:', error);
            return {
                success: false,
                fullText: '',
                detectedTexts: [],
                numbers: [],
                mileage: null,
                error: error.message || 'Błąd rozpoznawania tekstu'
            };
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Konwertuje obraz URI na Base64
     * @param {string} uri - URI obrazu
     * @returns {string} - Base64 string bez prefiksu data:image
     */
    const convertImageToBase64 = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Usuń prefix "data:image/jpeg;base64," żeby zostało tylko Base64
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Błąd konwersji obrazu:', error);
            throw error;
        }
    };

    /**
     * Wyciąga wszystkie liczby z tekstu
     * @param {string} text - Tekst do przetworzenia
     * @returns {Array<number>} - Tablica znalezionych liczb
     */
    const extractNumbers = (text) => {
        // Znajdź wszystkie sekwencje cyfr (usuń spacje między cyframi)
        const cleanText = text.replace(/(\d)\s+(?=\d)/g, '$1');
        const matches = cleanText.match(/\d+/g);
        if (!matches) return [];
        
        // Konwertuj na liczby i sortuj malejąco
        return matches
            .map(num => parseInt(num, 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a);
    };

    /**
     * Próbuje wykryć przebieg pojazdu (licznik) z tekstu
     * Heurystyka: szuka największej liczby w zakresie typowym dla przebiegu (100-999999 km)
     * @param {string} fullText - Pełny rozpoznany tekst
     * @param {Array<number>} numbers - Tablica wszystkich znalezionych liczb
     * @returns {number|null} - Wykryty przebieg lub null
     */
    const detectMileage = (fullText, numbers) => {
        if (!numbers || numbers.length === 0) return null;
        
        // Szukaj liczb w zakresie typowym dla przebiegu (100 - 999999 km)
        // Zakładamy że przebieg to 3-6 cyfr
        const possibleMileages = numbers.filter(num => num >= 100 && num <= 999999);
        
        if (possibleMileages.length === 0) return null;
        
        // Zwróć największą liczbę (najczęściej to będzie przebieg)
        return possibleMileages[0];
    };

    /**
     * Rozpoznaje tekst i pokazuje wynik w alertcie (do testowania)
     * @param {string} imageUri - URI zdjęcia
     */
    const recognizeAndShowAlert = async (imageUri) => {
        const result = await recognizeText(imageUri);
        
        if (result.success) {
            const message = `
Rozpoznany tekst:
${result.fullText}

Wykryte liczby: ${result.numbers.join(', ')}
${result.mileage ? `\nPrzebieg: ${result.mileage} km` : '\nBrak przebiegu'}
            `.trim();
            
            Alert.alert('Wynik OCR', message);
        } else {
            Alert.alert('Błąd OCR', result.error || 'Nie udało się rozpoznać tekstu');
        }
    };

    // Wartości i funkcje udostępniane przez kontekst
    const value = {
        isProcessing,
        recognizeText,
        recognizeAndShowAlert,
    };

    return (
        <OcrContext.Provider value={value}>
            {children}
        </OcrContext.Provider>
    );
};
