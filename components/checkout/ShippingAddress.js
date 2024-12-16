'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShippingAddress({ onAddressSelect }) {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses');
        const data = await response.json();
        setAddresses(data.addresses || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [session]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    onAddressSelect(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (addresses.length >= 5) {
      setError('You can only store up to 5 addresses.');
      return;
    }

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save address');
        return;
      }

      setAddresses(prev => [...prev, data.address]);
      onAddressSelect(data.address);
      setShowNewAddressForm(false);
      setNewAddress({
        fullName: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Failed to save address. Please try again.');
    }
  };

  const formatPhoneNumber = (phoneNumberString) => {
    let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumberString;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        const cleaned = value.replace(/\D/g, '');
        const trimmed = cleaned.slice(0, 10);
        setNewAddress(prev => ({
            ...prev,
            [name]: trimmed
        }));
    } else {
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const displayedAddresses = showAll ? addresses : addresses.slice(0, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
      
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAddresses.map((address, index) => (
              <motion.button
                key={index}
                onClick={() => handleAddressSelect(address)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left
                  ${selectedAddress === address 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-100 hover:border-primary/20'}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl
                    transition-colors duration-200 ${
                      selectedAddress === address 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{address.fullName}</div>
                    <div className="text-sm text-gray-500">
                      {address.street}{address.apartment && `, ${address.apartment}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPhoneNumber(address.phone)}
                    </div>
                  </div>
                </div>

                {selectedAddress === address && (
                  <motion.div 
                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 
                      flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
            
            {/* Add New Address Card */}
            {addresses.length < 5 && !showNewAddressForm && (
              <motion.button
                onClick={() => setShowNewAddressForm(true)}
                className="relative p-4 rounded-2xl border-2 border-dashed border-gray-200 
                  hover:border-primary/20 transition-all duration-200"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <FaPlus className="text-xl text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Add New Address</span>
                </div>
              </motion.button>
            )}
          </div>
          
          {addresses.length > 3 && !showAll && (
            <motion.button 
              onClick={() => setShowAll(true)}
              className="w-full text-primary font-medium py-2 hover:text-primary/80 transition-colors"
              whileHover={{ y: -1 }}
            >
              Show More Addresses
            </motion.button>
          )}
        </div>
      )}

      {/* Show Add New Address button if no addresses exist */}
      {addresses.length === 0 && !showNewAddressForm && (
        <motion.button
          onClick={() => setShowNewAddressForm(true)}
          className="w-full py-3 rounded-xl font-medium bg-gray-50 text-gray-900
            hover:bg-gray-100 transition-all duration-200"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Add New Address
        </motion.button>
      )}

      {/* New Address Form Modal */}
      <AnimatePresence>
        {showNewAddressForm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Add New Address</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name: 'fullName', placeholder: 'Full Name', required: true },
                  { name: 'street', placeholder: 'Street Address', required: true },
                  { name: 'apartment', placeholder: 'Apartment, Suite, etc. (optional)', required: false },
                  { name: 'city', placeholder: 'City', required: true, half: true },
                  { name: 'state', placeholder: 'State', required: true, half: true },
                  { name: 'zipCode', placeholder: 'ZIP Code', required: true },
                  { name: 'phone', placeholder: 'Phone Number', required: true, type: 'tel' }
                ].map((field, index) => (
                  <div key={field.name} className={field.half ? 'grid grid-cols-2 gap-4' : ''}>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={field.name === 'phone' ? formatPhoneNumber(newAddress[field.name]) : newAddress[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full p-3 rounded-xl border-2 border-gray-100 
                        focus:border-primary/20 focus:ring-0 transition-colors
                        placeholder:text-gray-400"
                      maxLength={field.name === 'phone' ? 14 : undefined}
                    />
                  </div>
                ))}

                <div className="flex gap-4 mt-6">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-medium
                      hover:bg-primary/90 transition-all duration-200"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Address
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="flex-1 bg-gray-50 text-gray-900 py-3 rounded-xl font-medium
                      hover:bg-gray-100 transition-all duration-200"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>

              {error && (
                <motion.p 
                  className="text-red-500 mt-4 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 