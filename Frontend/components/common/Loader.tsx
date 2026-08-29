"use client";
import Image from "next/image";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm">
      <div className=" flex items-center justify-center">
        

        {/* Logo at the center */}
        <div className="relative w-60 h-60 z-10">
          <Image
            src="/ugetmo.gif"
            alt="ugetmo Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
