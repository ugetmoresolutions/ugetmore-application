"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Shield,
  Key,
  ArrowLeft
} from 'lucide-react';
import { decodeAccessToken } from '@/endpoints/lib/ecryptUser';
import { IUpdatePassword } from '@/interfaces/user/user';
import { AUTH_API } from '@/endpoints/rest-api/auth';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordProps {
  setCurrentView: (value: 'edit' | 'overview' | 'changePassword') => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ setCurrentView }) => {
  const [formData, setFormData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<Partial<PasswordData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PasswordData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 1) return { strength, label: 'Very Weak', color: 'bg-red-500' };
    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-400' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-[#155670]' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordData> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      const loggedInUser = decodeAccessToken();
      if (!loggedInUser) {
        setUpdateError('Session expired. Please login again.');
        return;
      }

      const data: IUpdatePassword = {
        userId: loggedInUser.id,
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const response = await AUTH_API.UPDATE_PASSWORD(data);
      
      if (response?.data?.id) {
        setUpdateSuccess('Password updated successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTouched({});
        
        setTimeout(() => {
          setCurrentView('edit');
        }, 2000);
      } else {
        setUpdateError(response?.data.message || 'Current password is incorrect');
      }
    } catch (error: any) {
      console.error('Password update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: keyof PasswordData) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleChange = (field: keyof PasswordData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    
    if (updateError) {
      setUpdateError('');
    }
    
    if (updateSuccess) {
      setUpdateSuccess('');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.newPassword.length >= 8 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { label: 'Contains number', met: /\d/.test(formData.newPassword) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-2 xs:px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl space-y-4 sm:space-y-6 lg:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 bg-gradient-to-br from-[#155670] to-[#0d3d47] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
            <Key className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Change Password</h1>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600">Update your account password for better security</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#155670] to-[#0d3d47] px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentView("edit")}
                  className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base font-semibold">Security Update</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 xs:p-4 sm:p-6 space-y-4 sm:space-y-6">
            {updateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center text-xs xs:text-sm text-green-600"
              >
                <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-2 flex-shrink-0" />
                {updateSuccess}
              </motion.div>
            )}

            {updateError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center text-xs xs:text-sm text-red-600"
              >
                <AlertCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-2 flex-shrink-0" />
                {updateError}
              </motion.div>
            )}

            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  onBlur={() => handleBlur('currentPassword')}
                  className={`w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.currentPassword && touched.currentPassword
                      ? 'border-red-300 bg-red-50'
                      : formData.currentPassword && !errors.currentPassword
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {errors.currentPassword && touched.currentPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 sm:mt-2 flex items-center text-xs xs:text-sm text-red-600"
                >
                  <AlertCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
                  {errors.currentPassword}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  className={`w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.newPassword && touched.newPassword
                      ? 'border-red-300 bg-red-50'
                      : formData.newPassword && !errors.newPassword
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              {formData.newPassword && (
                <div className="mt-2 sm:mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 sm:mb-2">
                    <span>Password strength</span>
                    <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-[#155670]' : 'text-gray-500'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {formData.newPassword && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <h4 className="text-xs xs:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Password Requirements:</h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs xs:text-sm">
                        {req.met ? (
                          <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 xs:w-4 xs:h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.newPassword && touched.newPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 sm:mt-2 flex items-center text-xs xs:text-sm text-red-600"
                >
                  <AlertCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
                  {errors.newPassword}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : formData.confirmPassword && !errors.confirmPassword
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 sm:mt-2 flex items-center text-xs xs:text-sm text-red-600"
                >
                  <AlertCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
                  {errors.confirmPassword}
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                  <span className="text-sm sm:text-base">Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Update Password</span>
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1 bg-blue-600 rounded-full">
              <Shield className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">Security Tips</h4>
              <ul className="text-xs xs:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
                <li>• Use a unique password you haven't used before</li>
                <li>• Consider using a password manager</li>
                <li className="hidden xs:block">• Enable two-factor authentication for extra security</li>
                <li className="xs:hidden">• Enable 2FA for extra security</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePassword;