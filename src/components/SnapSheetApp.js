"use client";

import { useState, useCallback } from "react";
import Header from "./Header";
import StepIndicator from "./StepIndicator";
import CaptureStep from "./CaptureStep";
import ProcessingStep from "./ProcessingStep";
import ReviewStep from "./ReviewStep";
import ExportStep from "./ExportStep";
import BottomNav from "./BottomNav";
import { useScan } from "@/hooks/useScan";
import { useAuth } from "@/hooks/useAuth";
import { useScans } from "@/hooks/useScans";
import { useToast } from "@/components/Toast";

export default function SnapSheetApp() {
  const [step, setStep] = useState("capture");
  const [images, setImages] = useState([]);
  const [scanSaved, setScanSaved] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { saveScan } = useScans();
  const toast = useToast();

  const {
    tables,
    setTables,
    progress,
    currentImage,
    errors,
    isProcessing,
    processImages,
    reset: resetScan,
  } = useScan();

  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    resetScan();
    setScanSaved(false);
    setStep("capture");
  }, [images, resetScan]);

  const handleProcess = useCallback(async () => {
    setStep("processing");
    const extracted = await processImages(images);
    if (extracted.length > 0) {
      setTimeout(() => {
        setStep("review");
        toast.success(
          `Extracted ${extracted.length} table${extracted.length !== 1 ? "s" : ""}`
        );
      }, 600);
    }
  }, [images, processImages, toast]);

  const handleExport = useCallback(async () => {
    setStep("export");

    // Save to Firestore if user is logged in and not already saved
    if (user && !scanSaved && tables.length > 0) {
      try {
        const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);
        await saveScan({
          user_id: user.id,
          title: `Scan — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
          image_count: images.length,
          table_count: tables.length,
          row_count: totalRows,
          tables_json: tables,
          status: "completed",
        });
        setScanSaved(true);
        toast.success("Scan saved to your history");
      } catch (err) {
        console.error("Failed to save scan:", err);
        toast.warning("Scan exported but could not save to history");
      }
    }
  }, [user, scanSaved, tables, images.length, saveScan, toast]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="bg-snap-bg min-h-screen max-w-[480px] mx-auto font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-snap-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-snap-bg min-h-screen max-w-[480px] mx-auto font-sans flex flex-col relative pb-16">
      <Header step={step} onReset={handleReset} />
      <StepIndicator current={step} />

      {step === "capture" && (
        <CaptureStep
          images={images}
          setImages={setImages}
          onProcess={handleProcess}
        />
      )}

      {step === "processing" && (
        <ProcessingStep
          images={images}
          progress={progress}
          currentImage={currentImage}
          errors={errors}
        />
      )}

      {step === "review" && (
        <ReviewStep
          tables={tables}
          setTables={setTables}
          onExport={handleExport}
          onBack={handleReset}
        />
      )}

      {step === "export" && (
        <ExportStep tables={tables} onReset={handleReset} />
      )}

      {/* Processing failed — show retry */}
      {step === "processing" &&
        errors.length > 0 &&
        !isProcessing &&
        tables.length === 0 && (
          <div className="px-5 pb-5 text-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-[10px] border border-snap-border bg-snap-surface text-snap-text text-[13px] cursor-pointer hover:border-snap-border-focus transition-colors"
            >
              ← Try Again with Different Images
            </button>
          </div>
        )}

      <BottomNav />
    </div>
  );
}
