import { createContext, useState } from "react";
import { useAlert } from "../components/ThemedAlert";

const OCR_SPACE_API_KEY =
  process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;

export const OcrContext = createContext();

export const OcrProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showAlert } = useAlert();

  const recognizeText = async (imageUri) => {
    setIsProcessing(true);

    try {
      const base64Image = await convertImageToBase64(imageUri);

      const formData = new FormData();
      formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
      formData.append("language", "pol");
      formData.append("isOverlayRequired", "false");
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("OCREngine", "2");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: OCR_SPACE_API_KEY,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || "Błąd przetwarzania obrazu");
      }

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const parsedResult = result.ParsedResults[0];
        const fullText = parsedResult.ParsedText || "";

        if (!fullText || fullText.trim() === "") {
          return {
            success: false,
            fullText: "",
            detectedTexts: [],
            numbers: [],
            mileage: null,
            error: "Nie wykryto tekstu na zdjęciu",
          };
        }

        const lines = fullText.split(/[\r\n]+/).filter((line) => line.trim());
        const detectedTexts = lines.flatMap((line) =>
          line.split(/\s+/).filter((word) => word.trim()),
        );

        const numbers = extractNumbers(fullText);

        const mileage = detectMileage(fullText, numbers);

        return {
          success: true,
          fullText: fullText.trim(),
          detectedTexts,
          numbers,
          mileage,
        };
      } else {
        throw new Error("Brak wyników z API");
      }
    } catch (error) {
      console.error("Błąd OCR:", error);
      return {
        success: false,
        fullText: "",
        detectedTexts: [],
        numbers: [],
        mileage: null,
        error: error.message || "Błąd rozpoznawania tekstu",
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Błąd konwersji obrazu:", error);
      throw error;
    }
  };

  const extractNumbers = (text) => {
    const cleanText = text.replace(/(\d)\s+(?=\d)/g, "$1");
    const matches = cleanText.match(/\d+/g);
    if (!matches) return [];

    return matches
      .map((num) => parseInt(num, 10))
      .filter((num) => !isNaN(num))
      .sort((a, b) => b - a);
  };

  const detectMileage = (fullText, numbers) => {
    if (!numbers || numbers.length === 0) return null;

    const possibleMileages = numbers.filter(
      (num) => num >= 100 && num <= 999999,
    );

    if (possibleMileages.length === 0) return null;

    return possibleMileages[0];
  };

  const recognizeAndShowAlert = async (imageUri) => {
    const result = await recognizeText(imageUri);

    if (result.success) {
      const message = `
Rozpoznany tekst:
${result.fullText}

Wykryte liczby: ${result.numbers.join(", ")}
${result.mileage ? `\nPrzebieg: ${result.mileage} km` : "\nBrak przebiegu"}
            `.trim();

      showAlert("Wynik OCR", message, { variant: "info" });
    } else {
      showAlert("Błąd OCR", result.error || "Nie udało się rozpoznać tekstu", {
        variant: "error",
      });
    }
  };

  const value = {
    isProcessing,
    recognizeText,
    recognizeAndShowAlert,
  };

  return <OcrContext.Provider value={value}>{children}</OcrContext.Provider>;
};
