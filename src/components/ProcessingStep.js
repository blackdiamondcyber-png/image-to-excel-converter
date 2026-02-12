"use client";

export default function ProcessingStep({
  images,
  progress,
  currentImage,
  errors,
}) {
  return (
    <div className="px-5 py-10 text-center">
      {/* Spinner */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-full border-[3px] border-snap-border border-t-snap-accent animate-spin-slow" />

      <h2 className="text-snap-text text-lg font-bold mb-2">
        Extracting Data with AI...
      </h2>
      <p className="text-snap-text-muted text-[13px] mb-8">
        Claude Vision is analyzing your {images.length} image
        {images.length !== 1 ? "s" : ""}
      </p>

      {/* Progress Bar */}
      <div className="bg-snap-surface rounded-[10px] p-5 border border-snap-border max-w-[400px] mx-auto">
        <div className="flex justify-between mb-2.5">
          <span className="text-snap-text-muted text-xs">
            Processing image {currentImage} of {images.length}
          </span>
          <span className="text-snap-accent text-xs font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-snap-bg rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-snap-accent to-purple-600 rounded-sm transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {errors.length > 0 && (
          <div className="mt-3.5">
            {errors.map((err, i) => (
              <div
                key={i}
                className="bg-snap-danger-bg border border-snap-danger rounded-lg px-3 py-2 mt-1.5 text-[11px] text-snap-danger text-left"
              >
                ⚠ {err}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
