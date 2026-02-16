import { storage } from "./firebase";
import { ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";

/**
 * Upload a file to Firebase Storage under the user's folder.
 * Returns the storage path or null if Firebase isn't configured.
 */
export async function uploadFile(userId, folder, fileName, fileData, contentType) {
  if (!storage || !userId) return null;

  const path = `${userId}/${folder}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, path);

  try {
    await uploadBytes(storageRef, fileData, { contentType });
    return path;
  } catch {
    // Storage operation failed — return null
    return null;
  }
}

/**
 * Upload a base64 image to Firebase Storage.
 */
export async function uploadBase64Image(userId, fileName, base64Data, mediaType) {
  const byteChars = atob(base64Data);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: mediaType });
  return uploadFile(userId, "images", fileName, blob, mediaType);
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(path) {
  if (!storage || !path) return;

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch {
    // Delete failed — no action needed
  }
}

/**
 * Get a download URL for a storage file.
 */
export async function getFileUrl(path) {
  if (!storage || !path) return null;

  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch {
    // URL fetch failed — return null
    return null;
  }
}
