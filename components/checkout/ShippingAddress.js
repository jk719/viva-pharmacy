'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {displayedAddresses.map((address, index) => (
              <div 
                key={index}
                className={`flex-shrink-0 w-64 rounded-lg p-4 cursor-pointer
                  ${selectedAddress === address 
                    ? 'border-[3px] border-[#003366] text-[#003366] bg-white font-semibold' 
                    : 'border border-gray-200 text-gray-600 bg-white'
                  }`}
                onClick={() => handleAddressSelect(address)}
              >
                <p className={`${selectedAddress === address ? 'font-bold' : 'font-medium'}`}>
                  {address.fullName}
                </p>
                <p className="text-sm">{address.street}{address.apartment && `, ${address.apartment}`}</p>
                <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
                <p className="text-sm">{formatPhoneNumber(address.phone)}</p>
              </div>
            ))}
            
            {/* Add New Address Card */}
            {addresses.length < 5 && !showNewAddressForm && (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="flex-shrink-0 w-64 h-full bg-white text-gray-600 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-200"
              >
                <div className="text-center">
                  <span className="block text-2xl">+</span>
                  <span className="block text-sm">Add New Address</span>
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