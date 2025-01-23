"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiEdit2 } from 'react-icons/fi';

export default function ManagerManagement() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch managers
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/admin/managers');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Debug log to check the data
      console.log('Fetched managers:', data.managers);
      
      setManagers(data.managers);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name || '',
      email: manager.email || '',
      password: ''
    });
    setShowForm(true);
  };

  const handleDeleteManager = async (managerId) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    console.log('Attempting to delete manager with ID:', managerId); // Debug log

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/managers/${managerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Delete response:', data); // Debug log
      
      if (!response.ok) throw new Error(data.error);

      setSuccessMessage('Manager deleted successfully');
      await fetchManagers();

    } catch (err) {
      console.error('Delete error:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const url = editingManager 
        ? `/api/admin/managers/${editingManager._id}`
        : '/api/admin/managers';

      const method = editingManager ? 'PUT' : 'POST';
      
      // Only include password in the request if it's provided
      const requestData = {
        name: formData.name || '',
        email: formData.email || '',
        ...(formData.password && { password: formData.password })
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setSuccessMessage(
        editingManager 
          ? `Manager updated successfully` 
          : `Manager account created successfully for ${formData.email}`
      );
      
      // Reset form and state
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      setEditingManager(null);
      await fetchManagers();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingManager(null);
    setFormData({ name: '', email: '', password: '' });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Managers</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary/90 transition-colors duration-200"
          >
            <FiUserPlus />
            <span>Add Manager</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-lg">
          <FiCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gray-50 rounded-lg space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {editingManager ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required={!editingManager}
                minLength={8}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              {editingManager ? 'Update Manager' : 'Create Manager'}
            </button>
          </div>
        </motion.form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.map((manager) => {
              console.log('Manager data:', manager); // Debug log
              return (
                <tr key={manager._id || manager.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {manager.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{manager.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(manager.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(manager.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        onClick={() => handleEdit(manager)}
                        title="Edit manager"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        onClick={() => handleDeleteManager(manager._id || manager.id)}
                        title="Delete manager"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 