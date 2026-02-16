"use client";

export default function ProcessingStep({
  images,
  progress,
  currentImage,
  errors,
  isProcessing,
  onRetry,
}) {
  const failed = !isProcessing && errors.length > 0;

  return (
    <div className="px-4 sm:px-5 py-10 text-center" role="status" aria-busy={!failed} aria-live="polite">
      {failed ? (
        <>
          {/* Failure icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-snap-danger-bg border-2 border-snap-danger flex items-center justify-center text-3xl">
            ✕
          </div>
          <h2 className="text-snap-text text-lg font-bold mb-2">
            Extraction Failed
          </h2>
          <p className="text-snap-text-muted text-[13px] mb-6">
            {errors.length === 1
              ? "There was a problem processing your image"
              : `${errors.length} errors occurred during processing`}
          </p>
        </>
      ) : (
        <>
          {/* Spinner */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-[3px] border-snap-border border-t-snap-accent animate-spin-slow" aria-label="Processing" />
          <h2 className="text-snap-text text-lg font-bold mb-2">
            Extracting Data with AI...
          </h2>
          <p className="text-snap-text-muted text-[13px] mb-8">
            Claude Vision is analyzing your {images.length} image
            {images.length !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {/* Progress Bar */}
      <div className="bg-snap-surface rounded-xl p-5 border border-snap-border max-w-[400px] mx-auto">
        <div className="flex justify-between mb-2.5">
          <span className="text-snap-text-muted text-xs">
            {failed
              ? `Processed ${images.length} image${images.length !== 1 ? "s" : ""}`
              : `Processing image ${currentImage} of ${images.length}`}
          </span>
          <span className={`text-xs font-semibold ${failed ? "text-snap-danger" : "text-snap-accent"}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-snap-bg rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              failed
                ? "bg-gradient-to-r from-snap-danger to-red-600"
                : "bg-gradient-to-r from-snap-accent to-purple-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {errors.length > 0 && (
          <div className="mt-3.5">
            {errors.map((err, i) => (
              <div
                key={i}
                className="bg-snap-danger-bg border border-snap-danger rounded-lg px-3 py-2.5 mt-1.5 text-[11px] text-snap-danger text-left"
                role="alert"
              >
                ⚠ {err}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retry button — shown when processing failed */}
      {failed && onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-3.5 rounded-xl border border-snap-border bg-snap-surface text-snap-text text-[13px] cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors min-h-[48px]"
        >
          ← Try Again with Different Images
        </button>
      )}
    </div>
  );
}
