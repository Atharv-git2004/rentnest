import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Shield, Search, Mail, User, ShieldAlert, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '../../services/api'; // നിങ്ങളുടെ API റിക്വസ്റ്റ് സർവീസ്

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // 1. എല്ലാ യൂസർമാരുടെയും വിവരങ്ങൾ ബാക്ക്-എൻഡിൽ നിന്ന് ഫെച്ച് ചെയ്യുന്നു
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/users'); // നിങ്ങളുടെ യഥാർത്ഥ അഡ്മിൻ യൂസർ API എൻഡ്‌പോയിന്റ് നൽകുക
      const data = await res.json();

      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. യൂസറുടെ സ്റ്റാറ്റസ് മാറ്റുന്നു (Active / Blocked toggle)
  const handleToggleBlock = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    try {
      const res = await apiRequest(`/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setUsers(
          users.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Something went wrong');
    }
  };

  // 3. യൂസറെ സിസ്റ്റത്തിൽ നിന്ന് സ്ഥിരമായി ഡിലീറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      const res = await apiRequest(`/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter((user) => user._id !== id));
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Something went wrong');
    }
  };

  // 4. സേർച്ച് ഫിൽട്ടർ ലോജിക് (Name, Email അല്ലെങ്കിൽ Role വെച്ച് സേർച്ച് ചെയ്യാം)
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* User Avatar, Name, Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center border border-slate-200 uppercase">
                            {user.name ? user.name.charAt(0) : <User size={18} />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-base">{user.name}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                              <Mail size={12} /> {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : user.role === 'owner' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleBlock(user._id, user.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            user.status === 'Active' || !user.status
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {user.status === 'Active' || !user.status ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {user.status || 'Active'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
                          disabled={user.role === 'admin'} // അഡ്മിനെ അബദ്ധത്തിൽ ഡിലീറ്റ് ചെയ്യാതിരിക്കാൻ
                        >
                          <Trash2 size={18} className={user.role === 'admin' ? "opacity-30 cursor-not-allowed" : ""} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                      No users found matching your search.
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