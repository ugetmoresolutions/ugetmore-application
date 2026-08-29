// app/client/auth/verify-email/page.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';
import { AUTH_API } from '@/endpoints/rest-api/auth';

const EmailVerificationPage = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please request a new verification email.');
        return;
      }

      try {
        const response = await AUTH_API.VERIFY_EMAIL(token);
        
        if (response.data) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! You can now log in to your account.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/client/auth/login');
          }, 3000);
        }
      } catch (error: any) {
        setVerificationStatus('error');
        const errorMessage = error.response?.data?.message || 'Verification failed. The link may have expired or is invalid.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
        >
          {verificationStatus === 'verifying' && (
            <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {verificationStatus === 'verifying' && 'Verifying Email'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {verificationStatus === 'error' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700 text-left">
                  If you need a new verification link, please try logging in and you'll have the option to resend it.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push('/client/auth/login')}
              className="w-full py-3 px-4 bg-[#155670] text-white rounded-xl font-semibold hover:bg-[#0d3d47] transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;