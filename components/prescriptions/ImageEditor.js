"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { 
  FaRotateLeft, 
  FaRotateRight, 
  FaSearchPlus, 
  FaSearchMinus,
  FaCheck, 
  FaTimes,
  FaCrop,
  FaUndo
} from 'react-icons/fa';

const ImageEditor = ({ 
  imageUrl, 
  onSave, 
  onCancel,
  aspectRatio = 4/3 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const rotateLeft = () => {
    setRotation((r) => (r - 90) % 360);
  };

  const rotateRight = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleSave = useCallback(async () => {
    try {
      onSave({ rotation, crop: croppedAreaPixels, zoom });
    } catch (e) {
      console.error('Error saving edited image:', e);
    }
  }, [rotation, croppedAreaPixels, zoom, onSave]);

  const resetChanges = () => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-xl w-full max-w-4xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaCrop /> Edit Prescription Image
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[60vh] bg-gray-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
            classes={{
              containerClassName: 'h-full'
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Rotation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={rotateLeft}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                title="Rotate Left"
              >
                <FaRotateLeft className="w-5 h-5" />
              </button>
              <button
                onClick={rotateRight}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                title="Rotate Right"
              >
                <FaRotateRight className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex-1 flex items-center gap-2">
              <FaSearchMinus className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <FaSearchPlus className="w-4 h-4 text-gray-500" />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetChanges}
              className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
              title="Reset Changes"
            >
              <FaUndo className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <FaCheck /> Apply Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageEditor; 