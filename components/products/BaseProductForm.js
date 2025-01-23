"use client";
import { useState, useEffect } from "react";
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import { 
  PhotoIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  MinusCircleIcon
} from '@heroicons/react/24/outline';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { categories } from '@/data/categories';

export default function BaseProductForm({ 
  initialData = {}, 
  onSubmit, 
  submitButtonText = "Save",
  isEdit = false 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: '',
    categorySlug: '',
    subcategorySlug: '',
    itemSlug: '',
    image: '',
    isFeatured: false,
    stock: 0,
    dosageForm: '',
    activeIngredients: [{ name: "", amount: "" }],
    warnings: [""],
    directions: ''
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const category = categories.find(c => c.slug === initialData.categorySlug);
      if (category) {
        setAvailableSubcategories(category.subcategories || []);
        
        const subcategory = category.subcategories.find(
          s => s.slug === initialData.subcategorySlug
        );
        if (subcategory) {
          setAvailableItems(subcategory.items || []);
        }
      }
      
      setFormData(initialData);
    }
  }, [initialData]);

  const [availableSubcategories, setAvailableSubcategories] = useState(
    formData.categorySlug ? 
      categories.find(c => c.slug === formData.categorySlug)?.subcategories || [] 
      : []
  );
  
  const [availableItems, setAvailableItems] = useState(
    formData.subcategorySlug ? 
      availableSubcategories.find(s => s.slug === formData.subcategorySlug)?.items || [] 
      : []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(initialData.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const dosageForms = [
    "Tablet",
    "Capsule",
    "Liquid",
    "Cream",
    "Gel",
    "Spray",
    "Other"
  ];

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError("");
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.activeIngredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      activeIngredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      activeIngredients: [...prev.activeIngredients, { name: "", amount: "" }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      activeIngredients: prev.activeIngredients.filter((_, i) => i !== index)
    }));
  };

  const handleWarningChange = (index, value) => {
    const newWarnings = [...formData.warnings];
    newWarnings[index] = value;
    setFormData(prev => ({
      ...prev,
      warnings: newWarnings
    }));
  };

  const addWarning = () => {
    setFormData(prev => ({
      ...prev,
      warnings: [...prev.warnings, ""]
    }));
  };

  const removeWarning = (index) => {
    setFormData(prev => ({
      ...prev,
      warnings: prev.warnings.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryChange = (e) => {
    const categorySlug = e.target.value;
    const category = categories.find(c => c.slug === categorySlug);
    
    if (category) {
      console.log('Selected category:', category.name, category.slug);
      setAvailableSubcategories(category.subcategories || []);
      setAvailableItems([]);
      
      setFormData(prev => ({
        ...prev,
        categorySlug: category.slug,
        subcategorySlug: '',
        itemSlug: ''
      }));
    }
  };

  const handleSubcategoryChange = (e) => {
    const subcategorySlug = e.target.value;
    const category = categories.find(c => c.slug === formData.categorySlug);
    const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug);
    
    if (subcategory) {
      console.log('Selected subcategory:', subcategory.name, subcategory.slug);
      setAvailableItems(subcategory.items || []);
      
      setFormData(prev => ({
        ...prev,
        subcategorySlug: subcategory.slug,
        itemSlug: ''
      }));
    }
  };

  const handleItemChange = (e) => {
    const itemSlug = e.target.value;
    const category = categories.find(c => c.slug === formData.categorySlug);
    const subcategory = category?.subcategories.find(s => s.slug === formData.subcategorySlug);
    const item = subcategory?.items.find(i => i.slug === itemSlug);
    
    if (item) {
      console.log('Selected item:', item.name, item.slug);
      setFormData(prev => ({
        ...prev,
        itemSlug: item.slug
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!formData.categorySlug || !formData.subcategorySlug || !formData.itemSlug) {
        throw new Error('Please select all category options');
      }

      const category = categories.find(c => c.slug === formData.categorySlug);
      const subcategory = category?.subcategories.find(s => s.slug === formData.subcategorySlug);
      const item = subcategory?.items.find(i => i.slug === formData.itemSlug);

      if (!category || !subcategory || !item) {
        throw new Error('Invalid category selection');
      }

      let imageUrl = formData.image;

      if (imageFile) {
        setUploadingImage(true);
        const { url } = await uploadToCloudinary(imageFile);
        imageUrl = url;
        setUploadingImage(false);
      }
      
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        activeIngredients: formData.activeIngredients.filter(i => i.name && i.amount),
        warnings: formData.warnings.filter(w => w.trim()),
        image: imageUrl || process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_IMAGE,
        categorySlug: category.slug,
        subcategorySlug: subcategory.slug,
        itemSlug: item.slug,
        category: category.name,
        subcategory: subcategory.name,
        item: item.name,
        categoryPath: `${category.name} > ${subcategory.name} > ${item.name}`
      };
      
      console.log('Submitting form data:', cleanedData);
      await onSubmit(cleanedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 p-6"
      >
        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Product Image
            <span className="text-gray-500 text-xs ml-2">(Max 5MB)</span>
          </label>
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed 
              rounded-lg transition-colors duration-200 cursor-pointer
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${error ? 'border-red-300' : ''}`}
          >
            <div className="space-y-2 text-center">
              {uploadingImage ? (
                <div className="flex flex-col items-center">
                  <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : imagePreview ? (
                <div className="relative w-40 h-40 mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <input {...getInputProps()} />
                    <p className="pl-1">
                      Drag and drop or click to select a product image
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Updated Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.categorySlug && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcategory *</label>
                  <select
                    name="subcategorySlug"
                    value={formData.subcategorySlug}
                    onChange={handleSubcategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a subcategory</option>
                    {availableSubcategories.map(sub => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.subcategorySlug && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Category *</label>
                  <select
                    name="itemSlug"
                    value={formData.itemSlug}
                    onChange={handleItemChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an item category</option>
                    {availableItems.map(item => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dosage Form *</label>
              <select
                name="dosageForm"
                value={formData.dosageForm}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select form</option>
                {dosageForms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Ingredients */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Ingredients</h3>
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Ingredient
            </button>
          </div>
          
          {formData.activeIngredients.map((ingredient, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="mt-1 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Warnings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Warnings</h3>
            <button
              type="button"
              onClick={addWarning}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Warning
            </button>
          </div>
          
          {formData.warnings.map((warning, index) => (
            <div key={index} className="flex gap-4 items-start">
              <input
                type="text"
                value={warning}
                onChange={(e) => handleWarningChange(index, e.target.value)}
                className="flex-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter warning"
              />
              <button
                type="button"
                onClick={() => removeWarning(index)}
                className="mt-1 text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Directions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Directions for Use</label>
          <textarea
            name="directions"
            value={formData.directions}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Featured Product
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md">
            {error}
          </div>
        )}
      </motion.div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 px-6 py-4 bg-gray-50">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
} 