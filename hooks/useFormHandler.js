import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Centralized form handler hook
 * Eliminates duplicate form state management and error handling patterns
 * 
 * @param {Object} options Configuration options
 * @param {Object} options.initialData Initial form data
 * @param {Function} options.onSubmit Submit handler function
 * @param {Function} options.validate Optional validation function
 * @param {Object} options.toastOptions Toast notification options
 * @param {boolean} options.resetOnSuccess Reset form on successful submission
 * @returns {Object} Form state and handlers
 */
export function useFormHandler({
  initialData = {},
  onSubmit,
  validate,
  toastOptions = {},
  resetOnSuccess = false
} = {}) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  }, [errors, error]);

  // Handle field blur (for validation)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Run field validation if validate function provided
    if (validate && typeof validate === 'function') {
      const fieldErrors = validate(formData, name);
      if (fieldErrors && fieldErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors[name]
        }));
      }
    }
  }, [formData, validate]);

  // Update form data programmatically
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setError('');
    setErrors({});
    setTouched({});
    setLoading(false);
  }, [initialData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    setLoading(true);
    setError('');
    setErrors({});

    try {
      // Run validation if provided
      if (validate && typeof validate === 'function') {
        const validationErrors = validate(formData);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          
          // Show toast for validation errors
          const errorMessage = Object.values(validationErrors)[0];
          toast.error(errorMessage, {
            duration: 4000,
            ...toastOptions
          });
          
          return { success: false, errors: validationErrors };
        }
      }

      // Call the provided submit handler
      if (!onSubmit) {
        throw new Error('No submit handler provided');
      }

      const result = await onSubmit(formData);

      // Handle successful submission
      if (result && result.success !== false) {
        // Show success toast if message provided
        if (result.message) {
          toast.success(result.message, {
            duration: 3000,
            ...toastOptions
          });
        }

        // Reset form if requested
        if (resetOnSuccess) {
          resetForm();
        }

        return { success: true, data: result };
      } else {
        // Handle submission failure
        const errorMessage = result?.message || 'Submission failed';
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          ...toastOptions
        });
        
        return { success: false, error: errorMessage };
      }

    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast.error(errorMessage, {
        duration: 4000,
        ...toastOptions
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, validate, resetOnSuccess, resetForm, toastOptions]);

  // Check if form has been modified
  const isDirty = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Check if form is valid (no errors)
  const isValid = useCallback(() => {
    return !error && Object.keys(errors).length === 0;
  }, [error, errors]);

  // Get field error
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  }, [touched, errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && !!errors[fieldName];
  }, [touched, errors]);

  return {
    // Form state
    formData,
    loading,
    error,
    errors,
    touched,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    updateFormData,
    resetForm,
    
    // Utility functions
    isDirty,
    isValid,
    getFieldError,
    hasFieldError,
    
    // Computed states
    canSubmit: !loading && isValid(),
    hasErrors: !isValid()
  };
}

/**
 * Specialized hook for async operations with loading states
 * Useful for API calls, file uploads, etc.
 */
export function useAsyncOperation({
  onSuccess,
  onError,
  showToasts = true,
  toastOptions = {}
} = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(async (operation, ...args) => {
    setLoading(true);
    setError('');

    try {
      const result = await operation(...args);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showToasts && result?.message) {
        toast.success(result.message, {
          duration: 3000,
          ...toastOptions
        });
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Async operation error:', error);
      const errorMessage = error.message || 'Operation failed';
      setError(errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      if (showToasts) {
        toast.error(errorMessage, {
          duration: 4000,
          ...toastOptions
        });
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, showToasts, toastOptions]);

  const reset = useCallback(() => {
    setLoading(false);
    setError('');
  }, []);

  return {
    loading,
    error,
    execute,
    reset
  };
}

export default useFormHandler; 