"use client";

import { useRef, useCallback } from "react";

const MAX_IMAGES = 40;

/* ── Inline SVG: document → spreadsheet illustration ── */
function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center pt-2 pb-1">
      {/* Soft glow behind the spreadsheet */}
      <div
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,142,247,0.18) 0%, transparent 70%)" }}
      />

      <svg width="180" height="120" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ── Document / photo (left, tilted) ── */}
        <g transform="rotate(-7 55 80)">
          <rect x="20" y="30" width="70" height="90" rx="8" fill="#1A1D27" stroke="#2A2E3F" strokeWidth="1.5" />
          {/* Image placeholder lines */}
          <rect x="32" y="48" width="46" height="5" rx="2.5" fill="#2A2E3F" />
          <rect x="32" y="59" width="36" height="5" rx="2.5" fill="#2A2E3F" />
          <rect x="32" y="70" width="42" height="5" rx="2.5" fill="#2A2E3F" />
          <rect x="32" y="81" width="30" height="5" rx="2.5" fill="#2A2E3F" />
          {/* Mountain icon inside doc */}
          <path d="M40 98 L50 88 L56 93 L66 82 L76 98 Z" fill="#2A2E3F" />
          <circle cx="72" cy="46" r="4" fill="#2A2E3F" />
        </g>

        {/* ── Arrow / transformation ── */}
        <g opacity="0.7">
          <path d="M100 75 L122 75" stroke="#4F8EF7" strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
          <path d="M118 69 L126 75 L118 81" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* ── Spreadsheet (right) ── */}
        <g transform="translate(132 22)">
          <rect width="68" height="95" rx="8" fill="#1A1D27" stroke="#4F8EF7" strokeWidth="1.5" />
          {/* Header row */}
          <rect x="6" y="8" width="56" height="13" rx="3" fill="rgba(79,142,247,0.15)" />
          {/* Header text marks */}
          <rect x="10" y="12" width="12" height="4" rx="1" fill="rgba(79,142,247,0.35)" />
          <rect x="26" y="12" width="10" height="4" rx="1" fill="rgba(79,142,247,0.35)" />
          <rect x="40" y="12" width="18" height="4" rx="1" fill="rgba(79,142,247,0.35)" />
          {/* Data rows */}
          {[0, 1, 2, 3, 4].map((row) => (
            <g key={row} transform={`translate(6 ${26 + row * 13})`}>
              <rect width="14" height="9" rx="2" fill="#222633" />
              <rect x="18" width="14" height="9" rx="2" fill="#222633" />
              <rect x="36" width="20" height="9" rx="2" fill={row === 1 ? "rgba(79,142,247,0.2)" : "#222633"} />
            </g>
          ))}
        </g>

        {/* ── Sparkle decorations ── */}
        <circle cx="190" cy="18" r="2.5" fill="#4F8EF7" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="16" cy="22" r="2" fill="#8B92A8" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <path d="M205 50 l3-3 3 3-3 3z" fill="#4F8EF7" opacity="0.35">
          <animate attributeName="opacity" values="0.35;0.1;0.35" dur="3.5s" repeatCount="indefinite" />
        </path>
        <circle cx="130" cy="130" r="1.5" fill="#34D399" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

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

  const isEmpty = images.length === 0;

  return (
    <div
      className="px-4 sm:px-5 py-4 flex flex-col"
      style={{ minHeight: isEmpty ? "calc(100dvh - 190px)" : "auto" }}
    >
      {/* ════════════════════════════════════════════
          EMPTY STATE — hero, value prop, action cards
          ════════════════════════════════════════════ */}
      {isEmpty ? (
        <>
          {/* Zone 1: Hero Illustration */}
          <HeroIllustration />

          {/* Zone 2: Value Proposition */}
          <div className="text-center px-2 pt-0 pb-2">
            <h2 className="text-snap-text text-lg font-bold tracking-tight">
              Turn Photos into Spreadsheets
            </h2>
            <p className="text-snap-text-muted text-xs mt-1.5 max-w-[280px] mx-auto leading-relaxed">
              Snap a photo of any document and AI extracts the data into Excel
            </p>
            {/* Feature pills */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-snap-surface border border-snap-border text-snap-text-dim text-[10px]">
                ⚡ AI-Powered
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-snap-surface border border-snap-border text-snap-text-dim text-[10px]">
                📄 Up to 40 Pages
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-snap-surface border border-snap-border text-snap-text-dim text-[10px]">
                📊 Instant .xlsx
              </span>
            </div>
          </div>

          {/* Zone 3: Action Cards — 2-column grid */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {/* Gallery Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
              className="group border border-snap-border rounded-2xl bg-gradient-to-b from-snap-surface to-snap-bg text-center cursor-pointer py-4 px-3 transition-all duration-200 hover:border-snap-accent hover:shadow-[0_0_20px_rgba(79,142,247,0.08)] active:scale-[0.97]"
            >
              <div className="flex justify-center mb-2.5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="transition-colors duration-200"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#4F8EF7" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#4F8EF7" strokeWidth="1.5" />
                  <path d="M21 15l-5-5L5 21" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-snap-text text-sm font-semibold">From Gallery</p>
              <p className="text-snap-text-dim text-[10px] mt-0.5">Browse your photos</p>
            </div>

            {/* Camera Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => cameraInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cameraInputRef.current?.click(); } }}
              className="group border border-snap-border rounded-2xl bg-gradient-to-b from-snap-surface to-snap-bg text-center cursor-pointer py-4 px-3 transition-all duration-200 hover:border-snap-accent hover:shadow-[0_0_20px_rgba(79,142,247,0.08)] active:scale-[0.97]"
            >
              <div className="flex justify-center mb-2.5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="transition-colors duration-200"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" stroke="#4F8EF7" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-snap-text text-sm font-semibold">Take Photo</p>
              <p className="text-snap-text-dim text-[10px] mt-0.5">Use your camera</p>
            </div>
          </div>

          {/* Hidden file inputs */}
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

          {/* Zone 4: Confidence Footer */}
          <div className="mt-auto pt-3 pb-1 text-center">
            <div className="flex items-center justify-center gap-3 text-snap-text-dim text-[10px]">
              <span>JPG</span>
              <span className="w-1 h-1 rounded-full bg-snap-border" />
              <span>PNG</span>
              <span className="w-1 h-1 rounded-full bg-snap-border" />
              <span>WEBP</span>
            </div>
            <p className="text-snap-text-dim text-[10px] mt-1.5 italic opacity-50">
              Tip: For best results, keep images well-lit and flat
            </p>
          </div>
        </>
      ) : (
        /* ════════════════════════════════════════════
           POPULATED STATE — compact, action-focused
           ════════════════════════════════════════════ */
        <>
          {/* Compact Upload Box */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
            className="border border-dashed border-snap-border rounded-2xl text-center cursor-pointer bg-snap-surface py-5 px-5 transition-all duration-300 hover:border-snap-accent active:border-snap-accent hover:bg-snap-accent-glow active:bg-snap-accent-glow"
          >
            <div className="text-2xl mb-1">➕</div>
            <p className="text-snap-text text-sm font-semibold">
              Add More ({images.length}/{MAX_IMAGES})
            </p>
            <p className="text-snap-text-muted text-[11px] mt-0.5">
              Tap to browse files
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
            className="w-full mt-3 py-3.5 rounded-xl border border-snap-border bg-snap-surface text-snap-text text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors min-h-[48px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Take Photo
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
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative rounded-xl overflow-hidden border border-snap-border aspect-square group"
              >
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-[7px] py-0.5 rounded-md">
                  {idx + 1}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="absolute top-0 right-0 p-2 cursor-pointer bg-transparent border-none"
                  aria-label={`Remove image ${idx + 1}`}
                >
                  <span className="flex items-center justify-center w-5 h-5 bg-red-600/90 text-white rounded-full text-[10px] leading-none">
                    ✕
                  </span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-3 px-2 pb-1.5">
                  <p className="text-white text-[9px] truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Process Button */}
          <button
            onClick={onProcess}
            className="w-full mt-5 py-4 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-[15px] font-bold cursor-pointer shadow-[0_4px_20px_rgba(79,142,247,0.3)] flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity min-h-[52px]"
          >
            ⚡ Process {images.length} Image{images.length !== 1 ? "s" : ""} with AI
          </button>
        </>
      )}
    </div>
  );
}
