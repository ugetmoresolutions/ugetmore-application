"use client"
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  Shield,
  Clock
} from 'lucide-react';
import { AUTH_API } from '@/endpoints/rest-api/auth';
import { useRouter } from 'next/navigation';

interface ResetPasswordProps {
  onComplete?: () => void;
  onNavigateToLogin?: () => void;
}

enum ResetStep {
  EMAIL = 'email',
  OTP = 'otp',
  PASSWORD = 'password'
}

const ResetPasswordFlow: React.FC<ResetPasswordProps> = ({ onComplete, onNavigateToLogin }) => {
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter()

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateOtp = (otpArray: string[]): string | null => {
    const otpString = otpArray.join('');
    if (otpString.length !== 6) return 'Please enter the complete 6-digit code';
    if (!/^\d{6}$/.test(otpString)) return 'OTP must contain only numbers';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setErrors({});
    const sendOTP = await AUTH_API.SEND_OTP({ email });
    if (sendOTP.message === "OTP sent successfully") {
      setCurrentStep(ResetStep.OTP);
      setResendTimer(60);
      setCanResend(false);
      setIsLoading(false);
    } else {
      setErrors({ email: sendOTP.message || `${email} does not exist in our records` });
      setIsLoading(false);
      return;
    }

  };

const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setTouched({ otp: true });

  const otpError = validateOtp(otp);
  if (otpError) {
    setErrors({ otp: otpError });
    return;
  }

  setIsLoading(true);
    const otpCode = Number(otp.join(""));

    const verificationResponse = await AUTH_API.VERIFY_OTP({
      email,
      otp: otpCode, 
    });

  setErrors({});
    if (verificationResponse.message === "OTP verified successfully") {
      setCurrentStep(ResetStep.PASSWORD);
      setIsLoading(false);
    } else {
      setErrors({ otp: verificationResponse.message || `Invalid or expired OTP` });
      setIsLoading(false);
      return;
    }

};


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });

    const passwordError = validatePassword(newPassword);
    const confirmError = newPassword !== confirmPassword ? 'Passwords do not match' : null;

    if (passwordError || confirmError) {
      setErrors({
        newPassword: passwordError || '',
        confirmPassword: confirmError || ''
      });
      return;
    }

    setIsLoading(true);
    setErrors({});
 const otpCode = Number(otp.join(""));
    try {
      const data = {
        email,
        otp : otpCode,
        newPassword
      }
      const passwordResponse = await AUTH_API.RESET_PASSWORD(data);
      if(passwordResponse.data.id){

        router.push("/client/auth/login");
      }else{
        setErrors({confirmPassword:"Failed to reset password. Please try again."})
      }
    } catch (error) {
      setErrors({ newPassword: 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (value && !/^\d$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      setErrors({ otp: 'Failed to resend code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const stepConfig = {
    [ResetStep.EMAIL]: {
      title: 'Reset Password',
      subtitle: 'Enter your email address to receive a reset code',
      icon: Mail
    },
    [ResetStep.OTP]: {
      title: 'Verify Code',
      subtitle: `Enter the 6-digit code sent to ${email}`,
      icon: Shield
    },
    [ResetStep.PASSWORD]: {
      title: 'New Password',
      subtitle: 'Create a strong new password for your account',
      icon: KeyRound
    }
  };

  const currentConfig = stepConfig[currentStep];
  const IconComponent = currentConfig.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#155670] to-[#0d3d47] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentConfig.title}</h1>
          <p className="text-gray-600">{currentConfig.subtitle}</p>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            {Object.values(ResetStep).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep
                    ? 'bg-[#155670] text-white'
                    : Object.values(ResetStep).indexOf(currentStep) > index
                      ? 'bg-[#155670] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                  {index + 1}
                </div>
                {index < Object.values(ResetStep).length - 1 && (
                  <div className={`w-8 h-1 mx-2 ${Object.values(ResetStep).indexOf(currentStep) > index
                      ? 'bg-[#155670]'
                      : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {currentStep === ResetStep.EMAIL && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendEmail}
                className="space-y-6"
              >
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      className={`w-full pl-10 pr-4 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${errors.email && touched.email
                          ? 'border-red-300 bg-red-50'
                          : email && !errors.email
                            ? 'border-[#155670] bg-[#155670]/5'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {email && !errors.email && (
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

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Sending Email...
                    </div>
                  ) : (
                    'Send Reset Code'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === ResetStep.OTP && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="flex justify-between space-x-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el: any) => (otpRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-12 h-12 text-center text-lg font-bold border rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${errors.otp && touched.otp
                            ? 'border-red-300 bg-red-50'
                            : digit
                              ? 'border-[#155670] bg-[#155670]/5'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                      />
                    ))}
                  </div>
                  {errors.otp && touched.otp && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.otp}
                    </motion.div>
                  )}
                </div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Resend code in {resendTimer}s
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[#155670] hover:text-[#0d3d47] font-semibold text-sm transition-colors duration-200"
                    >
                      Resend verification code
                    </button>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {currentStep === ResetStep.PASSWORD && (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                      }}
                      onBlur={() => setTouched({ ...touched, newPassword: true })}
                      className={`w-full pl-10 pr-12 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${errors.newPassword && touched.newPassword
                          ? 'border-red-300 bg-red-50'
                          : newPassword && !errors.newPassword
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
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {newPassword && (
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

                  {errors.newPassword && touched.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center text-sm text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.newPassword}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      className={`w-full pl-10 pr-12 py-3 border text-gray-700 rounded-xl focus:ring-2 focus:ring-[#155670] focus:border-transparent transition-all duration-200 ${errors.confirmPassword && touched.confirmPassword
                          ? 'border-red-300 bg-red-50'
                          : confirmPassword && !errors.confirmPassword && newPassword === confirmPassword
                            ? 'border-[#155670] bg-[#155670]/5'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#155670] to-[#0d3d47] hover:from-[#0d3d47] hover:to-[#155670] shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login */}
          {currentStep === ResetStep.EMAIL && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => router.push("/client/auth/login")}
                className="inline-flex items-center text-[#155670] hover:text-[#0d3d47] font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </button>
            </motion.div>
          )}

          {/* Step Navigation for OTP */}
          {currentStep === ResetStep.OTP && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => setCurrentStep(ResetStep.EMAIL)}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change email address
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Success message for completed flow */}
        {currentStep === ResetStep.PASSWORD && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center text-sm text-gray-500"
          >
            <p>After resetting your password, you'll be redirected to sign in</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordFlow;