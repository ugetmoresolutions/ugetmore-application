// hooks/useReceipt.ts
import { useState, useCallback } from 'react';
import { CartItemDisplay } from '@/interfaces/cart/cart';


export interface ReceiptData {
  orderId: string;
  orderDate: Date;
  cartItems: CartItemDisplay[];
  itemTotal: number;
  discount: number;
  shippingCost: number;
  vatAmount: number;
  grandTotal: number;
  appliedCoupon?: string;
  shippingMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber: string;
    registrationNumber: string;
  };
}

export const useReceipt = () => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const generateOrderId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `UGM-${timestamp}-${random}`;
  }, []);

  const companyInfo = {
    name: 'UGETMO Group ',
    address: '377 Rivonia Boulevard, Rivonia, Johannesburg, 2128',
    phone: '011-749-3322',
    email: 'sales@ugetmoregroup.com',
    vatNumber: 'VAT123456789',
    registrationNumber: 'REG987654321'
  };

  const generateReceipt = useCallback((
    cartItems: CartItemDisplay[],
    itemTotal: number,
    discount: number,
    shippingCost: number,
    vatAmount: number,
    grandTotal: number,
    appliedCoupon: string,
    shippingMethod: string,
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
      address?: string; 
    }
  ) => {
    const isFreeShipping = grandTotal >= 2000 || shippingMethod === 'pickup';
    const finalShippingCost = isFreeShipping ? 0 : shippingCost;
    
    const receipt: ReceiptData = {
      orderId: generateOrderId(),
      orderDate: new Date(),
      cartItems,
      itemTotal,
      discount,
      shippingCost: finalShippingCost,
      vatAmount,
      grandTotal,
      appliedCoupon,
      shippingMethod,
      customerInfo,
      companyInfo
    };

    setReceiptData(receipt);
    setShowReceipt(true);

    // Store receipt in localStorage for future reference
    const storedReceipts = JSON.parse(localStorage.getItem('userReceipts') || '[]');
    storedReceipts.push(receipt);
    // Keep only last 50 receipts
    if (storedReceipts.length > 50) {
      storedReceipts.splice(0, storedReceipts.length - 50);
    }
    localStorage.setItem('userReceipts', JSON.stringify(storedReceipts));

    return receipt;
  }, [generateOrderId]);

  const closeReceipt = useCallback(() => {
    setShowReceipt(false);
    setReceiptData(null);
  }, []);

  const getStoredReceipts = useCallback((): ReceiptData[] => {
    return JSON.parse(localStorage.getItem('userReceipts') || '[]');
  }, []);

  const viewStoredReceipt = useCallback((receipt: ReceiptData) => {
    setReceiptData(receipt);
    setShowReceipt(true);
  }, []);

  return {
    showReceipt,
    receiptData,
    generateReceipt,
    closeReceipt,
    getStoredReceipts,
    viewStoredReceipt
  };
};