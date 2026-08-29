import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onGoBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onGoBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <X className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Cart</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 mr-4"
        >
          Try Again
        </button>
        <button
          onClick={onGoBack}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default ErrorState;