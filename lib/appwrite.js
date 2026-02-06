/**
 * Konfiguracja Appwrite dla przechowywania zdjęć
 * 
 * Ten plik zawiera konfigurację Appwrite Storage oraz funkcje do:
 * - Uploadowania zdjęć tras
 * - Pobierania URL do zdjęć
 * - Usuwania zdjęć
 * 
 * Appwrite używany zamiast Firebase Storage (darmowy do 2GB)
 */

import { Client, Storage, ID, Permission, Role } from 'react-native-appwrite';
import * as FileSystem from 'expo-file-system';

// Konfiguracja z zmiennych środowiskowych
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

// ID bucketa na zdjęcia (z .env lub domyślnie 'route-images')
export const ROUTE_IMAGES_BUCKET = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || 'route-images';

// Inicjalizacja klienta Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Eksport instancji Storage
export const storage = new Storage(client);

/**
 * Uploaduje zdjęcie trasy do Appwrite Storage używając REST API
 * 
 * @param {string} userId - ID użytkownika
 * @param {string} routeId - ID trasy
 * @param {string} imageUri - Lokalna ścieżka do zdjęcia (file://)
 * @param {string} type - Typ zdjęcia ('start' lub 'end')
 * @returns {Promise<{fileId: string, url: string}>} - ID pliku i URL do podglądu
 */
export async function uploadRouteImage(userId, routeId, imageUri, type) {
    try {
        console.log(`[Appwrite] Rozpoczęcie uploadu zdjęcia ${type} dla trasy ${routeId}`);
        console.log(`[Appwrite] URI zdjęcia: ${imageUri}`);
        
        // Unikalna nazwa pliku
        const fileName = `${userId}_${routeId}_${type}.jpg`;
        const fileId = ID.unique();
        
        // Sprawdź czy plik istnieje
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (!fileInfo.exists) {
            throw new Error(`Plik nie istnieje: ${imageUri}`);
        }
        console.log(`[Appwrite] Rozmiar pliku: ${fileInfo.size} bytes`);
        
        // Upload używając FileSystem.uploadAsync
        const uploadUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files`;
        
        // FileSystem.uploadAsync z permissions jako string[]
        // Appwrite API wymaga permissions[] dla każdego uprawnienia osobno
        const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            parameters: {
                fileId: fileId,
            },
            headers: {
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                // Permissions przez custom header - niektóre wersje API to akceptują
                'X-Appwrite-Key': '', // Pusty - używamy tylko project
            },
        });
        
        console.log(`[Appwrite] Status odpowiedzi: ${uploadResult.status}`);
        console.log(`[Appwrite] Odpowiedź: ${uploadResult.body}`);
        
        if (uploadResult.status !== 201 && uploadResult.status !== 200) {
            console.error('[Appwrite] Błąd odpowiedzi:', uploadResult.body);
            throw new Error(`Upload failed with status ${uploadResult.status}: ${uploadResult.body}`);
        }
        
        const responseData = JSON.parse(uploadResult.body);
        console.log(`[Appwrite] Zdjęcie przesłane, ID: ${responseData.$id}`);
        
        // Generowanie URL do podglądu
        const fileUrl = getFilePreviewUrl(responseData.$id);
        
        return {
            fileId: responseData.$id,
            url: fileUrl
        };
    } catch (error) {
        console.error('[Appwrite] Błąd uploadu zdjęcia:', error);
        throw new Error(`Nie udało się przesłać zdjęcia do Appwrite: ${error.message}`);
    }
}

/**
 * Generuje URL do podglądu zdjęcia
 * Używa endpointu /view który wymaga mniej uprawnień
 * 
 * @param {string} fileId - ID pliku w Appwrite
 * @param {number} width - Szerokość podglądu (opcjonalnie)
 * @param {number} height - Wysokość podglądu (opcjonalnie)
 * @returns {string} - URL do zdjęcia
 */
export function getFilePreviewUrl(fileId, width = 800, height = 600) {
    // Używamy /view zamiast /preview - może działać bez dodatkowych uprawnień
    // Jeśli bucket ma ustawione Read: Any, to zadziała
    return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

/**
 * Generuje URL do pobrania oryginalnego zdjęcia
 * 
 * @param {string} fileId - ID pliku w Appwrite
 * @returns {string} - URL do pobrania pliku
 */
export function getFileDownloadUrl(fileId) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
}

/**
 * Generuje URL do wyświetlenia zdjęcia (view)
 * 
 * @param {string} fileId - ID pliku w Appwrite
 * @returns {string} - URL do wyświetlenia pliku
 */
export function getFileViewUrl(fileId) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

/**
 * Usuwa zdjęcie z Appwrite Storage
 * 
 * @param {string} fileId - ID pliku do usunięcia
 * @returns {Promise<boolean>} - true jeśli usunięto pomyślnie
 */
export async function deleteRouteImage(fileId) {
    try {
        if (!fileId) {
            console.log('[Appwrite] Brak fileId do usunięcia');
            return false;
        }
        
        await storage.deleteFile(ROUTE_IMAGES_BUCKET, fileId);
        console.log(`[Appwrite] Usunięto zdjęcie: ${fileId}`);
        return true;
    } catch (error) {
        console.error('[Appwrite] Błąd usuwania zdjęcia:', error);
        return false;
    }
}

/**
 * Sprawdza czy plik istnieje w Storage
 * 
 * @param {string} fileId - ID pliku
 * @returns {Promise<boolean>} - true jeśli plik istnieje
 */
export async function checkFileExists(fileId) {
    try {
        if (!fileId) return false;
        
        await storage.getFile(ROUTE_IMAGES_BUCKET, fileId);
        return true;
    } catch (error) {
        return false;
    }
}

// Eksport klienta do ewentualnego rozszerzenia
export { client };
