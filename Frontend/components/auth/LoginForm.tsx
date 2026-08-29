"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ShoppingCart, Info, MailCheck, Shield } from 'lucide-react';
import Cookies from 'universal-cookie';
import { AUTH_API } from '@/endpoints/rest-api/auth';
import { IDecodedJWT, IUserLogin, UserRole } from '@/interfaces/user/user';
import { jwtDecode } from 'jwt-decode';
import { encryptToken } from '@/endpoints/lib/ecryptUser';
import { CartSyncService } from '@/utils/cartSync';

interface LoginFormProps {
  onLogin?: (data: IUserLogin) => void;
  onNavigateToSignUp?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onNavigateToSignUp }) => {
  const [formData, setFormData] = useState<IUserLogin>({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [errors, setErrors] = useState<Partial<IUserLogin>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof IUserLogin, boolean>>>({});
  const [loginError, setLoginError] = useState("");
  const [cartSyncStatus, setCartSyncStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    itemCount: number;
  }>({ show: false, success: false, message: '', itemCount: 0 });

  // NEW: State for email verification
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const router = useRouter();
  const cookies = new Cookies();

  // Check if user has items in localStorage cart
  const hasLocalCartItems = CartSyncService.hasLocalCartItems();
  const localCartCount = CartSyncService.getLocalCartCount();

  const validateForm = (): boolean => {
    const newErrors: Partial<IUserLogin> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const syncCartAfterLogin = async (userId: number) => {
    if (!hasLocalCartItems) return;

    setIsSyncingCart(true);
    setCartSyncStatus({ show: true, success: false, message: 'Syncing your cart items...', itemCount: 0 });

    try {
      const syncResult = await CartSyncService.syncLocalCartToUserAccount(userId);
      
      setCartSyncStatus({
        show: true,
        success: syncResult.success,
        message: syncResult.message,
        itemCount: syncResult.mergedItemsCount
      });

      // Auto-hide success message after 5 seconds
      if (syncResult.success) {
        setTimeout(() => {
          setCartSyncStatus(prev => ({ ...prev, show: false }));
        }, 5000);
      }

    } catch (error) {
      console.error('Cart sync failed:', error);
      setCartSyncStatus({
        show: true,
        success: false,
        message: 'Failed to sync cart items. Your items are still saved locally.',
        itemCount: 0
      });
    } finally {
      setIsSyncingCart(false);
    }
  };

  // NEW: Function to send verification email
  const sendVerificationEmail = async (email: string) => {
    setIsSendingVerification(true);
    setVerificationSent(false);
    
    try {
      await AUTH_API.RESEND_VERIFICATION_EMAIL(email);
      setVerificationSent(true);
      setLoginError('');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setVerificationSent(false);
      }, 5000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to send verification email. Please try again.";
      setLoginError(errorMessage);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError('');
    setShowVerificationPrompt(false);
    setVerificationSent(false);
    setCartSyncStatus({ show: false, success: false, message: '', itemCount: 0 });

    try {
      const authResponse = await AUTH_API.LOGIN(formData);

      if (!authResponse?.data?.accessToken) {
        const errorMessage = authResponse?.data.message || "Internal server error. Please try again later.";
        setLoginError(errorMessage);
        return;
      }

      // Clear existing cookies
      cookies.remove("userToken", {
        path: '/',
        secure: true,
        sameSite: 'lax'
      });

      // Encrypt and store new token
      encryptToken(authResponse.data);

      const decodedUserData = jwtDecode<IDecodedJWT>(authResponse.data.accessToken);
      
      if (onLogin) {
        onLogin(formData);
      }

      console.log("User Data", decodedUserData);

      // Sync cart after successful login
      if (decodedUserData.id) {
        await syncCartAfterLogin(decodedUserData.id);
      }

      // Determine redirect path
      let redirectPath: string = "/client/cart";
      if (decodedUserData.role === UserRole.Customer) {
        redirectPath = "/client/cart";
      } else if (decodedUserData.role === UserRole.Business) {
        redirectPath = "/client/cart";
      } else {
        redirectPath = "/admin/dashboard";
      }

      // Delay redirect if cart is syncing to show user the sync status
      const redirectDelay = isSyncingCart ? 2000 : 0;
      setTimeout(() => {
        router.replace(redirectPath);
      }, redirectDelay);

    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Check if error is due to unverified email
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials and try again.";
      
      if (errorMessage.includes('verify your email') || errorMessage.includes('email not verified') || errorMessage.includes('Please verify your email')) {
        // Store the email that needs verification
        setUnverifiedEmail(formData.email);
        setShowVerificationPrompt(true);
        
        // Automatically send verification email
        await sendVerificationEmail(formData.email);
        
        setLoginError('Please verify your email before logging in. We have sent a new verification link to your email.');
      } else {
        setLoginError(errorMessage);
        setErrors({ email: 'Invalid credentials. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: keyof IUserLogin) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleChange = (field: keyof IUserLogin, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    if (loginError) {
      setLoginError('');
    }

    // Reset verification prompt if user changes email
    if (field === 'email' && showVerificationPrompt) {
      setShowVerificationPrompt(false);
      setVerificationSent(false);
    }
  };

  const handleManualResendVerification = async () => {
    if (!unverifiedEmail) return;
    await sendVerificationEmail(unverifiedEmail);
  };

  const handleCloseVerificationPrompt = () => {
    setShowVerificationPrompt(false);
    setVerificationSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center  ">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#155670] to-[#0d3d47] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Login Error */}
            {loginError && !showVerificationPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {loginError}
              </motion.div>
            )}

            {/* Email Verification Prompt */}
            {showVerificationPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
              >
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                      Email Verification Required
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Please verify your email address before logging in. We've sent a new verification link to:
                    </p>
                    <p className="text-sm font-medium text-yellow-800 mb-4 bg-yellow-100 px-3 py-2 rounded-lg">
                      {unverifiedEmail}
                    </p>
                    
                    {verificationSent ? (
                      <div className="flex items-center text-sm text-green-600 mb-3">
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        Verification email sent successfully! Check your inbox.
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-yellow-600 mb-3">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        {isSendingVerification ? 'Sending verification email...' : 'Sending verification email...'}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleManualResendVerification}
                        disabled={isSendingVerification || verificationSent}
                        className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingVerification ? 'Sending...' : 'Resend Email'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseVerificationPrompt}
                        className="text-sm text-yellow-700 hover:text-yellow-800 underline"
                      >
                        Try Different Email
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cart Sync Status */}
            {/* {cartSyncStatus.show && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 flex items-center text-sm ${
                  cartSyncStatus.success 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}
              >
                <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
                {cartSyncStatus.message}
                {cartSyncStatus.itemCount > 0 && (
                  <span className="ml-1 font-semibold">({cartSyncStatus.itemCount} items)</span>
                )}
              </motion.div>
            )} */}

            {/* Email Field */}
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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  disabled={isLoading || isSyncingCart}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    isLoading || isSyncingCart ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.email && touched.email
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

            {/* Password Field */}
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading || isSyncingCart}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${
                    isLoading || isSyncingCart ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.password && touched.password
                    ? 'border-red-300 bg-red-50'
                    : formData.password && !errors.password
                      ? 'border-[#155670] bg-[#155670]/5'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSyncingCart}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  disabled={isLoading || isSyncingCart}
                  className="h-4 w-4 text-[#155670] focus:ring-[#155670] border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => router.push("/client/auth/reset-password")}
                disabled={isLoading || isSyncingCart}
                className="text-sm cursor-pointer text-[#155670] hover:text-[#0d3d47] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isSyncingCart}
              whileHover={{ scale: isLoading || isSyncingCart ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || isSyncingCart ? 1 : 0.98 }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading || isSyncingCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </div>
              ) : isSyncingCart ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Syncing cart...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center"
        >
          <span className="text-gray-600">Don't have an account? </span>
          <button
            onClick={() => {
              if (onNavigateToSignUp) {
                onNavigateToSignUp();
              } else {
                router.push("/client/auth/signup");
              }
            }}
            disabled={isLoading || isSyncingCart}
            className="text-[#155670] cursor-pointer hover:text-[#0d3d47] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Sign up here
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center text-xs text-gray-500 space-y-2"
        >
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;