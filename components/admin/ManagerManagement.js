"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiTrash2, FiAlertCircle, FiCheckCircle, FiEdit2, FiMail, FiUser } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ManagerManagement() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Add timeout cleanup for success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/managers', {
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch managers');
      }
      
      const data = await response.json();
      console.log('Fetched managers:', data.managers);
      setManagers(data.managers || []);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update useEffect dependency
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name || '',
      email: manager.email || '',
    });
    setShowForm(true);
  };

  const handleDeleteManager = async (managerId) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/managers/${managerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      // Update the local state immediately
      setManagers(prevManagers => 
        prevManagers.filter(manager => manager._id !== managerId)
      );
      
      setSuccessMessage('Manager deleted successfully');

    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
      // Refetch managers if there was an error to ensure sync
      await fetchManagers();
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
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setSuccessMessage(
        editingManager
          ? `Manager updated successfully!`
          : `Manager account created successfully! An email has been sent to ${formData.email} with login instructions.`
      );
      
      setFormData({ name: '', email: '' });
      setShowForm(false);
      setEditingManager(null);
      await fetchManagers();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add function to cancel editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingManager(null);
    setFormData({ name: '', email: '' });
    setError(null);
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
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div key={managers.length} className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Product Managers
          </h2>
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl
                         hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FiUserPlus className="h-5 w-5" />
              <span>Add Manager</span>
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl mb-6"
            >
              <FiAlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-xl mb-6"
            >
              <FiCheckCircle className="h-5 w-5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-50/50 rounded-xl p-6 mb-8 border border-gray-100"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                      placeholder="Enter manager's name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                      placeholder="Enter manager's email"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
                           transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {editingManager ? 'Update Manager' : 'Create Manager'}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
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
      </motion.div>
    </div>
  );
} 