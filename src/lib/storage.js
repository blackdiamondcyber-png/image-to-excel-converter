import { getSupabaseBrowser } from "./supabase-browser";

/**
 * Upload a file to Supabase Storage under the user's folder.
 * Returns the storage path or null if Supabase isn't configured.
 */
export async function uploadFile(userId, folder, fileName, fileData, contentType) {
  const supabase = getSupabaseBrowser();
  if (!supabase || !userId) return null;

  const path = `${userId}/${folder}/${Date.now()}_${fileName}`;

  const { error } = await supabase.storage
    .from("snapsheet")
    .upload(path, fileData, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  return path;
}

/**
 * Upload a base64 image to Supabase Storage.
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
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(path) {
  const supabase = getSupabaseBrowser();
  if (!supabase || !path) return;

  const { error } = await supabase.storage
    .from("snapsheet")
    .remove([path]);

  if (error) {
    console.error("Storage delete error:", error);
  }
}

/**
 * Get a public (signed) URL for a storage file.
 */
export async function getSignedUrl(path, expiresIn = 3600) {
  const supabase = getSupabaseBrowser();
  if (!supabase || !path) return null;

  const { data, error } = await supabase.storage
    .from("snapsheet")
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}
