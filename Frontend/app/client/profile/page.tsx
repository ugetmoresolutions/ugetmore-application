"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';
import EditProfile from '@/components/profile/EditProfile';
import ChangePassword from '@/components/profile/ChangePassword';
import ProfilePage from '@/components/profile/Profile';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' :
    type === 'error' ? 'bg-red-50 border-red-200' :
      'bg-blue-50 border-blue-200';

  const textColor = type === 'success' ? 'text-green-800' :
    type === 'error' ? 'text-red-800' :
      'text-blue-800';

  const iconColor = type === 'success' ? 'text-green-600' :
    type === 'error' ? 'text-red-600' :
      'text-blue-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border ${bgColor} shadow-lg max-w-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {type === 'success' && <Check className={`w-5 h-5 ${iconColor}`} />}
          {type === 'error' && <X className={`w-5 h-5 ${iconColor}`} />}
          <span className={`font-medium ${textColor}`}>{message}</span>
        </div>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity duration-200`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

function page() {

  const [currentView, setCurrentView] = useState<'edit' | 'overview' | 'changePassword'>('overview');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };



  const handleChangePassword = () => {

  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-xs sm:max-w-sm mx-4">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#155670] border-t-transparent"></div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Saving Changes</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Please wait while we update your profile...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}


          {/* Content based on current view */}
          <AnimatePresence mode="wait">
            {currentView === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <EditProfile
                  onChangePassword={handleChangePassword}
                  setCurrentView={setCurrentView}
                />
              </motion.div>
            )}

            {currentView === 'overview' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <ProfilePage
                  setCurrentView={setCurrentView}
                />
              </motion.div>
            )}
            {currentView === 'changePassword' && (
              <motion.div
                key="changePassword"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto"
              >
                <ChangePassword 
                 setCurrentView={setCurrentView}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 sm:mt-10 md:mt-12 text-center text-xs sm:text-sm text-gray-500 px-2"
          >
            <p>🔒 All data is securely encrypted and stored</p>
            <p className="mt-1">Mock Environment - Last updated: {new Date().toLocaleString()}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default page;
