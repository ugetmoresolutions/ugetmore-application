import React from 'react';
import { ArrowLeft, ShoppingCart, Receipt, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartHeaderProps {
  itemCount: number;
  onGoBack: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ 
  itemCount, 
  onGoBack, 

}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
            <button
              onClick={onGoBack}
              className="p-1.5 xs:p-2 sm:p-2 text-gray-600 hover:text-[#155670] transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 xs:h-6 xs:w-6 sm:h-6 sm:w-6" />
            </button>
            <div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-xs xs:text-sm sm:text-sm md:text-base text-gray-600">{itemCount} items in your cart</p>
            </div>
          </div>
          <div className="hidden xs:hidden sm:flex md:flex lg:flex items-center gap-1.5 xs:gap-2 sm:gap-2 text-xs xs:text-sm sm:text-sm md:text-base text-gray-600">
            <ShoppingCart className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <span>Secure Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartHeader;