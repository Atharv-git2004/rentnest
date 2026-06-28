import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trash2, Search, Mail, User, AlertCircle, 
  CheckCircle, XCircle, RefreshCw 
} from 'lucide-react';
import { apiRequest } from '../../services/api'; 

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // Track which user is currently undergoing an action

  // Safe API Response Parser (To prevent unexpected token '<' crash)
  const parseResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    await res.text(); // Consume the raw text to clear the body stream
    return { 
      message: res.status === 404 
        ? "API Endpoint not found (404). Please verify your backend API routes." 
        : `Server returned an error (${res.status}).`
    };
  };

  // 1. Fetch Logic - Fetch from '/admin/users' route
  const fetchUsers = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/admin/users'); 
      const data = await parseResponse(res);

      if (res.ok) {
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users list.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Server connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Toggle Status (Active / Blocked)
  const handleToggleBlock = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    setActionLoading(id);
    setError('');

    try {
      const res = await apiRequest(`/admin/users/${id}/status`, {
        method: 'PUT',
        body: { status: newStatus }, 
      });

      const data = await parseResponse(res);

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
      } else {
        setError(data.message || 'Failed to update user status.');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Something went wrong while updating status.');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Delete user function
  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}"?`)) return;

    setActionLoading(id);
    setError('');

    try {
      const res = await apiRequest(`/admin/users/${id}`, {
        method: 'DELETE',
      });

      const data = await parseResponse(res);

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== id));
      } else {
        setError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Something went wrong while deleting user.');
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Search and filter logic
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="w-full md:w-auto">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Users className="text-green-600" size={28} />
            Manage Users
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 md:mt-2">
            View registered users, manage account status, or remove members from the platform.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 sm:p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-300 rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50 shrink-0"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-green-600" : ""} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 text-red-700 p-3 sm:p-4 rounded-xl text-sm font-semibold border border-red-200 shadow-sm"
          >
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" /> 
              <span className="leading-tight">{error}</span>
            </div>
            <button 
              onClick={fetchUsers}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm self-end sm:self-auto shrink-0"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Fetching users data...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full"
        >
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">User Details</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Role</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isProcessing = actionLoading === user._id;
                    const isActive = user.status === 'Active' || !user.status;

                    return (
                      <tr 
                        key={user._id} 
                        className={`hover:bg-slate-50/70 transition-colors ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {/* User details */}
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center border border-slate-200 uppercase flex-shrink-0">
                              {user.name ? user.name.charAt(0) : <User size={18} />}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-[120px] max-w-[200px] sm:max-w-xs md:max-w-sm overflow-hidden">
                              <span className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                {user.name || 'Unavailable'}
                              </span>
                              <span className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 font-medium truncate">
                                <Mail size={12} className="flex-shrink-0" /> 
                                <span className="truncate">{user.email || 'N/A'}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : user.role === 'owner' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {user.role || 'User'}
                          </span>
                        </td>

                        {/* Status Button */}
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.status || 'Active')}
                            disabled={user.role === 'admin'}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                              user.role === 'admin'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                            }`}
                          >
                            {isActive ? <CheckCircle size={14} className="flex-shrink-0" /> : <XCircle size={14} className="flex-shrink-0" />}
                            {isActive ? 'Active' : 'Blocked'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name || 'User')}
                            disabled={user.role === 'admin'}
                            className={`p-1.5 sm:p-2 rounded-xl transition-all ${
                              user.role === 'admin' 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete User"
                          >
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500 font-medium text-sm">
                      {searchTerm ? "No users found matching your search." : "No registered users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageUsers;