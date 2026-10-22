import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Image as ImageIcon,
  SwitchCamera,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const PhotoUploader = ({ photos = [], onChange, maxPhotos = 5 }) => {
  const toast = useToast();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const retakeInputRef = useRef(null);
  const videoRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('Front view');
  const [captionText, setCaptionText] = useState('');
  const [retakeIndex, setRetakeIndex] = useState(null);

  // Live in-browser WebRTC viewfinder modal state
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear camera) or 'user'
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const categories = [
    { value: 'Front view', label: 'Front view / ಮುಂಭಾಗದ ನೋಟ' },
    { value: 'Exterior', label: 'Exterior / ಹೊರಭಾಗದ ನೋಟ' },
    { value: 'Interior', label: 'Interior / ಒಳಭಾಗದ ನೋಟ' },
    { value: 'Other', label: 'Other / ಇತರೆ' }
  ];

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Start WebRTC live camera stream
  const startCamera = async (mode = facingMode) => {
    setCameraLoading(true);
    setCameraError('');
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or connection is not secure (HTTPS required).');
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('WebRTC Camera error:', err);
      setCameraError(err.message || 'Unable to access camera.');
    } finally {
      setCameraLoading(false);
    }
  };

  const openLiveCamera = () => {
    if (photos.length >= maxPhotos) {
      toast.warning(`ಗರಿಷ್ಠ ${maxPhotos} ಫೋಟೋಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಬಹುದು / Maximum ${maxPhotos} photos reached.`);
      return;
    }
    setIsLiveCameraOpen(true);
    startCamera(facingMode);
  };

  const closeLiveCamera = () => {
    stopCameraStream();
    setIsLiveCameraOpen(false);
    setCameraError('');
    setRetakeIndex(null);
  };

  const switchCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Snap photo from WebRTC video stream
  const captureFromVideo = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Failed to capture photo frame.');
          return;
        }

        const fileName = `house_camera_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(file);

        const newPhotoItem = {
          file,
          previewUrl,
          category: selectedCategory,
          caption: captionText || `${selectedCategory} photograph`,
          originalName: fileName,
          sizeKB: Math.round(file.size / 1024),
          capturedAt: new Date().toISOString()
        };

        if (retakeIndex !== null && retakeIndex >= 0 && retakeIndex < photos.length) {
          // Replace existing photo (Retake)
          const updated = [...photos];
          if (updated[retakeIndex].previewUrl && !updated[retakeIndex]._id) {
            URL.revokeObjectURL(updated[retakeIndex].previewUrl);
          }
          updated[retakeIndex] = newPhotoItem;
          onChange(updated);
          toast.success('ಫೋಟೋ ಮರುತೆಗೆಯಲಾಗಿದೆ / Photo retaken successfully!');
        } else {
          // Add new photo
          onChange([...photos, newPhotoItem]);
          toast.success('ಕ್ಯಾಮೆರಾ ಫೋಟೋ ಯಶಸ್ವಿಯಾಗಿ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ / Photo captured successfully!');
        }

        closeLiveCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  // Handle standard file selection (from direct camera capture or gallery picker)
  const handleFileSelect = (e, isRetake = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!isRetake && photos.length + files.length > maxPhotos) {
      toast.warning(`ಗರಿಷ್ಠ ${maxPhotos} ಫೋಟೋಗಳನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು / You can upload a maximum of ${maxPhotos} photographs.`);
      return;
    }

    const validFiles = [];

    for (const file of files) {
      // Validate type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" ಮಾನ್ಯವಾದ ಚಿತ್ರವಲ್ಲ. JPG, PNG, ಅಥವಾ WebP ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.`);
        continue;
      }

      // Validate size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" ಗಾತ್ರವು 5MB ಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ / File exceeds 5MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validFiles.push({
        file,
        previewUrl,
        category: selectedCategory,
        caption: captionText || `${selectedCategory} photo`,
        originalName: file.name,
        sizeKB: Math.round(file.size / 1024),
        capturedAt: new Date().toISOString()
      });
    }

    if (validFiles.length > 0) {
      if (isRetake && retakeIndex !== null && retakeIndex >= 0 && retakeIndex < photos.length) {
        const updated = [...photos];
        if (updated[retakeIndex].previewUrl && !updated[retakeIndex]._id) {
          URL.revokeObjectURL(updated[retakeIndex].previewUrl);
        }
        updated[retakeIndex] = validFiles[0];
        onChange(updated);
        toast.success('ಫೋಟೋ ಮರುತೆಗೆಯಲಾಗಿದೆ / Photo retaken and replaced successfully!');
        setRetakeIndex(null);
      } else {
        onChange([...photos, ...validFiles]);
        toast.success(`${validFiles.length} ಫೋಟೋ(ಗಳು) ಲಗತ್ತಿಸಲಾಗಿದೆ / photo(s) attached.`);
      }
    }

    // Reset inputs
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (retakeInputRef.current) retakeInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    const updated = [...photos];
    if (updated[index].previewUrl && !updated[index]._id) {
      URL.revokeObjectURL(updated[index].previewUrl);
    }
    updated.splice(index, 1);
    onChange(updated);
    toast.info('ಫೋಟೋ ತೆಗೆದುಹಾಕಲಾಗಿದೆ / Photo removed.');
  };

  const handleRetakePhoto = (index) => {
    setRetakeIndex(index);
    // On mobile devices, triggering the camera capture input gives the most seamless rear-camera retake experience
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUpdateCategory = (index, newCategory) => {
    const updated = [...photos];
    updated[index].category = newCategory;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs for direct camera capture and gallery upload */}
      {/* 1. Direct Rear Camera Input (HTML5 capture="environment" for native phone camera) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, retakeIndex !== null)}
        className="hidden"
      />

      {/* 2. Gallery / File System Multi-Picker Input */}
      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
      />

      {/* Optional Notice Pill */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಐಚ್ಛಿಕವಾಗಿದೆ (Photos are Optional)
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 font-medium">
          ಫೋಟೋ ಇಲ್ಲದೆಯೂ ನೋಂದಣಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಬಹುದು
        </span>
      </div>

      {/* Upload & Camera Control Box */}
      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
        {/* Category & Caption Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ಫೋಟೋ ವರ್ಗ / Photo Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ವಿವರಣೆ / Optional Caption
            </label>
            <input
              type="text"
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="e.g. ಮುಂಭಾಗದ ರಸ್ತೆ ನೋಟ / Main entrance"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons: Separate "Take Photo" and "Upload from Gallery" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 1. Direct Camera Button */}
          <button
            type="button"
            onClick={() => {
              setRetakeIndex(null);
              // Trigger direct rear-camera capture
              cameraInputRef.current?.click();
            }}
            disabled={photos.length >= maxPhotos}
            className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/10 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>📷 Take Photo / ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಫೋಟೋ ತೆಗೆಯಿರಿ</span>
          </button>

          {/* 2. Upload from Gallery / Files Button */}
          <button
            type="button"
            onClick={() => {
              setRetakeIndex(null);
              galleryInputRef.current?.click();
            }}
            disabled={photos.length >= maxPhotos}
            className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/10 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>📁 Upload from Gallery / Files</span>
          </button>
        </div>

        {/* Live Viewfinder Alternative Link */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
          <span>ಹಿಂಭಾಗದ ಕ್ಯಾಮೆರಾ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಕ್ರಿಯಗೊಳ್ಳುತ್ತದೆ (Rear-camera enabled).</span>
          <button
            type="button"
            onClick={openLiveCamera}
            className="text-blue-600 hover:text-blue-700 font-bold underline"
          >
            ಲೈವ್ ವ್ಯೂಫೈಂಡರ್ ತೆರೆಯಿರಿ (Live Viewfinder) &rarr;
          </button>
        </div>
      </div>

      {/* Selected Photos Grid Preview */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>ಲಗತ್ತಿಸಲಾದ ಫೋಟೋಗಳು / Attached Photographs ({photos.length} / {maxPhotos})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              ಫೋಟೋ ಬದಲಾಯಿಸಲು "Retake" ಕ್ಲಿಕ್ ಮಾಡಿ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {photos.map((item, idx) => {
              const src = item.previewUrl || (item.filePath ? `/${item.filePath}` : '');

              return (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col transition hover:shadow-md"
                >
                  {/* Photo Thumbnail */}
                  <div className="h-36 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={src}
                      alt={item.caption || item.category}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Photo';
                      }}
                    />

                    {/* Top Right Action Buttons (Remove & Retake) */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      {/* Retake Button */}
                      <button
                        type="button"
                        onClick={() => handleRetakePhoto(idx)}
                        className="p-1.5 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl backdrop-blur-sm transition shadow-sm"
                        title="Retake this photo / ಈ ಫೋಟೋ ಮರುತೆಗೆಯಿರಿ"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-xl backdrop-blur-sm transition shadow-sm"
                        title="Remove photo / ತೆಗೆದುಹಾಕಿ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Pill Tag */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-sm border border-amber-500/30">
                      {item.category}
                    </span>
                  </div>

                  {/* Card Details & Action Row */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={item.caption || item.originalName}>
                      {item.caption || item.originalName || 'House Image'}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateCategory(idx, e.target.value)}
                        className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.value}
                          </option>
                        ))}
                      </select>

                      {/* Retake Action Link */}
                      <button
                        type="button"
                        onClick={() => handleRetakePhoto(idx)}
                        className="text-amber-600 hover:text-amber-700 font-bold text-[11px] flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live WebRTC Camera Modal */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  ಲೈವ್ ಕ್ಯಾಮೆರಾ / Live Camera Viewfinder
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLiveCamera}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewfinder Area */}
            <div className="relative bg-black h-80 flex items-center justify-center overflow-hidden">
              {cameraLoading && (
                <div className="text-center text-xs text-slate-400 space-y-2">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>ಕ್ಯಾಮೆರಾ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ / Initializing camera...</p>
                </div>
              )}

              {cameraError ? (
                <div className="p-4 text-center text-xs text-rose-300 max-w-xs space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                  <p>{cameraError}</p>
                  <p className="text-[11px] text-slate-400">
                    ದಯವಿಟ್ಟು "Take Photo" ಬಟನ್ ಬಳಸಿ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾವನ್ನು ನೇರವಾಗಿ ತೆರೆಯಿರಿ.
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* Viewfinder crosshairs / grid overlay */}
              <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none" />
            </div>

            {/* Modal Control Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {/* Switch Camera Facing Mode (Front / Rear) */}
              <button
                type="button"
                onClick={switchCameraFacingMode}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition"
                title="Switch Front/Rear Camera"
              >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
                </span>
              </button>

              {/* Shutter Click Button */}
              <button
                type="button"
                onClick={captureFromVideo}
                disabled={cameraLoading || !!cameraError}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>ಫೋಟೋ ಕ್ಲಿಕ್ ಮಾಡಿ / Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={closeLiveCamera}
                className="text-xs text-slate-400 hover:text-slate-200 px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
