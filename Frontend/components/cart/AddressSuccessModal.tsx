"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddressSuccessModalProps {
  show: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const AddressSuccessModal: React.FC<AddressSuccessModalProps> = ({
  show,
  onClose,
  onProceed
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-opacity-70"
        >
          {/* Background particles/effects */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-64 h-64 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full blur-3xl opacity-30"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 1.1, 
              y: -50,
              rotate: 3,
              transition: {
                duration: 0.6,
                ease: "easeInOut"
              }
            }}
            transition={{ 
              duration: 0.5,
              type: "spring",
              damping: 15,
              stiffness: 100
            }}
            className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden border border-slate-700/50"
          >
            {/* Animated background elements */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full opacity-20"
            ></motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-full opacity-10"
            ></motion.div>

            {/* Modal Content */}
            <div className="relative p-8 text-center">
              {/* Success Icon with floating animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -10, 0],
                }}
                exit={{ 
                  scale: 0, 
                  rotate: 180,
                  transition: { duration: 0.4 }
                }}
                transition={{ 
                  scale: { duration: 0.5, type: "spring", stiffness: 200 },
                  rotate: { duration: 0.6, ease: "easeOut" },
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-800"
              >
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="w-14 h-14 text-slate-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M5 13l4 4L19 7" 
                  />
                </motion.svg>
              </motion.div>

              {/* Success Message */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-3xl font-bold text-slate-200 mb-4"
              >
                Success!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-slate-400 mb-8 text-lg leading-relaxed"
              >
                Your shipping address has been saved successfully. Ready to proceed with your order?
              </motion.p>

              {/* Confetti particles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: Math.random() * 100 - 50,
                      y: Math.random() * 100 - 50
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      delay: i * 0.1,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className={`absolute w-2 h-2 rounded-full ${
                      i % 3 === 0 ? 'bg-slate-400' : 
                      i % 3 === 1 ? 'bg-slate-500' : 'bg-slate-600'
                    }`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  />
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-4 whitespace-nowrap border-2 border-slate-600 text-slate-300 rounded-xl hover:border-slate-500 hover:bg-slate-700 transition-all duration-200 font-semibold shadow-sm"
                >
                  Add Another
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onProceed}
                  className="px-8 py-4 whitespace-nowrap bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:shadow-2xl transition-all duration-200 font-semibold shadow-lg"
                >
                  Proceed to Confirm
                </motion.button>
              </motion.div>
            </div>

            {/* Animated border */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600"
            />

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressSuccessModal;