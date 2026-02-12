/**
 * Register the service worker for PWA support.
 * Call this once from a client component (e.g., layout or main app).
 */
export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("SW registration failed:", err);
      });
  });
}

/**
 * Queue an extraction request for when the user comes back online.
 */
export async function queueOfflineExtraction(imageData) {
  const reg = await navigator.serviceWorker?.ready;
  if (!reg?.active) return false;

  reg.active.postMessage({
    type: "QUEUE_EXTRACTION",
    payload: imageData,
  });

  return true;
}

/**
 * Get all queued offline extractions.
 */
export async function getOfflineQueue() {
  const reg = await navigator.serviceWorker?.ready;
  if (!reg?.active) return [];

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data?.queue || []);
    };
    reg.active.postMessage({ type: "GET_QUEUE" }, [channel.port2]);
  });
}

/**
 * Clear the offline queue after processing.
 */
export async function clearOfflineQueue() {
  const reg = await navigator.serviceWorker?.ready;
  if (!reg?.active) return;
  reg.active.postMessage({ type: "CLEAR_QUEUE" });
}
