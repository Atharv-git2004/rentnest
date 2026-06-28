import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, FileText, Type, Clock, CheckCircle, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../services/api';

const ComplaintsPage = () => {
  // Form state management
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // States for displaying previous complaints
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // 🔄 Fetch previous complaints from the server on page load
  const fetchComplaints = async () => {
    try {
      setLoadingList(true);
      const response = await apiRequest('/complaints', { method: 'GET' });
      
      // Safe JSON Parsing to prevent crashes
      let resData;
      try {
        resData = await response.json();
      } catch (e) {
        resData = { message: "Invalid server response format." };
      }
      
      if (response.ok || resData.success) {
        // Ensure data is an array
        const dataArray = Array.isArray(resData.data) ? resData.data : [];
        setComplaints(dataArray);
      } else if (response.status === 401) {
        // Token expired / Unauthorized error handling
        toast.error("Session expired. Please log in again.");
        setComplaints([]);
      } else {
        toast.error(resData.message || "Failed to load your complaints.");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load your complaints.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // 🚀 Function to submit a new complaint
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      return toast.error('Please fill in all fields.');
    }

    setLoading(true);
    try {
      // apiRequest automatically handles JSON conversion and Token injection
      const response = await apiRequest('/complaints', {
        method: 'POST',
        body: { subject, description }
      });

      let resData;
      try {
        resData = await response.json();
      } catch (e) {
        resData = { message: "Invalid server response format." };
      }

      if (response.ok || resData.success) {
        toast.success('Your complaint has been submitted successfully.');
        setSubject('');
        setDescription('');
        
        // Re-fetch data immediately after submission to update the list
        fetchComplaints(); 
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in again to submit.");
      } else {
        toast.error(resData.message || 'Failed to submit complaint.');
      }
    } catch (error) {
      console.error("Complaint Submission Error:", error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Help & Support</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Submit your issues or track the status of your previous complaints.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ================= LEFT SIDE: COMPLAINT FORM ================= */}
          <div className="lg:col-span-5 h-max w-full">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />
              
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
                  <AlertTriangle size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">New Complaint</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Fill details below to raise an issue</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
                {/* Subject Input */}
                <div className="space-y-1.5 w-full">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Subject</label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Type size={18} />
                    </div>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="E.g., Water leakage, App issue..."
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5 w-full">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Detailed Description</label>
                  <div className="relative w-full">
                    <div className="absolute top-3 sm:top-3.5 left-0 pl-3.5 pointer-events-none text-slate-400">
                      <FileText size={18} />
                    </div>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={5}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm sm:text-base text-slate-800 resize-none placeholder:text-slate-400"
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center w-full gap-2 px-6 py-3 sm:py-3.5 text-sm font-bold bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl shadow-lg shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-80 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> <span>Submit Issue</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* ================= RIGHT SIDE: COMPLAINT HISTORY ================= */}
          <div className="lg:col-span-7 w-full">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 border border-slate-100 min-h-[400px] lg:min-h-[500px] w-full"
            >
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-5 sm:mb-6 flex items-center gap-2">
                <Clock size={20} className="text-slate-400 shrink-0" />
                Your Recent Complaints
              </h3>

              {loadingList ? (
                // Loading Skeleton
                <div className="space-y-4 w-full">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-full h-24 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-400 w-full">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <SearchX size={24} className="sm:w-[28px] sm:h-[28px]" />
                  </div>
                  <p className="font-medium text-sm sm:text-base">No complaints found</p>
                  <p className="text-xs sm:text-sm text-center px-4">You haven't submitted any complaints yet.</p>
                </div>
              ) : (
                // Complaints List
                <div className="space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar w-full">
                  <AnimatePresence>
                    {complaints.map((comp) => (
                      <motion.div
                        key={comp._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-200 hover:shadow-md transition-all group w-full"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-orange-600 transition-colors break-words w-full sm:flex-1">
                            {comp.subject || comp.title}
                          </h4>
                          
                          {/* Status Badge */}
                          <div className="self-start sm:self-auto">
                            <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                              comp.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                              comp.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {comp.status === 'Resolved' && <CheckCircle size={12} />}
                              {comp.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 whitespace-pre-wrap break-words w-full">
                          {comp.description}
                        </p>

                        {/* Admin Response (If available) */}
                        {comp.adminResponse && (
                          <div className="mt-3 p-2.5 sm:p-3 bg-white border border-green-100 rounded-lg text-xs sm:text-sm w-full break-words">
                            <span className="font-bold text-green-700 text-[10px] sm:text-xs block mb-1">Admin Response:</span>
                            <span className="text-slate-700 block">{comp.adminResponse}</span>
                          </div>
                        )}

                        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200 flex items-center text-[10px] sm:text-xs text-slate-400 font-medium w-full">
                          {formatDate(comp.createdAt)}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;