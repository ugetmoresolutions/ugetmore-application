"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AUTH_API } from "@/endpoints/rest-api/auth";
import { X } from "lucide-react";

interface AddressModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  onConfirm: (address: string) => void;
  existingAddress?: string;
  mode: "add" | "confirm";
  userId?: number;
}

// South African provinces
const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const AddressModal: React.FC<AddressModalProps> = ({
  show,
  onClose,
  onSave,
  onConfirm,
  existingAddress = "",
  mode = "add",
  userId,
}) => {
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  // Parse existing address if provided
  useEffect(() => {
    if (existingAddress && show) {
      try {
        // Try to parse the address string
        const addressParts = existingAddress.split(", ");
        if (addressParts.length >= 1) {
          setAddressData({
            street: addressParts[0] || "",
            city: addressParts[1] || "",
            province: addressParts[2] || "",
            postalCode: addressParts[3] || "",
            country: addressParts[4] || "",
          });
          setCustomAddress(existingAddress);
        }
      } catch (error) {
        console.error("Failed to parse existing address:", error);
      }
    }
  }, [show, existingAddress]);

  const formatAddressString = (): string => {
    return `${addressData.street}, ${addressData.city}, ${addressData.province}, ${addressData.postalCode} ${addressData.country}`;
  };

  const handleInputChange = (
    field: keyof typeof addressData,
    value: string
  ) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  };

  const saveAddressToUserProfile = async (
    address: string
  ): Promise<boolean> => {
    if (!userId) {
      console.error("No user ID available to save address to profile");
      return false;
    }

    try {
      // Use ADD_USER_ADDRESS endpoint to save the address
      const response = await AUTH_API.ADD_USER_ADDRESS(userId, address);
      return !response.error;
    } catch (error) {
      console.error("Error saving address to user profile:", error);
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const addressString = formatAddressString();

      // Save address to user profile first
      if (userId) {
        const saveSuccess = await saveAddressToUserProfile(addressString);
        if (!saveSuccess) {
          throw new Error("Failed to save address to user profile");
        }
      }

      // Then call the parent's onSave callback
      onSave(addressString);
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const addressString = editMode ? customAddress : formatAddressString();

      // For confirmation, we should update the user's address
      if (userId) {
        const saveSuccess = await saveAddressToUserProfile(addressString);
        if (!saveSuccess) {
          throw new Error("Failed to update address in user profile");
        }
      }

      onConfirm(addressString);
      onClose();
    } catch (error) {
      console.error("Error confirming address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-50 w-full max-w-md mx-4 bg-white rounded-4xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r bg-[#155670]">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mode === "confirm"
                      ? "bg-white text-green-600"
                      : "bg-white text-[#155670]"
                  }`}
                >
                  {mode === "confirm" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </motion.div>
                <div>
                  <h2 className={`text-xl font-bold ${mode === "confirm" ? "text-white" : "text-white"}`}>
                    {mode === "confirm"
                      ? "Confirm Delivery Address"
                      : "Add Shipping Address"}
                  </h2>
                  <p className={`text-sm mt-1 ${mode === "confirm" ? "text-gray-200" : "text-gray-200"}`}>
                    {mode === "confirm"
                      ? "Review your delivery information"
                      : "Enter your delivery details"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-[#0d3d47] transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-white max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`p-4 rounded-2xl ${
                    mode === "confirm"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {mode === "confirm"
                      ? "Please confirm your shipping address before proceeding to payment."
                      : "Please provide your complete delivery address."}
                  </p>
                </motion.div>

                {mode === "confirm" ? (
                  // Confirmation view with edit option
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="border rounded-2xl p-5 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#155670] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              Delivery Address
                            </h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-[#155670]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                </svg>
                                {formatAddressString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!editMode ? (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="w-full text-center text-sm text-[#155670] hover:text-[#0d3d47] font-medium py-2 border border-dashed border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        + Update address
                      </button>
                    ) : (
                      <div className="border rounded-2xl p-4 bg-white border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update your address
                        </label>
                        <textarea
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm transition-all focus:ring-[#155670] focus:border-[#155670] min-h-[100px]"
                          placeholder="Enter your updated address"
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            type="button"
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // Add address form view
                  <form onSubmit={handleSave} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="border rounded-2xl p-5 bg-white border-gray-200"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={addressData.street}
                            onChange={(e) =>
                              handleInputChange("street", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm transition-all focus:ring-[#155670] focus:border-[#155670]"
                            placeholder="123 Main Street, Apartment 4B"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Include building number, street name, and unit number if applicable
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              value={addressData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm transition-all focus:ring-[#155670] focus:border-[#155670]"
                              placeholder="Pretoria"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Province
                            </label>
                            <select
                              value={addressData.province}
                              onChange={(e) =>
                                handleInputChange("province", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm transition-all focus:ring-[#155670] focus:border-[#155670]"
                            >
                              <option value="">Select Province</option>
                              {SOUTH_AFRICAN_PROVINCES.map((province) => (
                                <option key={province} value={province}>
                                  {province}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={addressData.postalCode}
                              onChange={(e) =>
                                handleInputChange(
                                  "postalCode",
                                  e.target.value.replace(/\D/g, "").slice(0, 4)
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm transition-all focus:ring-[#155670] focus:border-[#155670]"
                              placeholder="0002"
                              maxLength={4}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              value={addressData.country}
                              onChange={(e) =>
                                handleInputChange("country", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm bg-gray-50 cursor-not-allowed focus:ring-gray-300 focus:border-gray-300"
                              
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-white">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>

              {mode === "add" ? (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#155670] to-[#0d3d47] text-white rounded-2xl hover:from-[#0d3d47] hover:to-[#155670] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Address"
                  )}
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting || (editMode && !customAddress.trim())}
                  className="px-5 py-2.5 min-w-[140px] bg-gradient-to-r from-[#155670] to-[#0d3d47] text-white rounded-2xl hover:from-[#0d3d47] hover:to-[#155670] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Continue to Payment"
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;