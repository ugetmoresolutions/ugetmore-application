import React from "react";
import { Wrench, Clock } from "lucide-react";

export const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 flex flex-col items-center border border-[#104758]">
        <Wrench className="w-16 h-16 text-[#104758] mb-4 animate-bounce" />
        <h1 className="text-3xl sm:text-4xl font-bold text-[#104758] mb-2 text-center">
          We'll Be Back Soon!
        </h1>
        <p className="text-gray-700 text-center mb-4 max-w-md">
          Our site is currently undergoing scheduled maintenance.<br />
          We’re working hard to improve your experience and will be back online shortly.
        </p>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
          <Clock className="w-4 h-4" />
          <span>Thank you for your patience.</span>
        </div>
        <div className="text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} U-GETMO. All rights reserved.
        </div>
      </div>
    </div>
  );
}