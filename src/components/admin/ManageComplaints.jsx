import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, X, Send } from 'lucide-react';
import { apiRequest } from '../../services/api'; // നിങ്ങളുടെ api.js പാത്ത് ശരിയാണോ എന്ന് ഉറപ്പുവരുത്തുക

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
      // നിങ്ങളുടെ ബാക്ക്-എൻഡ് റൂട്ട്
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={28} />
          Manage Complaints
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Review and resolve issues reported by users.
        </p>
      </div>

      {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div key={complaint._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${
                      complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {complaint.status === 'Resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {complaint.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{complaint.subject}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{complaint.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 font-semibold">
                    Reported by: {complaint.user?.name || 'Unknown User'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedComplaint(complaint)}
                  className="mt-5 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10 font-medium">No complaints found.</p>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Complaint Details</h3>
                <button onClick={() => { setSelectedComplaint(null); setAdminResponse(''); }} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Subject</span>
                  <p className="font-bold text-slate-800">{selectedComplaint.subject}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase">Description</span>
                  <p className="text-sm text-slate-600 mt-1">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.status === 'Resolved' ? (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <span className="text-xs font-bold text-green-700 uppercase">Admin Response</span>
                    <p className="text-sm text-green-800 mt-1">{selectedComplaint.adminResponse}</p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Your Reply & Resolution</label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="4"
                      placeholder="Type the solution or response here..."
                    ></textarea>
                    <button
                      onClick={() => handleResolve(selectedComplaint._id)}
                      className="mt-3 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send size={16} /> Mark as Resolved
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