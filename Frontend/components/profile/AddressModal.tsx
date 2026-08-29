"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { X } from "lucide-react";

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
  "Western Cape"
];

interface AddressModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  existingAddress?: string;
  mode: "add" | "edit";
}

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  show,
  onClose,
  onSave,
  existingAddress = "",
  mode = "add",
}) => {
  const [addressData, setAddressData] = useState<AddressData>({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse existing address if provided
  useEffect(() => {
    if (existingAddress && show) {
      try {
        const addressParts = existingAddress.split(', ');
        if (addressParts.length >= 4) {
          setAddressData({
            street: addressParts[0] || "",
            city: addressParts[1] || "",
            province: addressParts[2] || "",
            postalCode: addressParts[3] || "",
            country: addressParts[4] || "South Africa"
          });
        }
      } catch (error) {
        console.error("Failed to parse existing address:", error);
      }
    } else if (show) {
      // Reset form when opening for new address
      setAddressData({
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "South Africa"
      });
    }
  }, [show, existingAddress]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!addressData.street.trim()) {
      newErrors.street = "Street address is required";
    }
    
    if (!addressData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!addressData.province.trim()) {
      newErrors.province = "Province is required";
    }
    
    if (!addressData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d{4}$/.test(addressData.postalCode)) {
      newErrors.postalCode = "Postal code must be 4 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatAddressString = (): string => {
    return `${addressData.street}, ${addressData.city}, ${addressData.province}, ${addressData.postalCode}, ${addressData.country}`;
  };

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const addressString = formatAddressString();
      onSave(addressString);
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <Modal
          show={show}
          onClose={onClose}
          size="lg"
          className="backdrop-blur-sm bg-white bg-opacity-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
          >
            <ModalHeader className="border-b bg-white border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {mode === "edit" ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </ModalHeader>

            <ModalBody className="px-6 bg-white py-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      errors.street
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 focus:border-[#155670] focus:ring-1 focus:ring-[#155670]"
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.street && (
                    <p className="text-red-600 text-xs mt-1">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      errors.city
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 focus:border-[#155670] focus:ring-1 focus:ring-[#155670]"
                    }`}
                    placeholder="Pretoria"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      value={addressData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        errors.province
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 focus:border-[#155670] focus:ring-1 focus:ring-[#155670]"
                      }`}
                    >
                      <option value="">Select Province</option>
                      {SOUTH_AFRICAN_PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-600 text-xs mt-1">{errors.province}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={addressData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        errors.postalCode
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 focus:border-[#155670] focus:ring-1 focus:ring-[#155670]"
                      }`}
                      placeholder="0002"
                      maxLength={4}
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-xs mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={addressData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
              </form>
            </ModalBody>

            <ModalFooter className="border-t bg-white border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#155670] to-[#0d3d47] text-white rounded-lg hover:from-[#0d3d47] hover:to-[#155670] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </ModalFooter>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};