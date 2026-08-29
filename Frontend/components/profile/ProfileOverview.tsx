// components/profile/ProfileOverview.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Shield,
  Star,
  Camera,
  Building2,
  FileText,
  Users,
} from "lucide-react";

interface Address {
  id: string;
  address: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  addresses: Address[];
  joinDate?: string;
  verified?: boolean;
  businessName?: string;
  businessType?: string;
  createdAt?: string;
  vatNumber?: string;
}

interface ProfileOverviewProps {
  orderCount: number; // Add this prop
  user: User;
  setCurrentView: (value: "edit" | "overview" | "changePassword") => void;
  onAddAddress: () => void;
  onEditAddress: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  orderCount,
  user,
  setCurrentView,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
}) => {
  const isBusiness = user.role === "business";

  // ✅ Use Tailwind classes directly
  const primaryColor = isBusiness ? "from-slate-900" : "from-[#155670]";
  const secondaryColor = isBusiness ? "to-slate-800" : "to-[#0d3d47]";

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div
          className={`bg-gradient-to-r ${primaryColor} ${secondaryColor} h-20 sm:h-24 lg:h-28`}
        ></div>
        <div className="relative px-6 lg:px-8 pb-8">
          {/* Avatar & Edit */}
          <div className="flex flex-col sm:flex-row items-center justify-between -mt-12 mb-6">
            <div className="relative">
              <div
                className={`w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${primaryColor} ${secondaryColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white`}
              >
                {isBusiness ? <Building2 className="w-10 h-10" /> : user.avatar}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border hover:bg-gray-50 transition">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <motion.button
              onClick={() => setCurrentView("edit")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`mt-4 sm:mt-0 px-6 py-2 bg-gradient-to-r ${primaryColor} ${secondaryColor} text-white rounded-xl font-medium shadow-md flex items-center gap-2`}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </motion.button>
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isBusiness ? user.businessName : user.name}
                </h2>
                {user.verified && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
                {isBusiness && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <Building2 className="w-3 h-3" />
                    Business Account
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {isBusiness ? "Business registered" : "Account holder"} since{" "}
                {user.joinDate || "January 2025"}
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            {isBusiness && (
              <div className="grid sm:grid-cols-2 gap-4">
                {user.businessType && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Business Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {user.businessType}
                      </p>
                    </div>
                  </div>
                )}
                {user.vatNumber && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">VAT Number</p>
                      <p className="font-medium text-gray-900">
                        {user.vatNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-bold text-[#155670]">
                  {user.addresses.length}
                </p>
                <p className="text-sm text-gray-600">Addresses</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xl font-bold text-[#155670]">{orderCount}</p>
                <p className="text-sm text-gray-600">Orders</p>
              </div>
              {/* <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xl font-bold text-[#155670]">0.0</p>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div> */}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Addresses */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 bg-gradient-to-br ${primaryColor} ${secondaryColor} rounded-lg`}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isBusiness ? "Business Address" : "Shipping Addresses"}
              </h3>
              <p className="text-sm text-gray-600">
                {isBusiness
                  ? "Your business location"
                  : "Manage your delivery locations"}
              </p>
            </div>
          </div>
          {user.addresses.length === 0 && (
            <motion.button
              onClick={onAddAddress}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r ${primaryColor} ${secondaryColor} text-white rounded-lg font-medium`}
            >
              <Plus className="w-4 h-4" />
              Address
            </motion.button>
          )}
        </div>

        {user.addresses.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No addresses added yet
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {isBusiness
                ? "Add your business address to get started"
                : "Add your first shipping address to get started"}
            </p>
            <motion.button
              onClick={onAddAddress}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 bg-gradient-to-r ${primaryColor} ${secondaryColor} text-white rounded-lg font-medium`}
            >
              Add Address
            </motion.button>
          </div>
        ) : (
          <div className="grid gap-4">
            {user.addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-700">{address.address}</p>
                  {address.isDefault && (
                    <span className="inline-block px-2 py-1 mt-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditAddress(address.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => onDeleteAddress(address.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfileOverview;
