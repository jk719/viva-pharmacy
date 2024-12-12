'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

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
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Shipping Address</h2>
      
      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAddresses.map((address, index) => (
              <button
                key={index}
                onClick={() => handleAddressSelect(address)}
                className={`relative p-4 rounded-lg border transition-all text-left ${
                  selectedAddress === address
                    ? 'border-[#289d44] bg-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    selectedAddress === address ? 'bg-[#289d44] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{address.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {address.street}{address.apartment && `, ${address.apartment}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatPhoneNumber(address.phone)}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedAddress === address
                      ? 'border-[#289d44] bg-[#289d44]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAddress === address && (
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                {selectedAddress === address && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-[#289d44] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
            
            {/* Add New Address Card */}
            {addresses.length < 5 && !showNewAddressForm && (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="relative p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl text-gray-600">+</span>
                  </div>
                  <span className="block text-sm text-gray-600">Add New Address</span>
                </div>
              </button>
            )}
          </div>
          
          {addresses.length > 3 && !showAll && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-[#289d44] hover:text-opacity-80 font-medium"
            >
              Show More Addresses
            </button>
          )}
        </div>
      )}

      {/* Show Add New Address button if no addresses exist */}
      {addresses.length === 0 && !showNewAddressForm && (
        <button
          onClick={() => setShowNewAddressForm(true)}
          className="w-full py-2 px-4 bg-[#F3F4F6] text-[#003366] rounded-md hover:bg-gray-100"
        >
          + Add New Address
        </button>
      )}

      {/* New Address Form Modal */}
      {showNewAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add New Address</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                value={newAddress.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="street"
                value={newAddress.street}
                onChange={handleInputChange}
                placeholder="Street Address"
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="apartment"
                value={newAddress.apartment}
                onChange={handleInputChange}
                placeholder="Apartment, Suite, etc. (optional)"
                className="w-full p-2 border rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="state"
                  value={newAddress.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <input
                type="text"
                name="zipCode"
                value={newAddress.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="tel"
                name="phone"
                value={formatPhoneNumber(newAddress.phone)}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
                className="w-full p-2 border rounded"
                maxLength="14"
              />

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#289d44] text-white py-2 px-4 rounded-md hover:opacity-90"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(false)}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
} 