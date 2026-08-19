import { useState, useCallback, useRef } from 'react';
import DraggableImageGrid from './DraggableImageGrid';

interface ImageDropzoneProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  // Tamaño máximo permitido en bytes para cada imagen. Por defecto 800 KB
  maxSizeBytes?: number;
  isEditMode?: boolean;
}

export default function ImageDropzone({
  images,
  onChange,
  maxSizeBytes = 350 * 1024,
  isEditMode = false
}: ImageDropzoneProps) {
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
          const img = new Image();
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

  const processIncomingFiles = useCallback(
    async (fileList: FileList | File[]): Promise<File[]> => {
      const filesArray = Array.from(fileList).filter((file) =>
        file.type.startsWith('image/')
      );
      const processed = await Promise.all(
        filesArray.map(async (file) => {
          try {
            return await compressImage(file);
          } catch {
            return file;
          }
        })
      );
      return processed;
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
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = await processIncomingFiles(e.dataTransfer.files);
        onChange([...images, ...newFiles]);
      }
    },
    [images, onChange, processIncomingFiles]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = await processIncomingFiles(e.target.files);
        onChange([...images, ...newFiles]);
      }
    },
    [images, onChange, processIncomingFiles]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    },
    [images, onChange]
  );

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-[#8ee368] bg-[#8ee368]/10'
            : 'border-gray-300 hover:border-[#8ee368]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center cursor-pointer">
          <div className="rounded-full bg-[#8ee368]/20 p-3">
            <svg
              className="w-6 h-6 text-[#8ee368]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Arrastra y suelta imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Formatos soportados: JPG, PNG
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      <DraggableImageGrid
        images={images}
        onChange={onChange}
        onRemoveImage={handleRemoveImage}
        isEditMode={isEditMode}
      />
    </div>
  );
}
