"use client";

import { useState } from "react";
import { downloadExcel, saveExcelAs } from "@/lib/excel";
import {
  saveToGoogleDrive,
  saveToOneDrive,
  saveToDropbox,
  shareFile,
} from "@/lib/cloud-save";
import { useToast } from "@/components/Toast";

export default function ExportStep({ tables, onReset }) {
  const [downloaded, setDownloaded] = useState(false);
  const [saving, setSaving] = useState(null);
  const toast = useToast();

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
              <span className="text-lg">🟢</span>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "gdrive" ? "..." : "Google Drive"}
              </span>
            </button>
            <button
              onClick={handleOneDrive}
              disabled={!!saving}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-snap-border bg-snap-surface cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 min-h-[64px]"
            >
              <span className="text-lg">🔵</span>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "onedrive" ? "..." : "OneDrive"}
              </span>
            </button>
            <button
              onClick={handleDropbox}
              disabled={!!saving}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-snap-border bg-snap-surface cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 min-h-[64px]"
            >
              <span className="text-lg">🔷</span>
              <span className="text-snap-text-muted text-[10px] font-medium">
                {saving === "dropbox" ? "..." : "Dropbox"}
              </span>
            </button>
          </div>

          {/* Share button (mobile) */}
          <button
            onClick={handleShare}
            disabled={!!saving}
            className="w-full mt-2.5 py-3 rounded-xl border border-snap-border bg-snap-surface text-snap-text-muted text-[13px] cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
          >
            📤 {saving === "share" ? "Sharing..." : "Share to Other Apps"}
          </button>
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
