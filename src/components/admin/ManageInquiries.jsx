import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, CheckCircle, Search, Mail, User, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';

const ManageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/admin/inquiries'); 
      const data = await res.json();
      
      if (res.ok) {
        setInquiries(data);
      } else {
        setError(data.message || 'Failed to fetch inquiries');
      }
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    try {
      const res = await apiRequest(`/admin/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries(inquiries.map(inq => 
          inq._id === id ? { ...inq, status: newStatus } : inq
        ));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    
    try {
      const res = await apiRequest(`/admin/inquiries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInquiries(inquiries.filter(inq => inq._id !== id));
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      alert('Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inq.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <MessageSquare className="text-green-600" size={28} /> 
            Manage Inquiries
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Review and respond to user messages and property inquiries.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Data Table */}
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
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                            <User size={14} className="text-gray-400" /> {inquiry.name}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                            <Mail size={14} className="text-gray-400" /> {inquiry.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 font-medium max-w-xs truncate" title={inquiry.message}>
                          ={inquiry.message}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                          <Clock size={14} /> 
                          {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleStatusUpdate(inquiry._id, inquiry.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            inquiry.status === 'Resolved' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {inquiry.status === 'Resolved' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {inquiry.status || 'Pending'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleDelete(inquiry._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Inquiry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                      No inquiries found.
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

export default ManageInquiries;