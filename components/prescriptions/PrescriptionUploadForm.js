"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaSpinner, FaCheck, FaCamera, FaUndo, FaCrop, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { compressImage, validateImage, getCroppedImg } from '@/lib/imageUtils';
import ImageEditor from './ImageEditor';
import ShippingAddress from '@/components/checkout/ShippingAddress';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function PrescriptionUploadForm() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const [prescriptionDetails, setPrescriptionDetails] = useState({
    doctorName: '',
    doctorContact: '',
    pharmacy: {
      name: '',
      phone: '',
      address: ''
    }
  });

  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploadController, setUploadController] = useState(null);
  const [addressError, setAddressError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [addresses, setAddresses] = useState([]);

  // Fetch user's addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses');
        const data = await response.json();
        setAddresses(data.addresses || []);
        
        // If there's only one address, select it automatically
        if (data.addresses?.length === 1) {
          setSelectedAddress(data.addresses[0]);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      // Show compression loading
      const compressionToast = toast.loading('Processing image...');

      // Compress image
      const compressedFile = await compressImage(file);
      
      // Update state
      setImage(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      
      toast.success('Image processed successfully', { id: compressionToast });
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    }
  };

  const handleImageEdit = async (editData) => {
    try {
      const croppedImage = await getCroppedImg(
        preview,
        editData.crop,
        editData.rotation
      );
      
      const newFile = new File([croppedImage], 'edited-prescription.jpg', {
        type: 'image/jpeg'
      });

      setImage(newFile);
      setPreview(URL.createObjectURL(newFile));
      setShowImageEditor(false);
    } catch (error) {
      console.error('Failed to edit image:', error);
      toast.error('Failed to edit image');
    }
  };

  const uploadToFirebase = async (file, retryAttempt = 0) => {
    const controller = new AbortController();
    setUploadController(controller);

    const fileName = `prescriptions/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, fileName);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        async (error) => {
          if (error.code === 'storage/canceled') {
            reject(new Error('Upload cancelled'));
            return;
          }

          console.error('Upload error:', error);
          if (retryAttempt < MAX_RETRIES) {
            toast.loading(`Retrying upload... (${retryAttempt + 1}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, RETRY_DELAY));
            try {
              const result = await uploadToFirebase(file, retryAttempt + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          } else {
            reject(error);
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );

      // Handle cancellation
      controller.signal.addEventListener('abort', () => {
        uploadTask.cancel();
        reject(new Error('Upload cancelled'));
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please select a prescription image');
      return;
    }

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      setShowAddressSelector(true);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Uploading prescription...');

    try {
      const downloadURL = await uploadToFirebase(image);

      const formData = new FormData();
      formData.append('prescriptionImage', downloadURL);
      formData.append('details', JSON.stringify({
        doctorName: prescriptionDetails.doctorName,
        doctorContact: prescriptionDetails.doctorContact,
        pharmacy: prescriptionDetails.pharmacy
      }));

      // Send to the correct endpoint
      const response = await fetch('/api/prescriptions', {  // Changed back to original endpoint
        method: 'POST',
        body: formData // Use FormData instead of JSON
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Prescription uploaded successfully!', { id: loadingToast });
        router.push(`/prescriptions/verify/${data.prescriptionId}`);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload prescription', { id: loadingToast });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = useCallback(() => {
    setImage(null);
    setPreview(null);
    setUploadProgress(0);
    setPrescriptionDetails({
      doctorName: '',
      doctorContact: '',
      pharmacy: {
        name: '',
        phone: '',
        address: ''
      }
    });
  }, []);

  const cancelUpload = useCallback(() => {
    if (uploadController) {
      uploadController.abort();
      setUploadProgress(0);
      setLoading(false);
      toast.error('Upload cancelled');
    }
  }, [uploadController]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {addressError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p>Please add a shipping address to your profile before uploading a prescription.</p>
          <button
            onClick={() => router.push('/profile/edit?redirect=prescriptions')}
            className="text-red-700 underline mt-2"
          >
            Add Shipping Address
          </button>
        </div>
      )}

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-4">
          Upload Prescription Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {preview ? (
            <div className="relative w-full h-64">
              <Image
                src={preview}
                alt="Prescription preview"
                fill
                className="object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={resetForm}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <FaUndo />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="flex flex-col items-center gap-2">
                <FaCamera className="text-4xl text-gray-400" />
                <span className="text-gray-500">Take photo or upload image</span>
                <span className="text-xs text-gray-400">
                  (Supports JPEG, PNG, HEIC • Max 10MB)
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {showImageEditor && (
        <ImageEditor
          imageUrl={preview}
          onSave={handleImageEdit}
          onCancel={() => setShowImageEditor(false)}
        />
      )}

      {preview && !showImageEditor && (
        <button
          type="button"
          onClick={() => setShowImageEditor(true)}
          className="mt-2 text-primary hover:text-primary/80 flex items-center gap-2 mx-auto"
        >
          <FaCrop /> Edit Image
        </button>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600">
              Uploading: {Math.round(uploadProgress)}%
            </p>
            <button
              type="button"
              onClick={cancelUpload}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address Selection Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
        
        {selectedAddress ? (
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{selectedAddress.fullName}</p>
                <p className="text-gray-600">{selectedAddress.street}</p>
                <p className="text-gray-600">
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressSelector(true)}
                className="text-primary hover:text-primary/80"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddressSelector(true)}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg
                     hover:border-primary/60 transition-colors flex items-center justify-center gap-2"
          >
            <FaMapMarkerAlt />
            Select Delivery Address
          </button>
        )}

        {showAddressSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ShippingAddress
                onAddressSelect={handleAddressSelect}
                initialAddresses={addresses}
              />
            </div>
          </div>
        )}
      </div>

      {/* Prescription Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doctor's Name</label>
          <input
            type="text"
            value={prescriptionDetails.doctorName}
            onChange={(e) => setPrescriptionDetails(prev => ({
              ...prev,
              doctorName: e.target.value
            }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Doctor's Contact
          </label>
          <input
            type="text"
            value={prescriptionDetails.doctorContact}
            onChange={(e) => setPrescriptionDetails(prev => ({
              ...prev,
              doctorContact: e.target.value
            }))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Previous Pharmacy (if transferring)
          </label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Pharmacy Name"
              value={prescriptionDetails.pharmacy.name}
              onChange={(e) => setPrescriptionDetails(prev => ({
                ...prev,
                pharmacy: { ...prev.pharmacy, name: e.target.value }
              }))}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={prescriptionDetails.pharmacy.phone}
              onChange={(e) => setPrescriptionDetails(prev => ({
                ...prev,
                pharmacy: { ...prev.pharmacy, phone: e.target.value }
              }))}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Address"
              value={prescriptionDetails.pharmacy.address}
              onChange={(e) => setPrescriptionDetails(prev => ({
                ...prev,
                pharmacy: { ...prev.pharmacy, address: e.target.value }
              }))}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!image || loading}
        className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold 
                   flex items-center justify-center gap-2
                   ${!image || loading 
                     ? 'bg-gray-400 cursor-not-allowed' 
                     : 'bg-primary text-white hover:bg-primary/90'
                   }`}
      >
        {loading ? (
          <><FaSpinner className="animate-spin" /> Processing...</>
        ) : (
          <><FaUpload /> Upload Prescription</>
        )}
      </button>
    </motion.form>
  );
} 