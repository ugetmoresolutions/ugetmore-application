import React from "react";
import {
  Upload,
  Search,
  FileText,
  Trash2,
  X,
  Plus,
  Palette,
  DollarSign,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  BrandingConfig,
  BrandingPosition,
  ColorQuantity,
} from "@/interfaces/branding/branding";

interface BrandingConfigurationProps {
  positions: BrandingPosition[];
  configs: BrandingConfig[];
  selectedColors: ColorQuantity[];
  onMethodSelect: (positionId: string, method: any) => void;
  onColorApplyToBranding: (positionId: string, colorCode: string) => void;
  onConfigUpdate: (
    positionId: string,
    field: keyof BrandingConfig,
    value: any
  ) => void;
  onArtworkUpload: (positionId: string) => void;
  onJobSearch: () => void;
  onRemoveArtwork: (artworkId: string) => void;
  onOpenPantoneChart: (positionId: string, colorId: string) => void;
  onOpenStandardColors: (positionId: string, colorId: string) => void;
  onAddPantoneColor: (positionId: string) => void;
  onUpdatePantoneColor: (
    positionId: string,
    colorId: string,
    field: string,
    value: string
  ) => void;
  onRemovePantoneColor: (positionId: string, colorId: string) => void;
  onArtworkOptionChange: (
    positionId: string,
    option: "upload" | "previous" | "design"
  ) => void;
}

export const BrandingConfiguration: React.FC<BrandingConfigurationProps> = ({
  positions,
  configs,
  selectedColors,
  onMethodSelect,
  onColorApplyToBranding,
  onConfigUpdate,
  onArtworkUpload,
  onJobSearch,
  onRemoveArtwork,
  onOpenPantoneChart,
  onOpenStandardColors,
  onAddPantoneColor,
  onUpdatePantoneColor,
  onRemovePantoneColor,
  onArtworkOptionChange,
}) => {
  const selectedPositions = positions.filter((pos) => pos.selected);

  const getPositionGridOptions = () => [
    "Top Left",
    "Top Center",
    "Top Right",
    "Middle Left",
    "Center",
    "Middle Right",
    "Bottom Left",
    "Bottom Center",
    "Bottom Right",
  ];

  const getEmbroideryPositions = () => [
    "Center",
    "Left Chest",
    "Right Chest",
    "Full Front",
    "Full Back",
  ];

  return (
    <>
      {selectedPositions.map((position) => {
        const config = configs.find((c) => c.positionId === position.id);
        // Note: artworkOption, designBrief, companyName, industry, preferredColors need to be added to BrandingConfig interface
        const artworkOption = (config as any)?.artworkOption || "upload";

        return (
          <div
            key={`method-${position.id}`}
            className="bg-gray-50 rounded-xl p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4 lg:space-y-6"
          >
            <h5 className="font-medium text-gray-900 text-sm md:text-base lg:text-lg">
              Configuration for {position.name}
            </h5>

            {/* Method Selection */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium text-gray-700">
                Branding Method:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {position.methods.map((method, methodIndex) => (
                  <button
                    key={methodIndex}
                    onClick={() => onMethodSelect(position.id, method)}
                    className={`p-2 md:p-3 lg:p-4 rounded-lg border text-left transition-all ${
                      position.selectedMethod === method
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-xs md:text-sm lg:text-base">
                      {method.brandingName}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                      Size: {method.maxPrintingSizeWidth} x{" "}
                      {method.maxPrintingSizeHeight} | Colors:{" "}
                      {method.numberOfColours}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Application - Only show if product has colors */}
            {selectedColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700">
                  Apply to colors: *
                  <span className="block text-xs text-gray-500 font-normal mt-0.5">
                    Select which colors will receive branding for this position
                  </span>
                </label>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-2 rounded-lg border ${
                    position.appliedToColors.length === 0
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200"
                  }`}
                >
                  {selectedColors
                    .filter((cq) => cq.quantity > 0)
                    .map((colorQty) => (
                      <button
                        key={colorQty.colorCode}
                        onClick={() =>
                          onColorApplyToBranding(
                            position.id,
                            colorQty.colorCode
                          )
                        }
                        className={`p-2 md:p-3 rounded-lg border text-left transition-all text-xs md:text-sm ${
                          position.appliedToColors.includes(colorQty.colorCode)
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">{colorQty.colorName}</div>
                        <div className="text-xs text-gray-500">
                          Qty: {colorQty.quantity}
                        </div>
                      </button>
                    ))}
                </div>
                {position.appliedToColors.length === 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      Please select at least one color to apply branding to
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Message for products without colors */}
            {selectedColors.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    This branding will be applied to the product (no color
                    variations available)
                  </span>
                </div>
              </div>
            )}

            {/* Artwork Options */}
            <div className="space-y-3">
              <label className="text-xs md:text-sm font-medium text-gray-700">
                Artwork Options:
              </label>

              {/* Artwork Option Selection */}
              <div className="grid grid-cols-1 gap-3">
                {/* Upload Artwork Option */}
                <div
                  className={`border-2 rounded-lg p-3 md:p-4 lg:p-5 cursor-pointer transition-all ${
                    artworkOption === "upload"
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => onArtworkOptionChange(position.id, "upload")}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${
                        artworkOption === "upload"
                          ? "border-cyan-500"
                          : "border-gray-400"
                      }`}
                    >
                      {artworkOption === "upload" && (
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <Upload className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">
                        Upload My Artwork
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        I have my own logo/design to upload
                      </div>
                    </div>
                    <div className="text-xs md:text-sm font-medium text-green-600 flex-shrink-0">
                      Free
                    </div>
                  </div>

                  {artworkOption === "upload" && (
                    <div className="mt-3 pl-6 md:pl-8">
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onArtworkUpload(position.id);
                          }}
                          className={`p-2 md:p-3 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center gap-2 ${
                            !config?.artworkFile
                              ? "border-red-300 bg-red-50 hover:border-red-400"
                              : "border-gray-300 hover:border-cyan-400 hover:bg-cyan-50"
                          }`}
                        >
                          <Upload className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm">
                            Choose file to upload
                          </span>
                        </button>
                        {!config?.artworkFile && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Artwork file is required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Previous Job Option */}
                {/* <div 
                                    className={`border-2 rounded-lg p-3 md:p-4 lg:p-5 cursor-pointer transition-all ${
                                        artworkOption === 'previous' 
                                            ? 'border-cyan-500 bg-cyan-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onClick={() => onArtworkOptionChange(position.id, 'previous')}
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${
                                            artworkOption === 'previous' ? 'border-cyan-500' : 'border-gray-400'
                                        }`}>
                                            {artworkOption === 'previous' && (
                                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-cyan-500 rounded-full" />
                                            )}
                                        </div>
                                        <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">Use Previous Job</div>
                                            <div className="text-xs md:text-sm text-gray-600">Search from my previous orders</div>
                                        </div>
                                        <div className="text-xs md:text-sm font-medium text-green-600 flex-shrink-0">Free</div>
                                    </div>
                                    
                                    {artworkOption === 'previous' && (
                                        <div className="mt-3 pl-6 md:pl-8">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onJobSearch();
                                                }}
                                                className="p-2 md:p-3 border-2 border-gray-300 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Search className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                                                <span className="text-xs md:text-sm">Search previous jobs</span>
                                            </button>
                                        </div>
                                    )}
                                </div> */}

                {/* Design Service Option */}
                <div
                  className={`border-2 rounded-lg p-3 md:p-4 lg:p-5 cursor-pointer transition-all ${
                    artworkOption === "design"
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => onArtworkOptionChange(position.id, "design")}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${
                        artworkOption === "design"
                          ? "border-cyan-500"
                          : "border-gray-400"
                      }`}
                    >
                      {artworkOption === "design" && (
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <Palette className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">
                        Design Service
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        I need help creating my artwork
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-orange-600 flex-shrink-0">
                      R 250.00
                    </div>
                  </div>

                  {artworkOption === "design" && (
                    <div className="mt-3 pl-6 md:pl-8">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 md:p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Info className="w-3 h-3 md:w-4 md:h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs md:text-sm text-orange-800">
                            <div className="font-medium mb-1">
                              Design Service includes:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                              <li>Professional logo/artwork creation</li>
                              <li>Up to 2 design revisions</li>
                              <li>
                                Optimized for your selected branding method
                              </li>
                              <li>High-resolution files provided</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* ADD COLOR SELECTION FOR DESIGN SERVICE */}
                      {selectedColors.length > 0 && (
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            Colors for Design Application *
                            <span className="block text-xs text-gray-500 font-normal mt-0.5">
                              The design will be created for these selected
                              colors
                            </span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {selectedColors
                              .filter((cq) => cq.quantity > 0)
                              .map((colorQty) => (
                                <div
                                  key={colorQty.colorCode}
                                  className={`p-2 rounded border text-xs ${
                                    position.appliedToColors.includes(
                                      colorQty.colorCode
                                    )
                                      ? "border-cyan-500 bg-cyan-50"
                                      : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div className="font-medium">
                                    {colorQty.colorName}
                                  </div>
                                  <div className="text-gray-500">
                                    Qty: {colorQty.quantity}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {position.appliedToColors.length === 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                Design will be applied to all selected colors
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Design Brief *
                          </label>
                          <textarea
                            value={(config as any)?.designBrief || ""}
                            onChange={(e) =>
                              onConfigUpdate(
                                position.id,
                                "designBrief" as any,
                                e.target.value
                              )
                            }
                            rows={3}
                            className={`w-full px-2 md:px-3 py-1 md:py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs md:text-sm ${
                              !(config as any)?.designBrief?.trim()
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Please describe what you want designed. Include company name, colors, style preferences, text to include, etc."
                          />
                          {!(config as any)?.designBrief?.trim() && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                Design brief is required for design service
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                              Company/Brand Name
                            </label>
                            <input
                              type="text"
                              value={(config as any)?.companyName || ""}
                              onChange={(e) =>
                                onConfigUpdate(
                                  position.id,
                                  "companyName" as any,
                                  e.target.value
                                )
                              }
                              className="w-full px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs md:text-sm"
                              placeholder="Enter company name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                              Industry/Sector
                            </label>
                            <input
                              type="text"
                              value={(config as any)?.industry || ""}
                              onChange={(e) =>
                                onConfigUpdate(
                                  position.id,
                                  "industry" as any,
                                  e.target.value
                                )
                              }
                              className="w-full px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs md:text-sm"
                              placeholder="e.g., Technology, Healthcare"
                            />
                          </div>
                        </div>

                        
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Artwork Display */}
              {config?.artworkFile && artworkOption === "upload" && (
                <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium truncate">
                        {config.artworkFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveArtwork(config.artworkFile!.id)}
                      className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {config.artworkFile.size} • {config.artworkFile.uploadDate}
                  </div>
                </div>
              )}
            </div>

            {/* Branding Configuration Details */}
            {(config?.artworkFile ||
              artworkOption === "previous" ||
              artworkOption === "design") && (
              <div className="space-y-3 md:space-y-4 bg-white rounded-lg p-3 md:p-4 lg:p-5 border border-gray-200">
                {/* Special Instructions */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Special instructions
                  </label>
                  <textarea
                    value={config?.instructions}
                    onChange={(e) =>
                      onConfigUpdate(
                        position.id,
                        "instructions",
                        e.target.value
                      )
                    }
                    rows={2}
                    className="w-full px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs md:text-sm"
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Design Fee Notice */}
                {artworkOption === "design" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium text-orange-800">
                        Design Service Fee: R 250.00 (one-time charge)
                      </span>
                    </div>
                    <div className="text-xs text-orange-700 mt-1">
                      This fee will be added to your order total for
                      professional artwork creation.
                    </div>
                  </div>
                )}

                {position.selectedMethod && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Max size: {position.selectedMethod.maxPrintingSizeWidth}mm x{" "}
                    {position.selectedMethod.maxPrintingSizeHeight}mm | Colors:{" "}
                    {position.selectedMethod.numberOfColours}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
