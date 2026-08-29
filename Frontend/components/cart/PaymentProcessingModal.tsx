"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalBody } from "flowbite-react";

interface PaymentProcessingModalProps {
  show: boolean;
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  show,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <Modal
          show={show}
          onClose={() => {}}
          size="md"
          className="backdrop-blur-sm bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden border border-slate-700"
          >
            <ModalBody className="px-6 py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </motion.div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                Processing Payment
              </h3>
              
              <p className="text-slate-400 mb-6">
                Please wait while we prepare your secure payment gateway...
              </p>
              
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </ModalBody>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default PaymentProcessingModal;