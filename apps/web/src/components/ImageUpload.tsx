"use client";

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  currentPreview?: string;
}

export function ImageUpload({ onFileSelect, currentPreview }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPreview ?? null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div>
      <div
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragging
            ? "border-coral bg-coral-50"
            : "border-cream-300 bg-cream-100 hover:border-kraft"
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Upload preview"
            className="max-h-48 rounded-xl object-contain"
          />
        ) : (
          <>
            <svg
              className="mb-3 h-10 w-10 text-ink-ghost"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-ink">
              Drag &amp; drop or click to upload
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              Supports camera capture on mobile
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="sr-only"
          aria-label="Choose image file"
        />
      </div>

      {preview && (
        <button
          type="button"
          className="btn-danger mt-3 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Remove image
        </button>
      )}
    </div>
  );
}
