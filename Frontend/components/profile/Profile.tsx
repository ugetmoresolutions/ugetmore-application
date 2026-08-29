"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfileOverview from '@/components/profile/ProfileOverview';
import { decodeAccessToken } from '@/endpoints/lib/ecryptUser';
import { AUTH_API } from '@/endpoints/rest-api/auth';
import { useRouter } from 'next/navigation';
import { AddressModal } from '@/components/profile/AddressModal';
import { ORDER_API } from '@/endpoints/rest-api/order';

type ProfilePageProps = {
  setCurrentView: (value: 'edit' | 'overview' | 'changePassword') => void;
}

function ProfilePage({ setCurrentView }: ProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0); // Add order count state
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const decodedUserData = decodeAccessToken();

      if (!decodedUserData) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userResponse = await AUTH_API.GET_USER(decodedUserData.id);
        
        // Fetch user orders - ADD THIS SECTION
        let ordersCount = 0;
        try {
          const ordersResponse = await ORDER_API.GET_USER_ORDERS(decodedUserData.id);
          if (ordersResponse?.data) {
            // If data is an array, get the length, otherwise use the count if it's a number
            ordersCount = Array.isArray(ordersResponse.data) 
              ? ordersResponse.data.length 
              : (ordersResponse.data.count || 0);
          }
        } catch (orderError) {
          console.error('Failed to fetch orders:', orderError);
          // Continue with user data even if orders fail
        }

        console.log('User data from API:', userResponse.data);
        console.log('Orders count:', ordersCount);

        if (userResponse?.data) {
          const userData = {
            id: userResponse.data.id ? userResponse.data.id.toString() : "",
            name: userResponse.data.fullName,
            email: userResponse.data.email,
            phone: userResponse.data.phone,
            role: userResponse.data.role,
            avatar: userResponse.data.fullName.split(' ').map(n => n[0]).join(''),
            joinDate: new Date(decodedUserData.iat * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            verified: true,
            addresses: userResponse.data.address ? [
              {
                id: '1',
                address: userResponse.data.address,
                isDefault: true
              }
            ] : [],
            // Business-specific fields
            businessName: userResponse.data.businessName,
            businessType: userResponse.data.businessType,
            vatNumber: userResponse.data.vatNumber
          };

          setUser(userData);
          setOrderCount(ordersCount); // Set the order count
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveAddress = async (address: string) => {
    try {
      const decodedUser = decodeAccessToken();
      if (!decodedUser?.id) return;

      setIsLoading(true);
      
      // Update address via API
      const response = await AUTH_API.UPDATE_USER_ADDRESSES(decodedUser.id, address);
      
      if (!response.error) {
        // Refetch fresh user data from API instead of updating local state
        const userResponse = await AUTH_API.GET_USER(decodedUser.id);
        
        if (userResponse?.data) {
          const updatedUser = {
            id: userResponse.data.id ? userResponse.data.id.toString() : "",
            name: userResponse.data.fullName,
            email: userResponse.data.email,
            phone: userResponse.data.phone,
            role: userResponse.data.role,
            avatar: userResponse.data.fullName.split(' ').map(n => n[0]).join(''),
            joinDate: new Date(decodedUser.iat * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }),
            verified: true,
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
          
          setUser(updatedUser);
        }
        
        console.log('Address updated successfully');
      }
    } catch (error) {
      console.error('Failed to update address:', error);
    } finally {
      setIsLoading(false);
      setShowAddressModal(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress('');
    setIsEditing(false);
    setShowAddressModal(true);
  };

  const handleEditAddress = (addressId: string) => {
    const addressToEdit = user.addresses.find((addr: any) => addr.id === addressId);
    if (addressToEdit) {
      setEditingAddress(addressToEdit.address);
      setIsEditing(true);
      setShowAddressModal(true);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    console.log('Delete address:', addressId);
    // Implement delete functionality
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#155670] border-t-transparent"></div>
          <span className="font-medium text-gray-900">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
      <div className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        <ProfileOverview
        orderCount={orderCount} // Pass orderCount as prop
          user={user}
          setCurrentView={setCurrentView}
          onAddAddress={handleAddAddress}
          onEditAddress={handleEditAddress}
          onDeleteAddress={handleDeleteAddress}
        />

        <AddressModal
          show={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSave={handleSaveAddress}
          existingAddress={editingAddress}
          mode={isEditing ? "edit" : "add"}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16 text-center text-xs xs:text-sm sm:text-sm md:text-base lg:text-base text-gray-500"
        >
          <p className="px-2 sm:px-0">🔒 Your information is secure and encrypted</p>
          <p className="mt-1 sm:mt-1 md:mt-2 px-2 sm:px-0">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;