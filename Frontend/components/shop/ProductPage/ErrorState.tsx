// components/ErrorState.tsx
import React from 'react';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const isProductNotFound = error.toLowerCase().includes('not found');

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {isProductNotFound ? 'Product Not Found' : 'Error Loading Product'}
      </h1>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="space-x-4">
        {!isProductNotFound && (
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
        <button 
          onClick={handleGoBack}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorState;