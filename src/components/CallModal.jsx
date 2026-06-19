import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';

const CallModal = ({ isOpen, callerName, onAccept, onReject }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            {/* കോൾ ചെയ്യുന്ന ആളുടെ ഐക്കൺ */}
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} />
            </div>
            
            <h3 className="text-xl font-black text-slate-800">Incoming Call</h3>
            <p className="text-slate-500 font-bold mt-1 mb-8">{callerName} is calling you...</p>

            {/* Accept / Reject ബട്ടണുകൾ */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onReject}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-all shadow-lg"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={onAccept}
                className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-all shadow-lg"
              >
                <Phone size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;