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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center flex flex-col items-center">
            
            {/* Caller Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <User size={32} className="sm:w-10 sm:h-10" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-slate-800">
              Incoming Call
            </h3>
            
            <p className="text-slate-500 font-medium mt-1 mb-6 sm:mb-8 text-sm sm:text-base break-words line-clamp-2 px-2">
              <span className="font-bold text-slate-700">{callerName}</span> is calling you...
            </p>

            {/* Accept / Reject Buttons */}
            <div className="flex gap-4 sm:gap-6 justify-center w-full">
              <button
                onClick={onReject}
                className="bg-red-500 text-white p-3.5 sm:p-4 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center flex-1 max-w-[80px]"
                aria-label="Reject Call"
              >
                <PhoneOff size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <button
                onClick={onAccept}
                className="bg-green-500 text-white p-3.5 sm:p-4 rounded-full hover:bg-green-600 active:scale-95 transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center flex-1 max-w-[80px] animate-pulse"
                aria-label="Accept Call"
              >
                <Phone size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;