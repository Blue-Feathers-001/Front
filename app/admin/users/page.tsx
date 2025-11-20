'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  membershipStatus: string;
  membershipPlan?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    membershipStatus: 'inactive',
    membershipPlan: '',
    membershipStartDate: '',
    membershipEndDate: '',
  });

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterJoinFrom, setFilterJoinFrom] = useState('');
  const [filterJoinTo, setFilterJoinTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk Actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkUpdateData, setBulkUpdateData] = useState({
    membershipStatus: '',
    membershipPlan: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    } else if (isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [searchQuery, filterStatus, filterPlan, filterJoinFrom, filterJoinTo, currentPage]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus) params.append('membershipStatus', filterStatus);
      if (filterPlan) params.append('membershipPlan', filterPlan);
      if (filterJoinFrom) params.append('joinDateFrom', filterJoinFrom);
      if (filterJoinTo) params.append('joinDateTo', filterJoinTo);
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');

      const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.users);
      setTotalPages(response.data.pages || 1);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterPlan('');
    setFilterJoinFrom('');
    setFilterJoinTo('');
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (!bulkUpdateData.membershipStatus && !bulkUpdateData.membershipPlan) {
      toast.error('Please select at least one field to update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updates: any = {};
      if (bulkUpdateData.membershipStatus) updates.membershipStatus = bulkUpdateData.membershipStatus;
      if (bulkUpdateData.membershipPlan) updates.membershipPlan = bulkUpdateData.membershipPlan;

      await axios.post(
        `${API_URL}/users/bulk/update`,
        { userIds: selectedUsers, updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${selectedUsers.length} users updated successfully`);
      setSelectedUsers([]);
      setShowBulkActions(false);
      setBulkUpdateData({ membershipStatus: '', membershipPlan: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update users');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/users/bulk/delete`,
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${selectedUsers.length} users deleted successfully`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete users');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          membershipStatus: editingUser.membershipStatus,
          membershipPlan: editingUser.membershipPlan,
          membershipStartDate: editingUser.membershipStartDate,
          membershipEndDate: editingUser.membershipEndDate,
          role: editingUser.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('User updated successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/users`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('User created successfully');
      setIsCreating(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        membershipStatus: 'inactive',
        membershipPlan: '',
        membershipStartDate: '',
        membershipEndDate: '',
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const openCreateModal = () => {
    setIsCreating(true);
  };

  const closeCreateModal = () => {
    setIsCreating(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      membershipStatus: 'inactive',
      membershipPlan: '',
      membershipStartDate: '',
      membershipEndDate: '',
    });
  };

  if (authLoading || loading) {
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeInDown">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              User Management
            </h1>
            <p className="text-white/90 mt-2">Manage all gym members and staff ({totalUsers} total)</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New User
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="glass-card-solid rounded-2xl shadow-lg p-6 mb-6 animate-fadeInUp">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              {(searchQuery || filterStatus || filterPlan || filterJoinFrom || filterJoinTo) && (
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 pt-4 border-t-2 border-gray-200 dark:border-gray-600 animate-fadeIn">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Plan</label>
                <select
                  value={filterPlan}
                  onChange={(e) => { setFilterPlan(e.target.value); handleFilterChange(); }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Plans</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Join From</label>
                <input
                  type="date"
                  value={filterJoinFrom}
                  onChange={(e) => { setFilterJoinFrom(e.target.value); handleFilterChange(); }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Join To</label>
                <input
                  type="date"
                  value={filterJoinTo}
                  onChange={(e) => { setFilterJoinTo(e.target.value); handleFilterChange(); }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="glass-card-solid rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center gap-4 animate-fadeIn">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Bulk Update
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Bulk Update Modal */}
        {showBulkActions && (
          <div className="glass-card-solid rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Bulk Update Settings</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Membership Status</label>
                <select
                  value={bulkUpdateData.membershipStatus}
                  onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, membershipStatus: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Change</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Membership Plan</label>
                <select
                  value={bulkUpdateData.membershipPlan}
                  onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, membershipPlan: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">No Change</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleBulkUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Apply Updates
              </button>
              <button
                onClick={() => setShowBulkActions(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="glass-card-solid rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Name</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Email</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Phone</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Role</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Status</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Plan</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Registered</th>
                  <th className="px-3 py-3 text-left font-bold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-primary-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-3 py-3 dark:text-gray-200 text-sm">{user.name}</td>
                    <td className="px-3 py-3 dark:text-gray-200 text-sm">{user.email}</td>
                    <td className="px-3 py-3 dark:text-gray-200 text-sm">{user.phone}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          user.membershipStatus === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                            : user.membershipStatus === 'expired'
                            ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {user.membershipStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 capitalize dark:text-gray-200 text-sm">
                      {user.membershipPlan || '-'}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => router.push(`/admin/users/${user._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs whitespace-nowrap"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const API_URL = process.env.NEXT_PUBLIC_API_URL;
                            const token = localStorage.getItem('token');
                            window.open(`${API_URL}/users/${user._id}/membership-card?token=${token}`, '_blank');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs whitespace-nowrap"
                          title="Download Membership Card"
                        >
                          🎫 Card
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-xs whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all dark:text-white"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-all dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card-solid rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New User</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Membership Status
                  </label>
                  <select
                    value={newUser.membershipStatus}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        membershipStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Membership Plan
                  </label>
                  <select
                    value={newUser.membershipPlan}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        membershipPlan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">None</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newUser.membershipStartDate}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        membershipStartDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newUser.membershipEndDate}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        membershipEndDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-card-solid rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Membership Status
                  </label>
                  <select
                    value={editingUser.membershipStatus}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        membershipStatus: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Membership Plan
                  </label>
                  <select
                    value={editingUser.membershipPlan || ''}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        membershipPlan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">None</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingUser.membershipStartDate
                        ? editingUser.membershipStartDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        membershipStartDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingUser.membershipEndDate
                        ? editingUser.membershipEndDate.split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        membershipEndDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
