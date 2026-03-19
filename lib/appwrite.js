import { Client, Storage, ID } from "react-native-appwrite";
import * as FileSystem from "expo-file-system";

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;

export const ROUTE_IMAGES_BUCKET =
  process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || "route-images";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const storage = new Storage(client);

export async function uploadRouteImage(userId, routeId, imageUri, type) {
  try {
    console.log(
      `[Appwrite] Rozpoczęcie uploadu zdjęcia ${type} dla trasy ${routeId}`,
    );
    console.log(`[Appwrite] URI zdjęcia: ${imageUri}`);

    const fileId = ID.unique();

    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error(`Plik nie istnieje: ${imageUri}`);
    }
    console.log(`[Appwrite] Rozmiar pliku: ${fileInfo.size} bytes`);

    const uploadUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files`;

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      parameters: {
        fileId: fileId,
      },
      headers: {
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,

        "X-Appwrite-Key": "",
      },
    });

    console.log(`[Appwrite] Status odpowiedzi: ${uploadResult.status}`);
    console.log(`[Appwrite] Odpowiedź: ${uploadResult.body}`);

    if (uploadResult.status !== 201 && uploadResult.status !== 200) {
      console.error("[Appwrite] Błąd odpowiedzi:", uploadResult.body);
      throw new Error(
        `Upload failed with status ${uploadResult.status}: ${uploadResult.body}`,
      );
    }

    const responseData = JSON.parse(uploadResult.body);
    console.log(`[Appwrite] Zdjęcie przesłane, ID: ${responseData.$id}`);

    const fileUrl = getFilePreviewUrl(responseData.$id);

    return {
      fileId: responseData.$id,
      url: fileUrl,
    };
  } catch (error) {
    console.error("[Appwrite] Błąd uploadu zdjęcia:", error);
    throw new Error(
      `Nie udało się przesłać zdjęcia do Appwrite: ${error.message}`,
    );
  }
}

export function getFilePreviewUrl(fileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export function getFileDownloadUrl(fileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
}

export function getFileViewUrl(fileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${ROUTE_IMAGES_BUCKET}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export async function deleteRouteImage(fileId) {
  try {
    if (!fileId) {
      console.log("[Appwrite] Brak fileId do usunięcia");
      return false;
    }

    await storage.deleteFile(ROUTE_IMAGES_BUCKET, fileId);
    console.log(`[Appwrite] Usunięto zdjęcie: ${fileId}`);
    return true;
  } catch (error) {
    console.error("[Appwrite] Błąd usuwania zdjęcia:", error);
    return false;
  }
}

export async function checkFileExists(fileId) {
  try {
    if (!fileId) return false;

    await storage.getFile(ROUTE_IMAGES_BUCKET, fileId);
    return true;
  } catch {
    return false;
  }
}

export { client };
