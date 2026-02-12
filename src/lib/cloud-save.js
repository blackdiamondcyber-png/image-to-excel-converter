import { getExcelBlob } from "./excel";

/**
 * Save to Google Drive via the Web Share API or open Google Drive upload.
 * Uses Web Share API if available (mobile), otherwise opens Drive upload page.
 */
export async function saveToGoogleDrive(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Try Web Share API first (works on mobile, shares to Drive/other apps)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: defaultFilename,
      });
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
      // Fall through to alternative
    }
  }

  // Fallback: create a temporary download link, then open Drive upload
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;
  a.click();
  URL.revokeObjectURL(url);

  // Open Google Drive in a new tab so user can upload from recent downloads
  window.open("https://drive.google.com/drive/my-drive", "_blank");
  return "drive-opened";
}

/**
 * Save to OneDrive — downloads the file and opens OneDrive.
 */
export async function saveToOneDrive(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: defaultFilename,
      });
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;
  a.click();
  URL.revokeObjectURL(url);

  window.open("https://onedrive.live.com", "_blank");
  return "onedrive-opened";
}

/**
 * Save to Dropbox — downloads the file and opens Dropbox.
 */
export async function saveToDropbox(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: defaultFilename,
      });
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;
  a.click();
  URL.revokeObjectURL(url);

  window.open("https://www.dropbox.com/home", "_blank");
  return "dropbox-opened";
}

/**
 * Share file using the native Web Share API (mobile).
 * Returns true if sharing was successful.
 */
export async function shareFile(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);
  const file = new File([blob], defaultFilename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({ files: [file], title: defaultFilename });
    return true;
  } catch {
    return false;
  }
}
