import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, X, Send } from 'lucide-react';
// Ensure your api.js path is correct
import { apiRequest } from '../../services/api'; 

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Fetch from the backend route
      const res = await apiRequest('/complaints'); 
      const data = await res.json();

      if (res.ok) {
        setComplaints(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch complaints');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!adminResponse.trim()) {
      alert("Please provide a response before resolving the complaint.");
      return;
    }

    try {
      const res = await apiRequest(`/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: 'Resolved', 
          adminResponse: adminResponse 
        }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setComplaints(complaints.map(c => c._id === id ? data.data : c));
        setSelectedComplaint(null);
        setAdminResponse('');
        alert('Complaint resolved successfully!');
      } else {
        alert(data.message || 'Failed to update complaint');
      }
    } catch (err) {
      alert('Something went wrong while updating.');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-amber-500 shrink-0" size={28} />
          Manage Complaints
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 sm:mt-2">
          Review and resolve issues reported by users.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center h-48 sm:h-64 items-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div key={complaint._id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className={`px-2 py-1 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md flex items-center gap-1.5 shrink-0 ${
                      complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {complaint.status === 'Resolved' ? <CheckCircle size={12} className="shrink-0" /> : <Clock size={12} className="shrink-0" />}
                      {complaint.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium shrink-0">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1.5 line-clamp-1">{complaint.subject}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 text-[11px] sm:text-xs text-gray-400 font-semibold truncate">
                    Reported by: <span className="text-slate-600">{complaint.user?.name || 'Unknown User'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedComplaint(complaint)}
                  className="mt-4 sm:mt-5 w-full py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <CheckCircle className="text-green-400 mb-3" size={40} />
              <p className="text-gray-500 font-medium text-sm sm:text-base">No pending complaints found.</p>
              <p className="text-xs text-gray-400 mt-1">All user issues have been resolved!</p>
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 pr-4">Complaint Details</h3>
                <button 
                  onClick={() => { setSelectedComplaint(null); setAdminResponse(''); }} 
                  className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Subject</span>
                  <p className="font-bold text-slate-800 mt-0.5 text-sm sm:text-base">{selectedComplaint.subject}</p>
                </div>
                
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Description</span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.status === 'Resolved' ? (
                  <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100 mt-2">
                    <span className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">Admin Response</span>
                    <p className="text-xs sm:text-sm text-green-800 mt-1 whitespace-pre-wrap">{selectedComplaint.adminResponse}</p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-2">Your Reply & Resolution</label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none"
                      rows="4"
                      placeholder="Type the solution or response here..."
                    ></textarea>
                    
                    <button
                      onClick={() => handleResolve(selectedComplaint._id)}
                      className="mt-3 w-full py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Send size={16} className="shrink-0" /> Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageComplaints;