// components/BrandingDetailsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  FileText,
  Palette,
  MessageSquare,
  MapPin,
  Scissors,
  Type,
  Hash,
  Ruler,
  Info,
  Layers,
  FileImage,
  Upload,
  Box,
} from "lucide-react";

// Updated interfaces based on the new API response structure
export interface ArtworkFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url?: string;
  publicId?: string;
  positionId?: string;
}

export interface BrandingConfig {
  positionId: string;
  logoName: string;
  width: string;
  height: string;
  instructions: string;
  appliedColors: string[];
  positionInBrandingArea: string;
  artworkColorType: string;
  pantoneColors: Array<{
    id: string;
    pantoneCode: string;
    exactColor: string;
    standardColor: string;
    selectedColor: string;
  }>;
  brandingColors: string[];
  artworkOption?: string;
  designBrief?: string;
  companyName?: string;
  industry?: string;
  preferredColors?: string;
  artworkFile?: {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url: string;
    positionId: string;
    publicId: string;
  };
}

export interface BrandingSetup {
  selectedColors: any[];
  selectedPositions: Array<{
    id: string;
    name: string;
    code: string;
    selected: boolean;
    methods: Array<{
      brandingName: string;
      brandingDepartment: string;
      brandingCode: string;
      brandingInclusiveMethod: boolean;
      displayIndex: string;
      maxPrintingSizeWidth: string;
      maxPrintingSizeHeight: string;
      numberOfColours: string;
      brandingMultiplier: number;
      exclusions: any[];
    }>;
    selectedMethod?: {
      brandingName: string;
      brandingDepartment: string;
      brandingCode: string;
      brandingInclusiveMethod: boolean;
      displayIndex: string;
      maxPrintingSizeWidth: string;
      maxPrintingSizeHeight: string;
      numberOfColours: string;
      brandingMultiplier: number;
      exclusions: any[];
    };
    appliedToColors: string[];
  }>;
  configurations: BrandingConfig[];
  artworkFiles?: ArtworkFile[];
  totalCost: {
    basePrice: number;
    brandingCost: number;
    setupFees: number;
    designFees: number;
    grandTotal: number;
  };
}

interface BrandingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandingSetup: BrandingSetup | null;
  productName: string;
  productImages?: any[]; // Add product images prop
}

const BrandingDetailsModal: React.FC<BrandingDetailsModalProps> = ({
  isOpen,
  onClose,
  brandingSetup,
  productName,
  productImages = [],
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [imageSources, setImageSources] = useState<
    {
      url: string;
      type: "uploaded" | "product";
      name: string;
      fileData?: any;
    }[]
  >([]);

  // Process all images when brandingSetup changes
  useEffect(() => {
    if (!brandingSetup) {
      setAllImages([]);
      setImageSources([]);
      return;
    }

    const processedImages: {
      url: string;
      type: "uploaded" | "product";
      name: string;
      fileData?: any;
    }[] = [];

    // Add product images first (config images)
    productImages.forEach((img: any) => {
      if (img.urls && img.urls.length > 0) {
        processedImages.push({
          url: img.urls[0].url,
          type: "product",
          name: img.name || "Product image",
        });
      }
    });

    // Also check for artwork files in configurations
    brandingSetup.configurations?.forEach((config) => {
      if (config.artworkFile && config.artworkFile.url) {
        processedImages.push({
          url: config.artworkFile.url,
          type: "uploaded",
          name: config.artworkFile.name || "Configuration artwork",
          fileData: config.artworkFile,
        });
      }
    });

    console.log("Processed images:", processedImages); // Debug log
    setImageSources(processedImages);
    setAllImages(processedImages.map((img) => img.url));
  }, [brandingSetup, productImages]);

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
    setZoomLevel(1);
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // Handle blob URLs differently
      if (imageUrl.startsWith("blob:")) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Regular URL handling
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const getArtworkColorTypeLabel = (type: string) => {
    switch (type) {
      case "pantone":
        return "Pantone Colors";
      case "marathon":
        return "Marathon Colors";
      case "tone-on-tone":
        return "Tone on Tone";
      case "match-to-artwork":
        return "Match to Artwork";
      default:
        return type;
    }
  };

  const formatFileSize = (size: string) => {
    if (!size) return "Unknown size";
    return size;
  };

  const formatUploadDate = (date: string) => {
    if (!date) return "Unknown date";
    return new Date(date).toLocaleDateString();
  };

  const getPositionName = (positionId: string) => {
    if (!brandingSetup) return positionId;

    const position = brandingSetup.selectedPositions.find(
      (pos) => pos.id === positionId
    );

    return position ? position.name : positionId;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg  bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 40,
              transition: {
                duration: 0.4,
                ease: "easeInOut",
              },
            }}
            transition={{
              duration: 0.5,
              type: "spring",
              damping: 20,
              stiffness: 100,
            }}
            className={`relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 ${
              isFullscreen
                ? "w-full h-full max-w-none max-h-none"
                : "w-full max-w-6xl max-h-[90vh]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-3">
                <Scissors className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-semibold">Branding Details</h2>
                  <p className="text-sm text-white/80">{productName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  {isFullscreen ? (
                    <ZoomOut className="w-5 h-5" />
                  ) : (
                    <ZoomIn className="w-5 h-5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
              {/* Image Gallery */}
              <div className="lg:w-2/3 p-6 border-r border-gray-200">
                <div className="relative h-full flex flex-col">
                  {/* Main Image */}
                  <div className="flex-1 relative overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                    {allImages.length > 0 ? (
                      <motion.div
                        key={selectedImageIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: zoomLevel }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full flex items-center justify-center"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        <img
                          src={allImages[selectedImageIndex]}
                          alt={`Artwork ${selectedImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain cursor-zoom-in"
                          onClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-design.jpg";
                          }}
                        />

                        {/* Image type badge */}
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          {imageSources[selectedImageIndex]?.type ===
                          "uploaded" ? (
                            <Upload className="w-3 h-3" />
                          ) : (
                            <Box className="w-3 h-3" />
                          )}
                          {imageSources[selectedImageIndex]?.type === "uploaded"
                            ? "Uploaded"
                            : "Product"}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                          <p>No images available</p>
                        </div>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {allImages.length > 1 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </motion.button>
                      </>
                    )}

                    {/* Zoom Controls */}
                    {allImages.length > 0 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-2 flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setZoomLevel(Math.max(0.5, zoomLevel - 0.5))
                          }
                          className="p-2 text-gray-700 hover:text-slate-900 transition-colors"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={resetZoom}
                          className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-slate-900 transition-colors"
                        >
                          {Math.round(zoomLevel * 100)}%
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setZoomLevel(Math.min(3, zoomLevel + 0.5))
                          }
                          className="p-2 text-gray-700 hover:text-slate-900 transition-colors"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}

                    {/* Download Button */}
                    {allImages.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          downloadImage(
                            allImages[selectedImageIndex],
                            imageSources[selectedImageIndex]?.name ||
                              `artwork-${selectedImageIndex + 1}`
                          )
                        }
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200 transition-all"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </motion.button>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
                      {allImages.map((image, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setZoomLevel(1);
                          }}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all relative ${
                            selectedImageIndex === index
                              ? "border-slate-900 ring-2 ring-slate-900/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder-thumb.jpg";
                            }}
                          />
                          {/* Thumbnail type indicator */}
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                            {imageSources[index]?.type === "uploaded"
                              ? "U"
                              : "P"}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Branding Details Panel */}
              <div className="lg:w-1/3 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Product Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-5 h-5 text-slate-900" />
                      <h3 className="font-semibold text-gray-800">
                        Product Information
                      </h3>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-2">
                        {productName}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Branded product with custom artwork
                      </p>
                    </div>
                  </div>

                  {/* Product Images */}
                  {productImages && productImages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Box className="w-5 h-5 text-slate-900" />
                        <h3 className="font-semibold text-gray-800">
                          Product Images
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {productImages.map((image, index) => (
                          <div
                            key={index}
                            className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-purple-900 mb-1">
                                  {image.name || "Product Image"}
                                </h4>
                                <p className="text-sm text-purple-800">
                                  {image.type || "Product reference image"}
                                </p>
                              </div>
                              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                Product
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded Artwork Files */}
                  {brandingSetup?.artworkFiles &&
                    brandingSetup.artworkFiles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Upload className="w-5 h-5 text-slate-900" />
                          <h3 className="font-semibold text-gray-800">
                            Uploaded Artwork Files
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {brandingSetup.artworkFiles.map((file, index) => (
                            <div
                              key={file.id}
                              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-blue-900 mb-1">
                                    {file.name || "Unknown file"}
                                  </h4>
                                  <div className="space-y-1 text-sm text-blue-800">
                                    <p>Type: {file.type || "Unknown"}</p>
                                    <p>
                                      Size: {formatFileSize(file.size || "")}
                                    </p>
                                    {file.uploadDate && (
                                      <p>
                                        Uploaded:{" "}
                                        {formatUploadDate(file.uploadDate)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Uploaded
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Branding Positions */}
                  {brandingSetup?.selectedPositions &&
                    brandingSetup.selectedPositions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-slate-900" />
                          <h3 className="font-semibold text-gray-800">
                            Branding Positions
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {brandingSetup.selectedPositions.map(
                            (position, index) => (
                              <div
                                key={position.id}
                                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                              >
                                <h4 className="font-medium text-slate-900 mb-2">
                                  {position.name}
                                </h4>
                                {position.selectedMethod && (
                                  <>
                                    <p className="text-sm text-slate-600">
                                      Method:{" "}
                                      {position.selectedMethod.brandingName}
                                    </p>
                                    {position.selectedMethod
                                      .maxPrintingSizeWidth && (
                                      <p className="text-sm text-slate-600">
                                        Max Size:{" "}
                                        {
                                          position.selectedMethod
                                            .maxPrintingSizeWidth
                                        }{" "}
                                        ×{" "}
                                        {
                                          position.selectedMethod
                                            .maxPrintingSizeHeight
                                        }
                                      </p>
                                    )}
                                    {position.selectedMethod
                                      .numberOfColours && (
                                      <p className="text-sm text-slate-600">
                                        Colors:{" "}
                                        {
                                          position.selectedMethod
                                            .numberOfColours
                                        }
                                      </p>
                                    )}
                                  </>
                                )}
                                {position.appliedToColors &&
                                  position.appliedToColors.length > 0 && (
                                    <p className="text-sm text-slate-600 mt-2">
                                      Applied to:{" "}
                                      {position.appliedToColors.join(", ")}
                                    </p>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Branding Configurations - Enhanced */}
{brandingSetup?.configurations && brandingSetup.configurations.length > 0 && (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Layers className="w-5 h-5 text-slate-900" />
      <h3 className="font-semibold text-gray-800">Branding Configurations</h3>
    </div>
    <div className="space-y-4">
      {brandingSetup.configurations.map((config, index) => (
        <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-green-900 text-lg">
                {getPositionName(config.positionId)}
              </h4>
              <p className="text-green-700 text-sm">
                Configuration for branding position
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {config.artworkOption && (
                <div className={`text-xs px-2 py-1 rounded-full ${
                  config.artworkOption === 'design' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {config.artworkOption === 'design' ? 'Custom Design' : 'Artwork Upload'}
                </div>
              )}
              {config.artworkFile && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Has Artwork File
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Left Column */}
            <div className="space-y-3">
              {config.instructions && config.instructions !== "This is the Special Note To Follow" && (
                <div>
                  <span className="text-green-700 font-medium">Instructions:</span>
                  <p className="text-green-800 mt-1">{config.instructions}</p>
                </div>
              )}

              {config.positionInBrandingArea && (
                <div>
                  <span className="text-green-700 font-medium">Position Details:</span>
                  <p className="text-green-800 mt-1">{config.positionInBrandingArea}</p>
                </div>
              )}

              {config.artworkColorType && (
                <div>
                  <span className="text-green-700 font-medium">Color System:</span>
                  <p className="text-green-800 mt-1">{getArtworkColorTypeLabel(config.artworkColorType)}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {config.appliedColors && config.appliedColors.length > 0 && (
                <div>
                  <span className="text-green-700 font-medium">Applied Colors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {config.appliedColors.map((color, colorIndex) => (
                      <span key={colorIndex} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* {config.brandingColors && config.brandingColors.length > 0 && (
                <div>
                  <span className="text-green-700 font-medium">Branding Colors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {config.brandingColors.map((color, colorIndex) => (
                      <span key={colorIndex} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Pantone Colors */}
          {config.pantoneColors && config.pantoneColors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <span className="text-green-700 font-medium text-sm">Pantone Colors:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {config.pantoneColors.map((pantone, pantoneIndex) => (
                  pantone.pantoneCode && (
                    <div key={pantoneIndex} className="bg-white px-3 py-2 rounded border text-xs flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: pantone.exactColor || pantone.selectedColor || '#fff' }}
                      ></div>
                      <span className="font-medium">{pantone.pantoneCode}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

                  {/* Design Section - When artworkOption is "design" */}
                  {brandingSetup?.configurations &&
                    brandingSetup.configurations.map(
                      (config, index) =>
                        config.artworkOption === "design" && (
                          <div key={`design-${index}`} className="mb-6">
                            <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Design Specifications
                            </h5>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {/* Company Information */}
                                <div className="space-y-3">
                                  {config.companyName && (
                                    <div>
                                      <span className="text-purple-700 font-medium">
                                        Company Name:
                                      </span>
                                      <p className="text-purple-900">
                                        {config.companyName}
                                      </p>
                                    </div>
                                  )}
                                  {config.industry && (
                                    <div>
                                      <span className="text-purple-700 font-medium">
                                        Industry:
                                      </span>
                                      <p className="text-purple-900">
                                        {config.industry}
                                      </p>
                                    </div>
                                  )}
                                  {config.preferredColors && (
                                    <div>
                                      <span className="text-purple-700 font-medium">
                                        Preferred Colors:
                                      </span>
                                      <p className="text-purple-900">
                                        {config.preferredColors}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Design Brief */}
                                <div className="space-y-3">
                                  {config.designBrief && (
                                    <div>
                                      <span className="text-purple-700 font-medium">
                                        Design Brief:
                                      </span>
                                      <p className="text-purple-900">
                                        {config.designBrief}
                                      </p>
                                    </div>
                                  )}
                                  {config.instructions &&
                                    config.instructions !==
                                      "This is the Special Note To Follow" && (
                                      <div>
                                        <span className="text-purple-700 font-medium">
                                          Special Instructions:
                                        </span>
                                        <p className="text-purple-900">
                                          {config.instructions}
                                        </p>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Design Requirements */}
                              <div className="mt-4 p-3 bg-purple-100 rounded border border-purple-300">
                                <p className="text-xs font-medium text-purple-800 mb-2">
                                  Design Requirements:
                                </p>
                                <ul className="text-xs text-purple-700 space-y-1">
                                  <li>• Custom design creation required</li>
                                  <li>
                                    • Design team will create artwork based on
                                    specifications
                                  </li>
                                  <li>
                                    • Client will review and approve design
                                    before production
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                    )}

                  {/* Selected Colors */}
                  {brandingSetup?.selectedColors &&
                    brandingSetup.selectedColors.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="w-5 h-5 text-slate-900" />
                          <h3 className="font-semibold text-gray-800">
                            Selected Colors
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {brandingSetup.selectedColors.map((color, index) => (
                            <div
                              key={index}
                              className="bg-orange-50 rounded-lg p-3 border border-orange-200"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor: color.colorCode || "#ccc",
                                  }}
                                ></div>
                                <span className="font-medium text-orange-900 text-sm">
                                  {color.colorName || `Color ${index + 1}`}
                                </span>
                              </div>
                              <div className="text-xs text-orange-700">
                                {color.quantity && <p>Qty: {color.quantity}</p>}
                                {color.unitPrice && (
                                  <p>Price: ZAR {color.unitPrice.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Pricing Summary */}
                  {brandingSetup?.totalCost && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Hash className="w-5 h-5 text-slate-900" />
                        <h3 className="font-semibold text-gray-800">
                          Pricing Summary
                        </h3>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-indigo-700">Base Price:</span>
                            <span className="text-indigo-900 font-medium">
                              ZAR {brandingSetup.totalCost.basePrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-indigo-700">
                              Branding Cost:
                            </span>
                            <span className="text-indigo-900 font-medium">
                              ZAR{" "}
                              {brandingSetup.totalCost.brandingCost.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-indigo-700">Setup Fees:</span>
                            <span className="text-indigo-900 font-medium">
                              ZAR {brandingSetup.totalCost.setupFees.toFixed(2)}
                            </span>
                          </div>
                          {brandingSetup.totalCost.designFees > 0 && (
                            <div className="flex justify-between">
                              <span className="text-indigo-700">
                                Design Fees:
                              </span>
                              <span className="text-indigo-900 font-medium">
                                ZAR{" "}
                                {brandingSetup.totalCost.designFees.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-indigo-300 pt-2 mt-2">
                            <div className="flex justify-between font-semibold">
                              <span className="text-indigo-900">
                                Grand Total:
                              </span>
                              <span className="text-indigo-900">
                                ZAR{" "}
                                {brandingSetup.totalCost.grandTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Image {selectedImageIndex + 1} of {allImages.length}
                  </span>
                  {allImages.length > 0 && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      {imageSources[selectedImageIndex]?.type === "uploaded" ? (
                        <>
                          <Upload className="w-3 h-3" />
                          Uploaded Artwork
                        </>
                      ) : (
                        <>
                          <Box className="w-3 h-3" />
                          Product Image
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      allImages.forEach((image, index) => {
                        downloadImage(
                          image,
                          imageSources[index]?.name || `artwork-${index + 1}`
                        );
                      });
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-slate-900 transition-colors flex items-center gap-2"
                    disabled={allImages.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Download All Images
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandingDetailsModal;
