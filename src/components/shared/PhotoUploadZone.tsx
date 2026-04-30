"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface PhotoUploadZoneProps {
  onChange: (file: File) => void;
  currentPhoto?: string;
  maxSizeMB?: number;
}

/**
 * Zone de drop pour upload de photo avec preview
 * Design system: zone en pointillés, animation au drag
 */
export function PhotoUploadZone({
  onChange,
  currentPhoto,
  maxSizeMB = 2,
}: PhotoUploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      // Validation type
      if (!file.type.startsWith("image/")) {
        toast.error("Seules les images sont acceptées");
        return;
      }

      // Validation taille
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image trop lourde (max ${maxSizeMB}MB)`);
        return;
      }

      // Créer preview
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    },
    [onChange, maxSizeMB]
  );

  const clearPreview = useCallback(() => {
    if (preview && preview !== currentPhoto) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  }, [preview, currentPhoto]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer",
        isDragging
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      )}
    >
      {preview ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-100"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Cliquez ou déposez une nouvelle image
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200",
              isDragging ? "bg-blue-100" : "bg-blue-50"
            )}
          >
            {isDragging ? (
              <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
            ) : (
              <ImageIcon className="w-8 h-8 text-blue-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? "Déposez ici" : "Déposez votre photo ici"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP — max {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export default PhotoUploadZone;
