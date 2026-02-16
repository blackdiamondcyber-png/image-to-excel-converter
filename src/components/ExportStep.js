"use client";

import { useState, useEffect } from "react";
import { downloadExcel, saveExcelAs } from "@/lib/excel";
import {
  saveToGoogleDrive,
  saveToOneDrive,
  saveToDropbox,
  shareFile,
  canShareFiles,
} from "@/lib/cloud-save";
import { useToast } from "@/components/Toast";

export default function ExportStep({ tables, onReset }) {
  const [downloaded, setDownloaded] = useState(false);
  const [saving, setSaving] = useState(null);
  const [shareSupported, setShareSupported] = useState(false);
  const toast = useToast();

  // Check Web Share API support on mount (only available on mobile)
  useEffect(() => {
    setShareSupported(canShareFiles());
  }, []);

  const handleDownload = () => {
    try {
      downloadExcel(tables);
      setDownloaded(true);
      toast.success("Excel file downloaded");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate Excel file");
    }
  };

  const handleSaveAs = async () => {
    setSaving("saveas");
    try {
      const result = await saveExcelAs(tables);
      if (result === "saved") {
        setDownloaded(true);
        toast.success("File saved to chosen location");
      } else if (result === "downloaded") {
        setDownloaded(true);
        toast.success("Excel file downloaded");
      } else if (result === "cancelled") {
        // User dismissed the Save As picker — do nothing
      }
    } catch (err) {
      console.error("Save As error:", err);
      toast.error("Failed to save file");
    } finally {
      setSaving(null);
    }
  };

  const handleGoogleDrive = async () => {
    setSaving("gdrive");
    try {
      const result = await saveToGoogleDrive(tables);
      if (result === "shared") {
        setDownloaded(true);
        toast.success("Shared to Google Drive");
      } else if (result === "drive-opened") {
        setDownloaded(true);
        toast.success("File downloaded — upload it to Google Drive");
      } else if (result === "cancelled") {
        toast.warning("Share cancelled");
      }
    } catch (err) {
      console.error("Google Drive error:", err);
      toast.error("Failed to save to Google Drive");
    } finally {
      setSaving(null);
    }
  };

  const handleOneDrive = async () => {
    setSaving("onedrive");
    try {
      const result = await saveToOneDrive(tables);
      if (result === "shared") {
        setDownloaded(true);
        toast.success("Shared to OneDrive");
      } else if (result === "onedrive-opened") {
        setDownloaded(true);
        toast.success("File downloaded — upload it to OneDrive");
      } else if (result === "cancelled") {
        toast.warning("Share cancelled");
      }
    } catch (err) {
      console.error("OneDrive error:", err);
      toast.error("Failed to save to OneDrive");
    } finally {
      setSaving(null);
    }
  };

  const handleDropbox = async () => {
    setSaving("dropbox");
    try {
      const result = await saveToDropbox(tables);
      if (result === "shared") {
        setDownloaded(true);
        toast.success("Shared to Dropbox");
      } else if (result === "dropbox-opened") {
        setDownloaded(true);
        toast.success("File downloaded — upload it to Dropbox");
      } else if (result === "cancelled") {
        toast.warning("Share cancelled");
      }
    } catch (err) {
      console.error("Dropbox error:", err);
      toast.error("Failed to save to Dropbox");
    } finally {
      setSaving(null);
    }
  };

  const handleShare = async () => {
    setSaving("share");
    try {
      const shared = await shareFile(tables);
      if (shared) {
        setDownloaded(true);
        toast.success("File shared successfully");
      } else {
        toast.warning("Sharing not supported on this device");
      }
    } catch {
      toast.error("Failed to share file");
    } finally {
      setSaving(null);
    }
  };

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);

  if (!downloaded) {
    return (
      <div className="px-4 sm:px-5 py-6 flex-1 flex flex-col items-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-snap-text text-xl font-bold mb-2">
          Ready to Export
        </h2>
        <p className="text-snap-text-muted text-[13px] mb-6">
          {tables.length} table{tables.length !== 1 ? "s" : ""} · {totalRows}{" "}
          rows of data
        </p>

        {/* Primary actions */}
        <div className="w-full max-w-[340px] space-y-2.5 mb-5">
          <button
            onClick={handleSaveAs}
            disabled={!!saving}
            className="w-full py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-success to-emerald-600 text-white text-sm font-bold cursor-pointer shadow-[0_4px_24px_rgba(52,211,153,0.35)] hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
          >
            📥 {saving === "saveas" ? "Saving..." : "Save .xlsx File"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!!saving}
            className="w-full py-3 rounded-xl border border-snap-border bg-snap-surface text-snap-text text-[13px] font-medium cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
          >
            ⬇️ Quick Download
          </button>
        </div>

        {/* Cloud save options */}
        <div className="w-full max-w-[340px]">
          <p className="text-snap-text-dim text-[11px] uppercase tracking-wider font-medium mb-2.5 text-center">
            Save to Cloud Drive
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleGoogleDrive}
              disabled={!!saving}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-snap-border bg-snap-surface cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 min-h-[64px]"
            >
              {/* Google Drive triangle logo */}
              <svg width="24" height="22" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.6 66.85L3.3 72.4c-.7 1.2-.7 2.6 0 3.8.7 1.2 1.9 1.8 3.3 1.8h59.1c1.4 0 2.6-.6 3.3-1.8l3.3-5.7H6.6z" fill="#0066DA"/>
                <path d="M43.65 25.05L27.45 0h-6.6c-1.4 0-2.6.6-3.3 1.8L.15 72.55l3.3 5.7 16.2-28.1L43.65 25.05z" fill="#00AC47"/>
                <path d="M73.55 78c1.4 0 2.6-.6 3.3-1.8l10.3-17.8c.7-1.2.7-2.6 0-3.8L60.75 1.8C60.05.6 58.85 0 57.45 0H43.65l29.9 51.8-16.2 28.1h16.2z" fill="#EA4335"/>
                <path d="M43.65 25.05L27.45 0h-6.6l22.8 39.5L43.65 25.05z" fill="#00832D"/>
                <path d="M57.35 50.15L43.65 25.05 27.45 53.7h45.85l-15.95 0z" fill="#2684FC"/>
                <path d="M43.65 25.05l13.7 25.1h16.2L43.65 0v25.05z" fill="#FFBA00"/>
              </svg>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "gdrive" ? "..." : "Google Drive"}
              </span>
            </button>
            <button
              onClick={handleOneDrive}
              disabled={!!saving}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-snap-border bg-snap-surface cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 min-h-[64px]"
            >
              {/* OneDrive cloud logo */}
              <svg width="26" height="18" viewBox="0 0 26 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.1 5.4l5.2 3.1 3.8-1.5C19.9 3.1 23.3 0 27 0c-.8 0-1.6.1-2.4.2C22.2.8 20.3 2.3 19.1 4.3 17.4 2.4 14.9 1.2 12.1 1.2c-2 0-3.8.6-5.3 1.6L10.1 5.4z" fill="#0364B8" transform="scale(0.85) translate(2,2)"/>
                <path d="M10.1 5.4L6.8 2.8C5.3 1.8 3.5 1.2 1.5 1.2c-.5 0-1 0-1.5.1v0C0 1.6 0 1.9 0 2.3 0 6.1 2.7 9.3 6.3 10.2l9-1.7L10.1 5.4z" fill="#0078D4" transform="scale(0.85) translate(2,2)"/>
                <path d="M6.3 10.2c.4.1.8.1 1.2.1h16.2c2.5 0 4.6-1.5 5.5-3.7l-14-1.7L6.3 10.2z" fill="#1490DF" transform="scale(0.85) translate(2,2)"/>
                <path d="M23.7 10.3H7.5c-.4 0-.8 0-1.2-.1C2.7 9.3 0 6.1 0 2.3 0 1.9 0 1.6 0 1.3-.1 2.6 0 4 .4 5.4c.9 3.2 3.8 5.6 7.1 5.9h16.2c2.9 0 5.3-2.4 5.3-5.3 0-.5-.1-1-.2-1.5-.9 2.2-3 3.8-5.1 3.8z" fill="#28A8EA" transform="scale(0.85) translate(2,2)"/>
              </svg>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "onedrive" ? "..." : "OneDrive"}
              </span>
            </button>
            <button
              onClick={handleDropbox}
              disabled={!!saving}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-snap-border bg-snap-surface cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 min-h-[64px]"
            >
              {/* Dropbox diamond logo */}
              <svg width="24" height="22" viewBox="0 0 43 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6 0L0 8.1l8.9 7.1 12.6-7.8L12.6 0zM0 22.3l12.6 8.1 8.9-7.4-12.6-7.8L0 22.3zM21.5 23l8.9 7.4 12.6-8.1-8.9-7.1L21.5 23zM43 8.1L30.4 0l-8.9 7.4 12.6 7.8L43 8.1zM21.5 24.6l-8.9 7.4-3.7-2.4v2.7l12.6 7.6 12.6-7.6V29.6l-3.7 2.4-8.9-7.4z" fill="#0061FF"/>
              </svg>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "dropbox" ? "..." : "Dropbox"}
              </span>
            </button>
          </div>

          {/* Share button — only shown on devices that support Web Share with files */}
          {shareSupported && (
            <button
              onClick={handleShare}
              disabled={!!saving}
              className="w-full mt-2.5 py-3 rounded-xl border border-snap-border bg-snap-surface text-snap-text-muted text-[13px] cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
            >
              📤 {saving === "share" ? "Sharing..." : "Share to Other Apps"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 text-center flex-1 flex flex-col items-center justify-center">
      <div className="w-[72px] h-[72px] rounded-full bg-snap-success-bg flex items-center justify-center text-4xl mb-5 border-2 border-snap-success">
        ✓
      </div>
      <h2 className="text-snap-success text-xl font-bold mb-2">
        Export Complete!
      </h2>
      <p className="text-snap-text-muted text-[13px] mb-8">
        Your Excel file has been saved
      </p>
      <div className="flex flex-wrap gap-2.5 justify-center">
        <button
          onClick={() => setDownloaded(false)}
          className="px-6 py-3.5 rounded-xl border border-snap-border bg-snap-surface text-snap-text text-[13px] cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors min-h-[48px]"
        >
          Save Again
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-[13px] font-semibold cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity min-h-[48px]"
        >
          Scan More Images →
        </button>
      </div>
    </div>
  );
}
