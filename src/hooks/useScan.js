"use client";

import { useState, useCallback } from "react";
import { auth } from "@/lib/firebase";

/**
 * Compress an image file using canvas to reduce size before sending to API.
 * Target: max 1024px on longest side, JPEG quality 0.7.
 * This significantly reduces token usage (and therefore cost).
 */
function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1024;
      let { width, height } = img;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG base64 at 0.7 quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mediaType: "image/jpeg" });
    };
    img.onerror = () => {
      // Fall back to raw file if canvas fails
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          base64: reader.result.split(",")[1],
          mediaType: getMediaType(file),
        });
      reader.readAsDataURL(file);
    };
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    // Clean up blob URL after image loads or fails
    const cleanup = () => URL.revokeObjectURL(objectUrl);
    img.addEventListener("load", cleanup, { once: true });
    img.addEventListener("error", cleanup, { once: true });
  });
}

/**
 * Map file MIME type to Anthropic-accepted media type.
 */
function getMediaType(file) {
  const map = {
    "image/jpeg": "image/jpeg",
    "image/jpg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
  };
  return map[file.type] || "image/jpeg";
}

/**
 * Get the current user's Firebase ID token for API authentication.
 */
async function getAuthToken() {
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Hook that manages the scan workflow:
 * - Compresses images client-side to save API costs
 * - Sends images to /api/extract one by one with auth token
 * - Tracks progress and errors
 * - Returns extracted tables
 */
export function useScan() {
  const [tables, setTables] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImages = useCallback(async (images) => {
    setIsProcessing(true);
    setProgress(0);
    setErrors([]);
    setTables([]);

    const token = await getAuthToken();
    if (!token) {
      setErrors(["You must be signed in to process images"]);
      setIsProcessing(false);
      return [];
    }

    const extractedTables = [];

    for (let i = 0; i < images.length; i++) {
      setCurrentImage(i + 1);
      setProgress((i / images.length) * 100);

      try {
        // Compress image to reduce API token usage
        const { base64, mediaType } = await compressImage(images[i].file);

        const response = await fetch("/api/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64, mediaType }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If rate limited, stop processing remaining images
          if (response.status === 429) {
            setErrors((prev) => [...prev, data.error || "Rate limit reached"]);
            break;
          }
          setErrors((prev) => [
            ...prev,
            `Image ${i + 1} (${images[i].name}): ${data.error || "API error"}`,
          ]);
          continue;
        }

        if (data.tables && Array.isArray(data.tables)) {
          data.tables.forEach((t) => {
            extractedTables.push({
              headers: t.headers || [],
              rows: t.rows || [],
              source: images[i].name,
              title: t.title || `Table from ${images[i].name}`,
            });
          });
        }
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `Image ${i + 1} (${images[i].name}): ${err.message}`,
        ]);
      }

      setProgress(((i + 1) / images.length) * 100);
    }

    setTables(extractedTables);
    setIsProcessing(false);

    return extractedTables;
  }, []);

  const reset = useCallback(() => {
    setTables([]);
    setProgress(0);
    setCurrentImage(0);
    setErrors([]);
    setIsProcessing(false);
  }, []);

  return {
    tables,
    setTables,
    progress,
    currentImage,
    errors,
    isProcessing,
    processImages,
    reset,
  };
}
