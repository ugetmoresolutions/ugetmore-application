import BrandingShopPage from "@/components/shop/BrandingShopPage";
import React, { Suspense } from "react";

function page() {
  return (
    <div>
      <Suspense>
        <BrandingShopPage/>
      </Suspense>
    </div>
  );
}

export default page;
