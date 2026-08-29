import UniversalShopPage from "@/components/shop/BrandingShopPage";
import React, { Suspense } from "react";

function page() {
  return (
    <div>
      <Suspense>
        <UniversalShopPage />
      </Suspense>
    </div>
  );
}

export default page;
