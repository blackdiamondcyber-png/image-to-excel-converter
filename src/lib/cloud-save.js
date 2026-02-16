import { getExcelBlob } from "./excel";

/**
 * Helper: download a blob as a file using an <a> tag.
 * Delays URL revocation to give the browser time to start the download.
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revocation — some mobile browsers need time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Helper: try Web Share API with a file.
 * Returns "shared" | "cancelled" | "unsupported".
 */
async function tryWebShare(file, filename) {
  if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
    return "unsupported";
  }
  try {
    await navigator.share({ files: [file], title: filename });
    return "shared";
  } catch (err) {
    if (err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}

/**
 * Helper: safely open a URL without being blocked by popup blockers.
 * On mobile, window.open() in an async callback is often blocked.
 * We open the window first, then set the location.
 */
function safeOpenUrl(url) {
  try {
    const win = window.open("", "_blank");
    if (win) {
      win.location.href = url;
    } else {
      // Popup blocked — just navigate in same tab as last resort
      window.location.href = url;
    }
  } catch {
    window.open(url, "_blank");
  }
}

/**
 * Save to Google Drive.
 * Mobile: uses Web Share API (user picks "Save to Drive" from share sheet).
 * Desktop: downloads the file, then opens Google Drive for manual upload.
 */
export async function saveToGoogleDrive(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const result = await tryWebShare(file, defaultFilename);
  if (result === "shared") return "shared";
  if (result === "cancelled") return "cancelled";

  // Fallback: download + open Google Drive
  downloadBlob(blob, defaultFilename);
  // Small delay so the download starts before opening the new tab
  setTimeout(() => safeOpenUrl("https://drive.google.com/drive/my-drive"), 500);
  return "drive-opened";
}

/**
 * Save to OneDrive.
 * Mobile: uses Web Share API.
 * Desktop: downloads the file, then opens OneDrive for manual upload.
 */
export async function saveToOneDrive(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const result = await tryWebShare(file, defaultFilename);
  if (result === "shared") return "shared";
  if (result === "cancelled") return "cancelled";

  downloadBlob(blob, defaultFilename);
  setTimeout(() => safeOpenUrl("https://onedrive.live.com"), 500);
  return "onedrive-opened";
}

/**
 * Save to Dropbox.
 * Mobile: uses Web Share API.
 * Desktop: downloads the file, then opens Dropbox for manual upload.
 */
export async function saveToDropbox(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const result = await tryWebShare(file, defaultFilename);
  if (result === "shared") return "shared";
  if (result === "cancelled") return "cancelled";

  downloadBlob(blob, defaultFilename);
  setTimeout(() => safeOpenUrl("https://www.dropbox.com/home"), 500);
  return "dropbox-opened";
}

/**
 * Share file using the native Web Share API (mobile).
 * Returns true if sharing was successful, false if unsupported or failed.
 */
export async function shareFile(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const result = await tryWebShare(file, defaultFilename);
  return result === "shared";
}

/**
 * Check if the Web Share API with files is supported.
 * Used by ExportStep to conditionally show the Share button.
 */
export function canShareFiles() {
  if (typeof navigator === "undefined") return false;
  if (!navigator.canShare) return false;
  try {
    const testFile = new File(["test"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
