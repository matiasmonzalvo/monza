import { useState } from 'react';
import { X, GripVertical } from 'lucide-react';

interface DraggableImageGridProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  onRemoveImage: (index: number) => void;
  isEditMode?: boolean;
}

interface SortableImageItemProps {
  image: string | File;
  index: number;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  isDragging: boolean;
  isEditMode?: boolean;
}

function SortableImageItem({
  image,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isEditMode = false
}: SortableImageItemProps) {
  return (
    <div
      draggable={!isEditMode}
      onDragStart={!isEditMode ? (e) => onDragStart(e, index) : undefined}
      onDragOver={!isEditMode ? onDragOver : undefined}
      onDrop={!isEditMode ? (e) => onDrop(e, index) : undefined}
      className={`relative group rounded-md overflow-hidden border border-gray-300 bg-white ${
        !isEditMode ? 'cursor-move' : 'cursor-default'
      } ${isDragging ? 'opacity-50 scale-95' : ''} transition-all duration-200`}
    >
      <img
        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
        alt={`Imagen ${index + 1}`}
        className="w-full h-24 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />

      {/* Drag handle */}
      {!isEditMode && (
        <div className="absolute top-1 left-1 bg-black/50 rounded p-1">
          <GripVertical className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Remove button */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image number indicator */}
      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
        {index + 1}
      </div>
    </div>
  );
}

export default function DraggableImageGrid({
  images,
  onChange,
  onRemoveImage,
  isEditMode = false
}: DraggableImageGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    // Remove the dragged item
    newImages.splice(draggedIndex, 1);

    // Insert it at the new position
    newImages.splice(targetIndex, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <label className="text-sm text-gray-100 block mb-2">
        Imágenes seleccionadas ({images.length})
        {!isEditMode && ' - Arrastra para reorganizar'}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <SortableImageItem
            key={index}
            image={image}
            index={index}
            onRemove={() => onRemoveImage(index)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
            isEditMode={isEditMode}
          />
        ))}
      </div>
    </div>
  );
}
