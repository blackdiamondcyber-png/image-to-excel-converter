"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import StepIndicator from "./StepIndicator";
import CaptureStep from "./CaptureStep";
import ProcessingStep from "./ProcessingStep";
import ReviewStep from "./ReviewStep";
import ExportStep from "./ExportStep";
import BottomNav from "./BottomNav";
import InstallPrompt from "./InstallPrompt";
import { useScan } from "@/hooks/useScan";
import { useAuth } from "@/hooks/useAuth";
import { useScans } from "@/hooks/useScans";
import { useToast } from "@/components/Toast";

export default function SnapSheetApp() {
  const [step, setStep] = useState("capture");
  const [images, setImages] = useState([]);
  const [scanSaved, setScanSaved] = useState(false);

  const router = useRouter();
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
    if (isProcessing) return; // Guard against double-clicks
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
  }, [images, isProcessing, processImages, toast]);

  const handleExport = useCallback(() => {
    setStep("export");

    // Save scan locally on device
    if (!scanSaved && tables.length > 0) {
      try {
        const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);
        saveScan({
          title: `Scan — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
          image_count: images.length,
          table_count: tables.length,
          row_count: totalRows,
          tables_json: tables,
          status: "completed",
        });
        setScanSaved(true);
        toast.success("Scan saved to your history");
      } catch {
        toast.warning("Scan exported but could not save to history");
      }
    }
  }, [scanSaved, tables, images.length, saveScan, toast]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="bg-snap-bg min-h-screen min-h-[100dvh] max-w-[500px] mx-auto font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-snap-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-snap-bg min-h-screen min-h-[100dvh] max-w-[500px] mx-auto font-sans flex flex-col relative pb-[72px]">
      <Header step={step} onReset={handleReset} />
      <StepIndicator current={step} />

      {step === "capture" && (
        <>
          <CaptureStep
            images={images}
            setImages={setImages}
            onProcess={handleProcess}
          />
          <InstallPrompt />
        </>
      )}

      {step === "processing" && (
        <ProcessingStep
          images={images}
          progress={progress}
          currentImage={currentImage}
          errors={errors}
          isProcessing={isProcessing}
          onRetry={handleReset}
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

      <BottomNav />
    </div>
  );
}
