// components/auth/SignUpOptions.tsx
"use client"
import React from 'react';
import { motion } from 'framer-motion';

interface SignUpOptionsProps {
  onSelectOption: (option: string) => void;
  onNavigateToLogin: () => void;
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

const SignUpOptions: React.FC<SignUpOptionsProps> = ({ onSelectOption, onNavigateToLogin }) => {
  return (
    <motion.div
      key="signupOptions"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition as any}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
        <p className="text-gray-600">Select an option</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => onSelectOption('b2b')}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Business-to-Business
        </button>
        <button
          onClick={() => onSelectOption('b2c')}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Business-to-Consumer
        </button>
      </div>
      
      <div className="text-center mt-6">
        <span className="text-gray-600">Have an account? </span>
        <button
          onClick={onNavigateToLogin}
          className="text-blue-600 hover:underline"
        >
          Login
        </button>
      </div>
    </motion.div>
  );
};

export default SignUpOptions;