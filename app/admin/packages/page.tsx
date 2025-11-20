'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { packageAPI } from '@/lib/api';
import type { MembershipPackage } from '@/types';
import toast from 'react-hot-toast';

export default function AdminPackagesPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MembershipPackage | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMonths: 1,
    price: 0,
    features: [''],
    category: 'custom' as 'basic' | 'premium' | 'vip' | 'custom',
    maxMembers: undefined as number | undefined,
    discount: 0,
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?redirect=/admin/packages');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchPackages();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      if (response.success && response.data) {
        setPackages(response.data);
      }
    } catch (error: any) {
      toast.error('Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty features
    const filteredFeatures = formData.features.filter((f) => f.trim() !== '');

    // Validate at least one feature
    if (filteredFeatures.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    try {
      const response = await packageAPI.create({
        ...formData,
        features: filteredFeatures,
      });
      if (response.success) {
        toast.success('Package created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPackages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create package');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    // Filter out empty features
    const filteredFeatures = formData.features.filter((f) => f.trim() !== '');

    // Validate at least one feature
    if (filteredFeatures.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    try {
      const response = await packageAPI.update(editingPackage._id, {
        ...formData,
        features: filteredFeatures,
      });
      if (response.success) {
        toast.success('Package updated successfully!');
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update package');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await packageAPI.delete(id);
      if (response.success) {
        toast.success('Package deleted successfully!');
        fetchPackages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete package');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await packageAPI.toggleActive(id);
      if (response.success) {
        toast.success('Package status updated!');
        fetchPackages();
      }
    } catch (error: any) {
      toast.error('Failed to update package status');
    }
  };

  const openEditModal = (pkg: MembershipPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      durationMonths: pkg.durationMonths,
      price: pkg.price,
      features: pkg.features,
      category: pkg.category,
      maxMembers: pkg.maxMembers,
      discount: pkg.discount || 0,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      durationMonths: 1,
      price: 0,
      features: [''],
      category: 'custom',
      maxMembers: undefined,
      discount: 0,
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card-solid p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeInDown">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Membership Packages</h1>
            <p className="text-white/90 mt-2">Create and manage gym membership packages</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${
                !pkg.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pkg.category}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pkg.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{pkg.description}</p>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-600">
                    LKR {pkg.discount > 0 ? pkg.discountedPrice : pkg.price}
                  </span>
                  {pkg.discount > 0 && (
                    <span className="text-lg text-gray-400 line-through">
                      LKR {pkg.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.durationMonths} month(s)</p>
                {pkg.discount > 0 && (
                  <span className="text-sm text-green-600 font-semibold">
                    {pkg.discount}% off
                  </span>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">Features:</h4>
                <ul className="space-y-1">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="text-purple-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-sm text-gray-500 dark:text-gray-400">
                      +{pkg.features.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>

              {pkg.maxMembers && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{pkg.currentMembers}</span> /{' '}
                  {pkg.maxMembers} members
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(pkg._id)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
                >
                  {pkg.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12 glass-card-solid rounded-xl shadow-2xl">
            <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">No packages yet. Create your first package!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPackage) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="glass-card-solid rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPackage(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={editingPackage ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Premium Yearly"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this package..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Duration (months) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="24"
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMonths: parseInt(e.target.value) })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'basic' | 'premium' | 'vip' | 'custom',
                      })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Max Members (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxMembers || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxMembers: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Features *</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-purple-600 text-sm hover:text-purple-700"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Feature ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700 px-3"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
