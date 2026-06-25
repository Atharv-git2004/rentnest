import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../services/api'; // നമ്മൾ അപ്ഡേറ്റ് ചെയ്ത apiRequest സർവീസ്

const ComplaintModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return toast.error('Please fill in all fields.');
    }

    setLoading(true);
    try {
      // 🚀 ബാക്ക്-എൻഡിലെ റൂട്ടിലേക്ക് ഡാറ്റ പോസ്റ്റ് ചെയ്യുന്നു
      const response = await apiRequest('/complaints', {
        method: 'POST',
        body: { title, description }
      });

      const resData = await response.json();

      if (response.ok || resData.success) {
        toast.success('Your complaint has been submitted successfully.');
        setTitle('');
        setDescription('');
        onClose(); // സബ്മിറ്റ് ആയിക്കഴിഞ്ഞാൽ വിൻഡോ തനിയെ അടയും
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Shadow Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10 border border-slate-100"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Submit a Complaint</h3>
                <p className="text-xs text-slate-500">Let us know what issue you are facing.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject / Title
                </label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Water leakage, Network issue"
                  className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-slate-800"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail so our admin team can assist you better..."
                  rows={4}
                  className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all text-slate-800 resize-none"
                  maxLength={1000}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <Send size={14} /> <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComplaintModal;