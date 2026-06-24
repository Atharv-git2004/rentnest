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
  const [actionLoading, setActionLoading] = useState(null); // ഏത് യൂസറിലാണ് ആക്ഷൻ നടക്കുന്നത് എന്ന് ട്രാക്ക് ചെയ്യാൻ

  // 💡 Safe API Response Parser (To prevent unexpected token '<' crash)
  const parseResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    await res.text(); // കൺസ്യൂം ചെയ്ത് കളയാൻ
    return { 
      message: res.status === 404 
        ? "API Endpoint not found (404). Please verify your backend API routes." 
        : `Server returned an error (${res.status}).`
    };
  };

  // 1. ഫെച്ച് ലോജിക് - റൂട്ട് '/admin/users' എന്നാക്കി മാറ്റി
  const fetchUsers = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('/admin/users'); // 💡 മാറ്റം ഇവിടെയാണ്
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

  // 2. സ്റ്റാറ്റസ് മാറ്റുന്നു (Active / Blocked)
  const handleToggleBlock = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    setActionLoading(id);
    setError('');

    try {
      // 💡 അഡ്മിൻ റൂട്ട് ആയതിനാൽ /admin/users/${id}/status എന്ന് മാറ്റി
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

  // 3. ഡിലീറ്റ് ഫങ്ഷൻ
  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}"?`)) return;

    setActionLoading(id);
    setError('');

    try {
      // 💡 അഡ്മിൻ റൂട്ട് ആയതിനാൽ /admin/users/${id} എന്ന് മാറ്റി
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

  // 4. ഫിൽട്ടർ ലോജിക്
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Users className="text-green-600" size={28} />
            Manage Users
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            View registered users, manage account status, or remove members from the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-300 rounded-xl shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-green-600" : ""} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
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
            className="mb-6 flex items-center justify-between bg-red-50 text-red-700 p-4 rounded-xl text-sm font-semibold border border-red-200 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" /> 
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchUsers}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Fetching users data...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center border border-slate-200 uppercase flex-shrink-0">
                              {user.name ? user.name.charAt(0) : <User size={18} />}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-800 text-base">
                                {user.name || 'Unavailable'}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                <Mail size={12} /> {user.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.status || 'Active')}
                            disabled={user.role === 'admin'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              user.role === 'admin'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                            }`}
                          >
                            {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {isActive ? 'Active' : 'Blocked'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name || 'User')}
                            disabled={user.role === 'admin'}
                            className={`p-2 rounded-xl transition-all ${
                              user.role === 'admin' 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
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