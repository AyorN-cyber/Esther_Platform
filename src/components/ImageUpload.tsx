import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage: string;
  onImageChange: (base64: string) => void;
  label: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange, label }) => {
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(currentImage);
    onImageChange(currentImage);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      <div className="flex gap-4 items-start">
        {preview && (
          <div className="relative group">
            <img
              src={preview}
              alt={label}
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${label.replace(/\s/g, '-')}`}
          />
          <label
            htmlFor={`image-upload-${label.replace(/\s/g, '-')}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition"
          >
            <Upload size={18} />
            Choose Image
          </label>
          <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Supports JPG, PNG, GIF</p>
        </div>
      </div>
    </div>
  );
};
