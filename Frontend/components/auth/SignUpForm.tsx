"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, User, Phone, UserPlus, Building2, Shield, MailCheck } from 'lucide-react';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { AUTH_API } from '@/endpoints/rest-api/auth';
import { IAdminUser, IDecodedJWT, IUser, IUserSignUp, UserRole } from '@/interfaces/user/user';

interface SignUpFormProps {
  onSignUp?: (data: IUserSignUp) => void;
  onNavigateToLogin?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [formData, setFormData] = useState<IUserSignUp>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.Customer,
    address: '',
    businessName: '',
    businessType: '',
    vatNumber: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<IUser & { confirmPassword: string }>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof (IUser & { confirmPassword: string }), boolean>>>({});
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState('');
  
  const router = useRouter();
  const cookies = new Cookies();

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: accountType === 'business' ? UserRole.Business : UserRole.Customer
    }));
  }, [accountType]);

  const validateForm = (): boolean => {
    const newErrors: Partial<IUser & { confirmPassword: string }> = {};
    
    // Enhanced South African phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone.replace(/\s/g, '');
      // South African phone number patterns
      const saPhonePatterns = [
        /^\+27\d{9}$/, // +27 followed by 9 digits
        /^0\d{9}$/, // 0 followed by 9 digits
        /^27\d{9}$/ // 27 followed by 9 digits
      ];
      
      const isValidPhone = saPhonePatterns.some(pattern => pattern.test(cleanedPhone));
      if (!isValidPhone) {
        newErrors.phone = 'Please enter a valid South African phone number (e.g., +27 12 345 6789 or 012 345 6789)';
      }
    }
    
    // Enhanced email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Enhanced password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        newErrors.password = 'Password must contain uppercase, lowercase letters and numbers';
      }
    }
    
    // Enhanced business validation for South Africa
    if (accountType === 'business') {
      if (!formData.businessName?.trim()) {
        newErrors.businessName = 'Business name is required';
      } else if (formData.businessName.trim().length < 2) {
        newErrors.businessName = 'Business name must be at least 2 characters';
      }
      
      if (!formData.vatNumber?.trim()) {
        newErrors.vatNumber = 'VAT number is required for South African businesses';
      } else {
        // Basic VAT number validation for South Africa (10 digits starting with 4)
        const vatRegex = /^4\d{9}$/;
        const cleanedVat = formData.vatNumber.replace(/\s/g, '');
        if (!vatRegex.test(cleanedVat)) {
          newErrors.vatNumber = 'Please enter a valid South African VAT number (10 digits starting with 4)';
        }
      }
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setSignUpError('');
    setSignUpSuccess(false);
    
    try {
      const authResponse = await AUTH_API.SIGNUP(formData);

      if (!authResponse?.data?.accessToken) {
        const errorMessage = authResponse?.message || "Internal server error. Please try again later.";
        setSignUpError(errorMessage);
        return;
      }

      // Store user email for verification message
      setCreatedUserEmail(formData.email);
      setSignUpSuccess(true);

      // Show success message instead of immediate redirect
      if (onSignUp) {
        onSignUp(formData);
      }

    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please check your information and try again.";
      setSignUpError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!createdUserEmail) return;
    
    setIsLoading(true);
    try {
      await AUTH_API.RESEND_VERIFICATION_EMAIL(createdUserEmail);
      setSignUpError('');
      // You can show a success toast here
      console.log('Verification email resent successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to resend verification email. Please try again.";
      setSignUpError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      router.push("/client/auth/login");
    }
  };

  const handleBlur = (field: keyof (IUser & { confirmPassword: string })) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleChange = (field: keyof IUser, value: string) => {
    if (field === 'phone') {
      // Auto-format phone number
      let formattedPhone = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1); // Remove leading 0
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
    
    if (signUpError) {
      setSignUpError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: undefined });
    }
    
    if (signUpError) {
      setSignUpError('');
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-[#155670]' };
    return { strength, label: 'Strong', color: 'bg-[#155670]' };
  };

  const passwordStrength = getPasswordStrength(formData.password || '');


  // Success screen after signup
  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
          >
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <MailCheck className="h-10 w-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Your Email
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{createdUserEmail}</strong>. 
              Please check your email and click the link to verify your account before logging in.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#155670] text-white rounded-xl font-semibold hover:bg-[#0d3d47] transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={handleNavigateToLogin}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700 text-left">
                  <strong>Note:</strong> You must verify your email before you can log in to your account. 
                  This helps us ensure the security of your account.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#155670] to-[#0d3d47] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started with your account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <div className="mb-6">
            <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  accountType === 'personal'
                    ? 'bg-white text-[#155670] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Personal Account
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  accountType === 'business'
                    ? 'bg-white text-[#155670] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Business Account
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {signUpError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {signUpError}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {accountType === 'business' ? 'Contact Person Name' : 'Full Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full pl-10 pr-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.fullName && touched.fullName
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
                    <CheckCircle className="h-5 w-5 text-[#155670]" />
                  </div>
                )}
              </div>
              {errors.fullName && touched.fullName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName}
                </motion.div>
              )}
            </div>

            {accountType === 'business' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      onBlur={() => handleBlur('businessName')}
                      className={`w-full pl-10 pr-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                        errors.businessName && touched.businessName
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
                        <CheckCircle className="h-5 w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.businessName && touched.businessName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.businessName}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.businessType || ''}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      onBlur={() => handleBlur('businessType')}
                      className={`w-full px-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                        errors.businessType && touched.businessType
                          ? 'border-red-300 bg-red-50'
                          : formData.businessType && !errors.businessType
                          ? 'border-[#155670] bg-[#155670]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="sole_proprietor">Sole Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="pty_ltd">Private Company (Pty Ltd)</option>
                      <option value="cc">Close Corporation (CC)</option>
                      <option value="trust">Trust</option>
                      <option value="npo">Non-Profit Organization</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.businessType && !errors.businessType && (
                      <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.businessType && touched.businessType && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.businessType}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                   VAT Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.vatNumber || ''}
                      onChange={(e) => handleChange('vatNumber', e.target.value)}
                      onBlur={() => handleBlur('vatNumber')}
                      className={`w-full px-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                        errors.vatNumber && touched.vatNumber
                          ? 'border-red-300 bg-red-50'
                          : formData.vatNumber && !errors.vatNumber
                          ? 'border-[#155670] bg-[#155670]/5'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="Enter vat number"
                      required
                    />
                    {formData.vatNumber && !errors.vatNumber && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="h-5 w-5 text-[#155670]" />
                      </div>
                    )}
                  </div>
                  {errors.vatNumber && touched.vatNumber && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.vatNumber}
                    </motion.div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-10 pr-4 py-3 border text-gray-700  rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.email && touched.email
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
                    <CheckCircle className="h-5 w-5 text-[#155670]" />
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pr-1 flex items-center pointer-events-none border-r border-gray-300">
                  <span className="text-gray-500 text-sm">+27</span>
                </div>
                <input
                  type="tel"
                  value={formData.phone?.replace('+27', '') || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full pl-16 pr-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.phone && touched.phone
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
                    <CheckCircle className="h-5 w-5 text-[#155670]" />
                  </div>
                )}
              </div>
              {errors.phone && touched.phone && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-12 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.password && touched.password
                      ? 'border-red-300 bg-red-50'
                      : formData.password && !errors.password
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Password strength</span>
                    <span className={`font-medium ${passwordStrength.strength >= 4 ? 'text-[#155670]' : 'text-gray-500'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && touched.password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full pl-10 pr-12 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : confirmPassword && !errors.confirmPassword
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </motion.div>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-[#155670] focus:ring-[#155670] border-gray-300 rounded mt-1"
                required
              />
              <label className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <a href="/terms-and-conditions?section=terms-of-service">
                  <button type="button" className="text-[#155670] hover:text-[#0d3d47] font-medium">
                    Terms of Service
                  </button>
                </a>{' '}
                and{' '}
                <a href="/terms-and-conditions?section=privacy-policy">
                  <button type="button" className="text-[#155670] hover:text-[#0d3d47] font-medium">
                    Privacy Policy
                  </button>
                </a>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center"
        >
          <span className="text-gray-600">Already have an account? </span>
          <button
            onClick={() => {
              if (onNavigateToLogin) {
                onNavigateToLogin();
              } else {
                router.push("/client/auth/login");
              }
            }}
            className="text-[#155670] cursor-pointer hover:text-[#0d3d47] font-semibold transition-colors duration-200"
          >
            Sign in here
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center text-xs text-gray-500"
        >
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpForm;