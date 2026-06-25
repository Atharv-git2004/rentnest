import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, FileText, Type, Clock, CheckCircle, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../services/api';

const ComplaintsPage = () => {
  // ഫോമിന് വേണ്ടിയുള്ള സ്റ്റേറ്റുകൾ
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // മുമ്പത്തെ പരാതികൾ കാണിക്കാൻ വേണ്ടിയുള്ള സ്റ്റേറ്റുകൾ
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // 🔄 പേജ് ലോഡ് ആകുമ്പോൾ മുമ്പത്തെ പരാതികൾ സെർവറിൽ നിന്ന് എടുക്കുന്നു
  const fetchComplaints = async () => {
    try {
      setLoadingList(true);
      const response = await apiRequest('/complaints', { method: 'GET' });
      const resData = await response.json();
      
      if (response.ok || resData.success) {
        setComplaints(resData.data || []);
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

  // 🚀 പുതിയ പരാതി സബ്മിറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      return toast.error('Please fill in all fields.');
    }

    setLoading(true);
    try {
      const response = await apiRequest('/complaints', {
        method: 'POST',
        body: { subject, description }
      });

      const resData = await response.json();

      if (response.ok || resData.success) {
        toast.success('Your complaint has been submitted successfully.');
        setSubject('');
        setDescription('');
        
        // സബ്മിറ്റ് ചെയ്ത ഉടനെ ലിസ്റ്റ് അപ്ഡേറ്റ് ചെയ്യാൻ വീണ്ടും ഡാറ്റ വിളിക്കുന്നു
        fetchComplaints(); 
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

  // തീയതി ഫോർമാറ്റ് ചെയ്യാൻ
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-800">Help & Support</h1>
          <p className="text-slate-500 mt-2">Submit your issues or track the status of your previous complaints.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT SIDE: COMPLAINT FORM ================= */}
          <div className="lg:col-span-5 h-max">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
                  <AlertTriangle size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">New Complaint</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fill details below to raise an issue</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Subject Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Subject</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Type size={18} />
                    </div>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="E.g., Water leakage, App issue..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder:text-slate-400"
                      maxLength={100}
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Detailed Description</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none text-slate-400">
                      <FileText size={18} />
                    </div>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={5}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 resize-none placeholder:text-slate-400"
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center w-full gap-2 px-6 py-3.5 text-sm font-bold bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-xl shadow-lg shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-80 disabled:pointer-events-none"
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
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 min-h-[500px]"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" />
                Your Recent Complaints
              </h3>

              {loadingList ? (
                // Loading Skeleton
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="w-full h-24 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : complaints.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <SearchX size={28} />
                  </div>
                  <p className="font-medium">No complaints found</p>
                  <p className="text-sm">You haven't submitted any complaints yet.</p>
                </div>
              ) : (
                // Complaints List
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {complaints.map((comp) => (
                      <motion.div
                        key={comp._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-200 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-orange-600 transition-colors">
                            {comp.subject || comp.title}
                          </h4>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                            comp.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                            comp.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {comp.status === 'Resolved' && <CheckCircle size={12} />}
                            {comp.status || 'Pending'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">
                          {comp.description}
                        </p>

                        {/* Admin Response (If available) */}
                        {comp.adminResponse && (
                          <div className="mt-3 p-3 bg-white border border-green-100 rounded-lg text-sm">
                            <span className="font-bold text-green-700 text-xs block mb-1">Admin Response:</span>
                            <span className="text-slate-700">{comp.adminResponse}</span>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center text-xs text-slate-400 font-medium">
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