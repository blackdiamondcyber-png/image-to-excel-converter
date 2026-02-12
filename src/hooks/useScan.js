"use client";

import { useState, useCallback } from "react";

/**
 * Convert a File to a base64 string (data portion only).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
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
 * Hook that manages the scan workflow:
 * - Sends images to /api/extract one by one
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

    const extractedTables = [];

    for (let i = 0; i < images.length; i++) {
      setCurrentImage(i + 1);
      setProgress((i / images.length) * 100);

      try {
        const base64Data = await fileToBase64(images[i].file);
        const mediaType = getMediaType(images[i].file);

        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data, mediaType }),
        });

        const data = await response.json();

        if (!response.ok) {
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
