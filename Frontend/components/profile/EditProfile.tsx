// components/profile/EditProfile.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Lock,
  Camera,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  X,
  Building2,
  FileText,
  Users
} from 'lucide-react';
import { AUTH_API } from '@/endpoints/rest-api/auth';
import { decodeAccessToken } from '@/endpoints/lib/ecryptUser';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  address: string;
  isDefault: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  addresses: Address[];
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
}

interface EditProfileData {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
}

interface EditProfileProps {
  setCurrentView:(value : 'edit' | 'overview' | 'changePassword') => void;
  onChangePassword: () => void;
}

// Success Modal Component
const SuccessModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Updated!</h3>
            <p className="text-gray-600 mb-4">Your profile has been successfully updated.</p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 mt-3">Redirecting back...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditProfile: React.FC<EditProfileProps> = ({ onChangePassword , setCurrentView}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<EditProfileData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: '',
    vatNumber: ''
  });

  const [errors, setErrors] = useState<Partial<EditProfileData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EditProfileData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Get user role from token
  const decodedUser = decodeAccessToken();
  const isBusiness = decodedUser?.role === 'business';

  useEffect(() => {
    const fetchUserData = async () => {
      const decodedUserData = decodeAccessToken();

      if (decodedUserData) {
        const userKey = `user_${decodedUserData.id}`;
        const cachedUser = localStorage.getItem(userKey);

        if (cachedUser) {
          console.log("Using cached user data for edit profile");
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setFormData({
            fullName: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.addresses.find((addr: any) => addr.isDefault)?.address || '',
            businessName: userData.businessName || '',
            businessType: userData.businessType || '',
            vatNumber: userData.vatNumber || ''
          });
          setIsLoading(false);
          return;
        }

        try {
          console.log("Fetching fresh user data from API for edit profile");
          const userResponse = await AUTH_API.GET_USER(decodedUserData.id);

          if (userResponse?.data) {
            const userData: UserData = {
              id: userResponse.data.id ? userResponse.data.id.toString() : "",
              name: userResponse.data.fullName,
              email: userResponse.data.email,
              phone: userResponse.data.phone,
              role: userResponse.data.role,
              avatar: userResponse.data.fullName.split(' ').map(n => n[0]).join(''),
              addresses: userResponse.data.address ? [
                {
                  id: '1',
                  address: userResponse.data.address,
                  isDefault: true
                }
              ] : [],
              businessName: userResponse.data.businessName,
              businessType: userResponse.data.businessType,
              vatNumber: userResponse.data.vatNumber
            };

            setUser(userData);
            setFormData({
              fullName: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.addresses.find(addr => addr.isDefault)?.address || '',
              businessName: userData.businessName || '',
              businessType: userData.businessType || '',
              vatNumber: userData.vatNumber || ''
            });

            localStorage.setItem(userKey, JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUpdateError('Failed to load user data. Please refresh the page.');
        }
      }

      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProfileData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+27\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number must start with +27 followed by 9 digits';
    }

    // Business-specific validations
    if (isBusiness) {
      if (!formData.businessName?.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      
      if (!formData.businessType?.trim()) {
        newErrors.businessType = 'Business type is required';
      }
      
      if (!formData.vatNumber?.trim()) {
        newErrors.vatNumber = 'VAT number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setUpdateError('');

    try {
      const decodedUser = decodeAccessToken();
      if (!decodedUser) {
        setUpdateError('Session expired. Please login again.');
        return;
      }

      const updateData: any = {
        id: decodedUser.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined
      };

      // Add business-specific fields if user is a business
      if (isBusiness) {
        updateData.businessName = formData.businessName;
        updateData.businessType = formData.businessType;
        updateData.vatNumber = formData.vatNumber;
      }

      const response = await AUTH_API.UPDATE_USER(updateData);

      if (!response?.data) {
        setUpdateError(response.message || 'Failed to update profile');
        return;
      }

      const updatedUserResponse = await AUTH_API.GET_USER(decodedUser.id);

      if (updatedUserResponse?.data) {
        const userData: UserData = {
          id: updatedUserResponse.data.id ? updatedUserResponse.data.id.toString() : "",
          name: updatedUserResponse.data.fullName,
          email: updatedUserResponse.data.email,
          phone: updatedUserResponse.data.phone,
          role: updatedUserResponse.data.role,
          avatar: updatedUserResponse.data.fullName.split(' ').map(n => n[0]).join(''),
          addresses: updatedUserResponse.data.address ? [
            {
              id: '1',
              address: updatedUserResponse.data.address,
              isDefault: true
            }
          ] : [],
          businessName: updatedUserResponse.data.businessName,
          businessType: updatedUserResponse.data.businessType,
          vatNumber: updatedUserResponse.data.vatNumber
        };

        setUser(userData);
        setFormData({
          fullName: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.addresses.find(addr => addr.isDefault)?.address || '',
          businessName: userData.businessName || '',
          businessType: userData.businessType || '',
          vatNumber: userData.vatNumber || ''
        });

        const userKey = `user_${decodedUser.id}`;
        localStorage.setItem(userKey, JSON.stringify(userData));
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Redirect back after modal closes
        setTimeout(() => {
          setCurrentView('overview');
        }, 2000);
      }

    } catch (error) {
      console.error('Update failed:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (field: keyof EditProfileData) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleChange = (field: keyof EditProfileData, value: string) => {
    if (field === 'phone') {
      let formattedPhone = value.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      if (formattedPhone.length <= 9) {
        formattedPhone = '+27' + formattedPhone;
      }
      setFormData({ ...formData, [field]: formattedPhone });
    } else {
      setFormData({ ...formData, [field]: value });
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    if (updateError) {
      setUpdateError('');
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#155670] border-t-transparent"></div>
              <span className="font-medium text-gray-900">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          setCurrentView('overview');
        }} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${isBusiness ? 'from-slate-900 to-slate-800' : 'from-[#155670] to-[#0d3d47]'} px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={() => setCurrentView("overview")}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Edit Profile</h1>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Update your account information</p>
              </div>
            </div>
           
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-5 lg:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative">
              <div className={`w-20 h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24 bg-gradient-to-br ${isBusiness ? 'from-slate-900 to-slate-800' : 'from-[#155670] to-[#0d3d47]'} rounded-full flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg`}>
                {isBusiness ? <Building2 className="w-8 h-8" /> : user.avatar}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${isBusiness ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#155670] hover:bg-[#0d3d47]'} text-white rounded-full flex items-center justify-center shadow-md transition-colors duration-200`}
              >
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              </motion.button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{isBusiness ? user.businessName : user.name}</h3>
              <p className="text-sm sm:text-base text-gray-600">Click the camera icon to update your profile picture</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
          {updateError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center text-xs sm:text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {updateError}
            </motion.div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.fullName && touched.fullName
                        ? 'border-red-300 bg-red-50'
                        : formData.fullName && !errors.fullName
                          ? 'border-[#155670] bg-[#155670]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {formData.fullName && !errors.fullName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.fullName && touched.fullName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                    >
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {errors.fullName}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.email && touched.email
                        ? 'border-red-300 bg-red-50'
                        : formData.email && !errors.email
                          ? 'border-[#155670] bg-[#155670]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {formData.email && !errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.email && touched.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                    >
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {errors.email}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pr-1 flex items-center pointer-events-none border-r border-gray-300">
                    <span className="text-gray-500 text-xs sm:text-sm">+27</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone?.replace('+27', '') || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-12 sm:pl-16 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.phone && touched.phone
                      ? 'border-red-300 bg-red-50'
                      : formData.phone && !errors.phone
                        ? 'border-[#155670] bg-[#155670]/5'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    placeholder="123456789 (without 0)"
                    required
                  />
                  {formData.phone && !errors.phone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                    </div>
                  )}
                </div>
                {errors.phone && touched.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                  >
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {errors.phone}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Business Information Section */}
            {isBusiness && (
              <div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#155670]" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Business Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.businessName || ''}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        onBlur={() => handleBlur('businessName')}
                        className={`w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.businessName && touched.businessName
                          ? 'border-red-300 bg-red-50'
                          : formData.businessName && !errors.businessName
                            ? 'border-[#155670] bg-[#155670]/5'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        placeholder="Enter your business name"
                        required
                      />
                      {formData.businessName && !errors.businessName && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                        </div>
                      )}
                    </div>
                    {errors.businessName && touched.businessName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                      >
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {errors.businessName}
                      </motion.div>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Business Type
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.businessType || ''}
                        onChange={(e) => handleChange('businessType', e.target.value)}
                        onBlur={() => handleBlur('businessType')}
                        className={`w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.businessType && touched.businessType
                          ? 'border-red-300 bg-red-50'
                          : formData.businessType && !errors.businessType
                            ? 'border-[#155670] bg-[#155670]/5'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        required
                      >
                        <option value="">Select business type</option>
                        <option value="sole-proprietorship">Sole Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="corporation">Corporation</option>
                        <option value="llc">LLC</option>
                        <option value="non-profit">Non-Profit</option>
                      </select>
                      {formData.businessType && !errors.businessType && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                        </div>
                      )}
                    </div>
                    {errors.businessType && touched.businessType && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                      >
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {errors.businessType}
                      </motion.div>
                    )}
                  </div> */}
                </div>

                <div className="mt-4 sm:mt-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    VAT Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.vatNumber || ''}
                      onChange={(e) => handleChange('vatNumber', e.target.value)}
                      onBlur={() => handleBlur('vatNumber')}
                      className={`w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${errors.vatNumber && touched.vatNumber
                        ? 'border-red-300 bg-red-50'
                        : formData.vatNumber && !errors.vatNumber
                          ? 'border-[#155670] bg-[#155670]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      placeholder="Enter your VAT number"
                      required
                    />
                    {formData.vatNumber && !errors.vatNumber && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.vatNumber && touched.vatNumber && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-xs sm:text-sm text-red-600"
                    >
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {errors.vatNumber}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#155670]" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Address</h3>
              </div>

              <div>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Enter your complete address (optional)"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <motion.button
              type="submit"
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r ${isBusiness ? 'from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-900' : 'from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670]'} disabled:bg-gray-400 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md text-sm sm:text-base`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  <span className="hidden xs:inline">Saving Changes...</span>
                  <span className="xs:hidden">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Save Changes</span>
                  <span className="xs:hidden">Save</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setCurrentView("changePassword")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Change Password</span>
              <span className="xs:hidden">Password</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1 bg-blue-600 rounded-full flex-shrink-0">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Secure Profile Updates</h4>
            <p className="text-xs sm:text-sm text-blue-800">
              Your information is encrypted and securely stored. Email changes may require verification.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;