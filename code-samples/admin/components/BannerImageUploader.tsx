import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Trash2, Upload } from 'lucide-react';

interface BannerImageUploaderProps {
  imageUrl: string;
  onChange: (file: File | string) => void;
  error?: string;
  // Tamaño máximo permitido en bytes para cada imagen. Por defecto 350 KB
  maxSizeBytes?: number;
}

export default function BannerImageUploader({
  imageUrl,
  onChange,
  error,
  maxSizeBytes = 350 * 1024
}: BannerImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(
    async (file: File): Promise<File> => {
      if (file.size <= maxSizeBytes) return file;

      const loadBitmap = async (): Promise<ImageBitmap | HTMLImageElement> => {
        if ('createImageBitmap' in window) {
          return await createImageBitmap(file);
        }
        return await new Promise((resolve, reject) => {
          const img = new (window as unknown as typeof window).Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      const bitmap = await loadBitmap();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      // Asegurar formato de salida JPEG para mejor compresión
      const outputType = 'image/jpeg';

      let width =
        'width' in bitmap
          ? bitmap.width
          : (bitmap as HTMLImageElement).naturalWidth;
      let height =
        'height' in bitmap
          ? bitmap.height
          : (bitmap as HTMLImageElement).naturalHeight;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(bitmap as HTMLImageElement, 0, 0, width, height);

      // Estrategia: bajar calidad en pasos; si no alcanza, reducir dimensiones y repetir
      const toBlobAsync = (quality: number) =>
        new Promise<Blob | null>((resolve) =>
          canvas.toBlob((blob) => resolve(blob), outputType, quality)
        );

      let quality = 0.9;
      const minQuality = 0.3;
      const scaleStep = 0.85;
      const minDimension = 300;

      for (let attempt = 0; attempt < 25; attempt++) {
        const blob = await toBlobAsync(quality);
        if (blob && blob.size <= maxSizeBytes) {
          return new File(
            [blob],
            file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'),
            {
              type: outputType,
              lastModified: Date.now()
            }
          );
        }

        if (quality <= minQuality || (blob && blob.size > maxSizeBytes * 1.5)) {
          const newWidth = Math.max(
            Math.floor(width * scaleStep),
            Math.min(width, minDimension)
          );
          const newHeight = Math.floor((newWidth / width) * height);
          if (newWidth === width || newHeight === height) {
            if (blob) {
              return new File(
                [blob],
                file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'),
                {
                  type: outputType,
                  lastModified: Date.now()
                }
              );
            }
            return file;
          }
          width = newWidth;
          height = newHeight;
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(bitmap as HTMLImageElement, 0, 0, width, height);
          quality = Math.min(0.85, quality);
        } else {
          quality = Math.max(minQuality, quality - 0.1);
        }
      }

      const fallbackBlob = await toBlobAsync(quality);
      if (fallbackBlob) {
        return new File(
          [fallbackBlob],
          file.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'),
          {
            type: outputType,
            lastModified: Date.now()
          }
        );
      }
      return file;
    },
    [maxSizeBytes]
  );

  const processIncomingFile = useCallback(
    async (file: File): Promise<File> => {
      if (!file.type.startsWith('image/')) return file;
      try {
        return await compressImage(file);
      } catch {
        return file;
      }
    },
    [compressImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
        const compressedFile = await processIncomingFile(
          e.dataTransfer.files[0]
        );
        onChange(compressedFile);
      }
    },
    [onChange, processIncomingFile]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]?.type.startsWith('image/')) {
        const compressedFile = await processIncomingFile(e.target.files[0]);
        onChange(compressedFile);
      }
    },
    [onChange, processIncomingFile]
  );

  return (
    <div className="space-y-2">
      <div
        className={`relative w-full h-32 rounded-lg overflow-hidden border-2 border-dashed transition-colors ${
          error
            ? 'border-red-500'
            : isDragging
            ? 'border-[#8ee368] bg-[#8ee368]/10'
            : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="group relative w-full h-full">
            <Image
              src={
                typeof imageUrl === 'string'
                  ? imageUrl
                  : URL.createObjectURL(imageUrl)
              }
              alt="Foto de banner"
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="relative z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-[2px] text-white hover:text-red-400 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gray-100/10"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400" />
            <span className="text-sm text-gray-400 mt-2">Subir banner</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
