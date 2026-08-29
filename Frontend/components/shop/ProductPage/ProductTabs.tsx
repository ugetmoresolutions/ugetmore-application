// components/ProductTabs.tsx
import React from "react";
import { IProduct } from "@/interfaces/product/product";

interface EnhancedProduct extends IProduct {
  price?: number;
  calculatedPrice?: number;
}

interface ProductTabsProps {
  product: EnhancedProduct;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVariant: number;
  isTarsusProduct?: boolean; 
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  activeTab,
  setActiveTab,
  selectedVariant,
  isTarsusProduct= false ,
}) => {
  return (
    <section className="mb-12 sm:mb-16 md:mb-20">
      <div className="border-b border-gray-200 mb-4 sm:mb-6 md:mb-8">
        <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide -mb-px">
          {["details", "specifications", "branding"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm capitalize transition-colors flex-shrink-0 touch-manipulation ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 active:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="prose max-w-none text-sm sm:text-base">
        {activeTab === "details" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Product Features
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {product.feature?.split(",").map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {feature.trim()}
                    </span>
                  </li>
                )) || (
                  <li className="text-gray-500 text-sm sm:text-base">
                    No features listed
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Materials
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {product.material || "Material information not available"}
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Description
              </h3>
              <div
                className="text-gray-700 prose prose-sm sm:prose max-w-none [&>p]:text-sm sm:[&>p]:text-base [&>ul]:text-sm sm:[&>ul]:text-base [&>li]:text-sm sm:[&>li]:text-base"
                dangerouslySetInnerHTML={{
                  __html: product.description || "No description available",
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Product Details
              </h3>
              <dl className="space-y-2 sm:space-y-3">
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                  <dt className="font-medium text-gray-600 text-sm sm:text-base">
                    SKU
                  </dt>
                  <dd className="text-gray-900 font-mono text-sm sm:text-base break-all xs:break-normal">
                    {product.fullCode}
                  </dd>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                  <dt className="font-medium text-gray-600 text-sm sm:text-base">
                    Brand
                  </dt>
                  <dd className="text-gray-900 text-sm sm:text-base truncate">
                    {product.brand?.name || "Unknown"}
                  </dd>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                  <dt className="font-medium text-gray-600 text-sm sm:text-base">
                    Available Stock
                  </dt>
                  <dd className="text-gray-900 text-sm sm:text-base">
                    {product.stockInfo?.stock || 0} units
                  </dd>
                </div>

                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                  <dt className="font-medium text-gray-600 text-sm sm:text-base">
                    Minimum Order
                  </dt>
                  <dd className="text-gray-900 text-sm sm:text-base">
                    {product.minimum || 1} units
                  </dd>
                </div>
                <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                  <dt className="font-medium text-gray-600 text-sm sm:text-base">
                    Maximum Order
                  </dt>
                  <dd className="text-gray-900 text-sm sm:text-base">
                    {product.maximum || "No limit"}
                  </dd>
                </div>
                
                {product.displayCountryOfOrigin && (
                  <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                    <dt className="font-medium text-gray-600 text-sm sm:text-base">
                      Country of Origin
                    </dt>
                    <dd className="text-gray-900 text-sm sm:text-base">
                      {product.displayCountryOfOrigin}
                    </dd>
                  </div>
                )}
                {product.fit && (
                  <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                    <dt className="font-medium text-gray-600 text-sm sm:text-base">
                      Fit
                    </dt>
                    <dd className="text-gray-900 text-sm sm:text-base">
                      {product.fit}
                    </dd>
                  </div>
                )}
                {product.gender && (
                  <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                    <dt className="font-medium text-gray-600 text-sm sm:text-base">
                      Gender
                    </dt>
                    <dd className="text-gray-900 text-sm sm:text-base">
                      {product.gender}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {product.variants &&
              product.variants.length > 0 &&
              product.variants[selectedVariant] && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                    Selected Variant
                  </h3>
                  <dl className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                      <dt className="font-medium text-gray-600 text-sm sm:text-base">
                        Color
                      </dt>
                      <dd className="text-gray-900 text-sm sm:text-base">
                        {product.variants[selectedVariant]?.codeColourName ||
                          "Standard"}
                      </dd>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                      <dt className="font-medium text-gray-600 text-sm sm:text-base">
                        Size
                      </dt>
                      <dd className="text-gray-900 text-sm sm:text-base">
                        {product.variants[selectedVariant]?.codeSizeName ||
                          "One Size"}
                      </dd>
                    </div>
                    {product.variants[selectedVariant]?.productDimension
                      ?.weight && (
                      <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                        <dt className="font-medium text-gray-600 text-sm sm:text-base">
                          Weight
                        </dt>
                        <dd className="text-gray-900 text-sm sm:text-base">
                          {
                            product.variants[selectedVariant].productDimension
                              .weight
                          }
                          g
                        </dd>
                      </div>
                    )}
                    {product.variants[selectedVariant]?.productDimension && (
                      <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                        <dt className="font-medium text-gray-600 text-sm sm:text-base">
                          Dimensions
                        </dt>
                        <dd className="text-gray-900 text-sm sm:text-base">
                          {product.variants[selectedVariant].productDimension
                            .length &&
                          product.variants[selectedVariant].productDimension
                            .width
                            ? `${product.variants[selectedVariant].productDimension.length} × ${product.variants[selectedVariant].productDimension.width} cm`
                            : "Not specified"}
                        </dd>
                      </div>
                    )}
                    {product.variants[selectedVariant]
                      ?.packagingAndDimension && (
                      <>
                        <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                          <dt className="font-medium text-gray-600 text-sm sm:text-base">
                            Pieces per Carton
                          </dt>
                          <dd className="text-gray-900 text-sm sm:text-base">
                            {
                              product.variants[selectedVariant]
                                .packagingAndDimension.piecesPerCarton
                            }
                          </dd>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                          <dt className="font-medium text-gray-600 text-sm sm:text-base">
                            Carton Weight
                          </dt>
                          <dd className="text-gray-900 text-sm sm:text-base">
                            {
                              product.variants[selectedVariant]
                                .packagingAndDimension.cartonWeight
                            }
                            kg
                          </dd>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:justify-between py-2 border-b border-gray-100 gap-1 xs:gap-0">
                          <dt className="font-medium text-gray-600 text-sm sm:text-base flex-shrink-0">
                            Carton Size
                          </dt>
                          <dd className="text-gray-900 text-sm sm:text-base break-all xs:break-normal">
                            {
                              product.variants[selectedVariant]
                                .packagingAndDimension.cartonSizeDimensionL
                            }{" "}
                            ×{" "}
                            {
                              product.variants[selectedVariant]
                                .packagingAndDimension.cartonSizeDimensionW
                            }{" "}
                            ×{" "}
                            {
                              product.variants[selectedVariant]
                                .packagingAndDimension.cartonSizeDimensionH
                            }{" "}
                            cm
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              )}
          </div>
        )}

        {activeTab === "branding" && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Branding Options
              </h3>
              {product.brandings && product.brandings.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {product.brandings.map((branding, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-white shadow-sm"
                    >
                      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start mb-3 gap-2 xs:gap-0">
                        <h4 className="font-semibold text-base sm:text-lg text-gray-900">
                          {branding.positionName || `Position ${index + 1}`}
                        </h4>
                        {branding.positionCode && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono self-start xs:self-auto">
                            {branding.positionCode}
                          </span>
                        )}
                      </div>

                      {branding.positionComment && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 italic leading-relaxed">
                          {branding.positionComment}
                        </p>
                      )}

                      {branding.positionMultiplier &&
                        branding.positionMultiplier !== 1 && (
                          <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
                            <span className="font-medium text-gray-700">
                              Position Multiplier:
                            </span>
                            <span className="ml-1 text-blue-600 font-semibold">
                              {branding.positionMultiplier}x
                            </span>
                          </div>
                        )}

                      {branding.method && branding.method.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {branding.method.map((method, methodIndex) => (
                            <div
                              key={methodIndex}
                              className="bg-gray-50 p-3 sm:p-4 rounded-lg border"
                            >
                              <div className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                {method.brandingName || "Branding Method"}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                {method.maxPrintingSizeWidth &&
                                  method.maxPrintingSizeHeight && (
                                    <div className="break-words">
                                      <span className="font-medium">
                                        Max Size:
                                      </span>{" "}
                                      {method.maxPrintingSizeWidth} ×{" "}
                                      {method.maxPrintingSizeHeight}
                                    </div>
                                  )}
                                {method.numberOfColours && (
                                  <div>
                                    <span className="font-medium">Colors:</span>{" "}
                                    {method.numberOfColours}
                                  </div>
                                )}
                                {method.brandingDepartment && (
                                  <div className="break-words">
                                    <span className="font-medium">
                                      Department:
                                    </span>{" "}
                                    {method.brandingDepartment}
                                  </div>
                                )}
                                {method.brandingCode && (
                                  <div className="break-words">
                                    <span className="font-medium">Code:</span>{" "}
                                    {method.brandingCode}
                                  </div>
                                )}
                                {method.brandingInclusiveMethod && (
                                  <div className="text-green-600 text-xs font-medium">
                                    ✓ Inclusive Method
                                  </div>
                                )}
                                {method.brandingMultiplier &&
                                  method.brandingMultiplier !== 1 && (
                                    <div>
                                      <span className="font-medium">
                                        Multiplier:
                                      </span>{" "}
                                      {method.brandingMultiplier}x
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base">
                          No methods available for this position
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-200">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 2v12a1 1 0 001 1h8a1 1 0 001-1V6"
                      />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No Branding Options Available
                  </h4>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">
                    This product doesn't have standard branding options
                    configured.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 px-4">
                    Contact our team for custom branding solutions and pricing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
