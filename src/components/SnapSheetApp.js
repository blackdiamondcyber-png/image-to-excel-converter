"use client";

import { useState } from "react";
import Header from "./Header";
import StepIndicator from "./StepIndicator";
import CaptureStep from "./CaptureStep";
import ProcessingStep from "./ProcessingStep";
import ReviewStep from "./ReviewStep";
import ExportStep from "./ExportStep";
import { useScan } from "@/hooks/useScan";

export default function SnapSheetApp() {
  const [step, setStep] = useState("capture");
  const [images, setImages] = useState([]);

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

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    resetScan();
    setStep("capture");
  };

  const handleProcess = async () => {
    setStep("processing");
    const extracted = await processImages(images);
    if (extracted.length > 0) {
      setTimeout(() => setStep("review"), 600);
    }
  };

  return (
    <div className="bg-snap-bg min-h-screen max-w-[480px] mx-auto font-sans flex flex-col relative">
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
          onExport={() => setStep("export")}
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
    </div>
  );
}
