import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PhotoUploader = ({ photos = [], onChange, maxPhotos = 5 }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('Front view');
  const [captionText, setCaptionText] = useState('');

  const categories = ['Front view', 'Exterior', 'Interior', 'Other'];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      toast.warning(`You can upload a maximum of ${maxPhotos} photographs per registration.`);
      return;
    }

    const validFiles = [];

    for (const file of files) {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not an accepted format. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }

      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validFiles.push({
        file,
        previewUrl,
        category: selectedCategory,
        caption: captionText || `${selectedCategory} photo`,
        originalName: file.name,
        sizeKB: Math.round(file.size / 1024)
      });
    }

    if (validFiles.length > 0) {
      onChange([...photos, ...validFiles]);
      toast.success(`${validFiles.length} photo(s) selected for upload.`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    const updated = [...photos];
    // Revoke object url to prevent memory leak
    if (updated[index].previewUrl && !updated[index]._id) {
      URL.revokeObjectURL(updated[index].previewUrl);
    }
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleUpdateCategory = (index, newCategory) => {
    const updated = [...photos];
    updated[index].category = newCategory;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Control Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Category for Next Upload
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Optional Caption / Note
            </label>
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="e.g. North-facing main facade"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Drop / Browse area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-white hover:bg-blue-50/30 transition flex flex-col items-center justify-center group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to browse or drop photograph files here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            JPG, PNG, or WebP up to 5MB each (Max {maxPhotos} photos)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Photos Grid Preview */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Photographs ({photos.length} / {maxPhotos})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((item, idx) => {
              const src = item.previewUrl || (item.filePath ? `/${item.filePath}` : '');

              return (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col"
                >
                  <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={src}
                      alt={item.caption || item.category}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/300x200?text=Photo';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg transition"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={item.originalName}>
                      {item.originalName || 'House Image'}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateCategory(idx, e.target.value)}
                        className="text-[10px] bg-slate-50 border border-slate-200 rounded p-0.5 text-slate-700"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {item.sizeKB && (
                        <span className="text-[10px] text-slate-400">{item.sizeKB} KB</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
