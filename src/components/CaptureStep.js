"use client";

import { useRef, useCallback } from "react";

const MAX_IMAGES = 20;

export default function CaptureStep({ images, setImages, onProcess }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      const remaining = MAX_IMAGES - images.length;
      const newFiles = Array.from(files).slice(0, remaining);
      const newImages = newFiles.map((f) => ({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));
      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, setImages]
  );

  const removeImage = (id) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  return (
    <div className="p-5 flex-1">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-snap-border rounded-2xl text-center cursor-pointer bg-snap-surface transition-all duration-300 hover:border-snap-accent hover:bg-snap-accent-glow"
        style={{ padding: images.length === 0 ? "48px 20px" : "24px 20px" }}
      >
        <div className="text-[40px] mb-3">
          {images.length === 0 ? "📄" : "➕"}
        </div>
        <p className="text-snap-text text-[15px] font-semibold mb-1.5">
          {images.length === 0
            ? "Upload Images"
            : `Add More (${images.length}/${MAX_IMAGES})`}
        </p>
        <p className="text-snap-text-muted text-xs">
          Tap to browse files · Supports JPG, PNG, WEBP
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Camera Button */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full mt-3 py-3.5 rounded-xl border border-snap-border bg-snap-surface text-snap-text text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:border-snap-border-focus transition-colors"
      >
        📷 Take Photo with Camera
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden border border-snap-border aspect-square"
            >
              <img
                src={img.preview}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-[7px] py-0.5 rounded-md">
                {idx + 1}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute top-1.5 right-1.5 bg-red-600/85 text-white border-none rounded-full w-[22px] h-[22px] text-xs cursor-pointer flex items-center justify-center leading-none min-w-[44px] min-h-[44px] -mt-[11px] -mr-[11px]"
              >
                ✕
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-3 px-2 pb-1.5">
                <p className="text-white text-[9px] truncate">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Process Button */}
      {images.length > 0 && (
        <button
          onClick={onProcess}
          className="w-full mt-5 py-4 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-[15px] font-bold cursor-pointer shadow-[0_4px_20px_rgba(79,142,247,0.3)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          ⚡ Process {images.length} Image{images.length !== 1 ? "s" : ""} with
          AI
        </button>
      )}
    </div>
  );
}
