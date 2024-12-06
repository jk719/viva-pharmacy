'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

function formatPhoneNumber(value) {
  const phoneNumber = value.replace(/\D/g, '');
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
}

function ProfileInfo({ user }) {
  const [editMode, setEditMode] = useState(false);
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formattedPhone
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditMode(false);
        await update({
          ...session,
          user: {
            ...session.user,
            ...formData
          }
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <h2 className="text-xl font-bold text-[#003366] mb-1">Your Profile</h2>
          <p className="text-sm text-gray-600">Manage your information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#003366] mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={!editMode}
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-[#003366] mb-4">Shipping Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 bg-[#e6eef5] text-[#003366] rounded-lg hover:bg-[#d9e5f2] transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileInfo; 