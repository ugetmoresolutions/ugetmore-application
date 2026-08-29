'use client'

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  ShoppingCart,
  RotateCcw,
  EyeIcon,
  AlertTriangle,
} from "lucide-react";
import { IProduct, BrandingMethod } from "@/interfaces/product/product";
import { pantoneColors, standardColors } from "./colors";
import {
  ArtworkFile,
  BrandingConfig,
  BrandingPosition,
  ColorQuantity,
  IBrandingOption,
} from "@/interfaces/branding/branding";
import { ColorSelection } from "./ColorSelection";
import { BrandingPositionSelector } from "./BrandingPositionSelector";
import { BrandingConfiguration } from "./BrandingConfiguration";
import { ArtworkUpload } from "./ArtworkUpload";
import { JobSearchModal } from "./JobSearchModal";
import { ColorChart } from "./ColorChart";
import { calculateTotalOrderCost } from "./brandingPricing";
import { indexedDBStorage } from "@/utils/indexedDbStorage";
import { BrandingGuideModal } from "./BrandingGuideModal";
import BrandingPreviewModal from "./BrandingPreviewModal";
import { IAddCartItem, ICartItem } from "@/interfaces/cart/cart";
import { v4 as uuidv4 } from "uuid";
import { CART_API } from "@/endpoints/rest-api/cart";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { useSmartAlert } from "@/components/common/SmartAlert";
import { useRouter } from "next/navigation";
import LoaderComponent from "@/components/Loader";
import { useCart } from "@/hooks/cart";

interface EnhancedProduct extends IProduct {
  price?: number;
  calculatedPrice?: number;
}

interface ProductBrandingProps {
  product: EnhancedProduct;
  selectedVariant: number;
  selectedColor?: string;
  onColorChange?: (colorCode: string) => void;
}

const ProductBranding: React.FC<ProductBrandingProps> = ({
  product,
  selectedVariant,
  selectedColor,
  onColorChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorQuantities, setColorQuantities] = useState<ColorQuantity[]>([]);
  const [brandingPositions, setBrandingPositions] = useState<
    BrandingPosition[]
  >([]);
  const [brandingConfigs, setBrandingConfigs] = useState<BrandingConfig[]>([]);
  const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>([]);
  const [brandingPrices, setBrandingPrices] = useState<IBrandingOption[]>([]);
  const [showBrandingPreview, setShowBrandingPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noColorQuantity, setNoColorQuantity] = useState(product?.minimum || 1);
  const loggedInUser = decodeAccessToken();
  const router = useRouter();
  const userId = loggedInUser?.id;
  const { success, error: alertError, AlertComponent } = useSmartAlert();

  const { triggerCartUpdate } = useCart();
  // Modal states
  const [showBrandingGuide, setShowBrandingGuide] = useState(false);
  const [showArtworkUpload, setShowArtworkUpload] = useState(false);
  const [showJobSearch, setShowJobSearch] = useState(false);
  const [showPantoneChart, setShowPantoneChart] = useState(false);
  const [showStandardColors, setShowStandardColors] = useState(false);

  // Search and selection states
  const [currentColorSelection, setCurrentColorSelection] = useState<{
    positionId: string;
    colorId: string;
  } | null>(null);
  const [pantoneSearchTerm, setPantoneSearchTerm] = useState("");
  const [standardColorSearchTerm, setStandardColorSearchTerm] = useState("");
  const [currentUploadingPosition, setCurrentUploadingPosition] =
    useState<string>("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");

  // Load branding prices
  useEffect(() => {
    const loadBrandingPrices = async () => {
      try {
        const cachedBrandingPrices = await indexedDBStorage.getBrandingPrices();
        if (cachedBrandingPrices) {
          setBrandingPrices(cachedBrandingPrices);
        }
      } catch (error) {
        console.error("Error loading branding prices:", error);
      }
    };

    loadBrandingPrices();
  }, []);
  // Initialize color quantities from product data
  useEffect(() => {
    if (product.colourImages && product.colourImages.length > 0) {
      const basePrice =
        product.price ||
        product.calculatedPrice ||
        (product.minimum || 1) * 1.5;
      const quantities = product.colourImages.map((colorImg) => ({
        colorCode: colorImg.code,
        colorName: colorImg.name,
        quantity: product.minimum || 1,
        unitPrice: basePrice,
        images: colorImg.images,
        selected: false,
      }));
      setColorQuantities(quantities);
    }
  }, [
    product.colourImages,
    product.price,
    product.calculatedPrice,
    product.minimum,
  ]);

  // Initialize branding positions from product data
  useEffect(() => {
    if (product.brandings && product.brandings.length > 0) {
      const positions = product.brandings.map((branding, index) => ({
        id: `pos-${index}`,
        name: branding.positionName,
        code: branding.positionCode,
        selected: false,
        methods: branding.method || [],
        selectedMethod: branding.method?.[0],
        appliedToColors: [],
      }));
      setBrandingPositions(positions);
    }
  }, [product.brandings]);

  // UPDATE the handleQuantityChange function:
  const handleQuantityChange = (colorCode: string, newQuantity: number) => {
    // If it's a "no-color" product, update the separate state
    if (colorCode === "no-color") {
      setNoColorQuantity(newQuantity);
    } else {
      // For regular color products, update the colorQuantities
      setColorQuantities((prev) =>
        prev.map((cq) =>
          cq.colorCode === colorCode
            ? {
                ...cq,
                quantity: newQuantity,
              }
            : cq
        )
      );
    }
  };

  const handleColorToggle = (colorCode: string) => {
    setColorQuantities((prev) =>
      prev.map((cq) =>
        cq.colorCode === colorCode ? { ...cq, selected: !cq.selected } : cq
      )
    );
    onColorChange?.(colorCode);
  };

  const handlePositionToggle = (positionId: string) => {
    const position = brandingPositions.find((p) => p.id === positionId);
    const hasColors = colorQuantities.length > 0;

    setBrandingPositions((prev) =>
      prev.map((pos) =>
        pos.id === positionId
          ? {
              ...pos,
              selected: !pos.selected,
              // For products without colors, automatically apply branding when position is selected
              appliedToColors:
                !pos.selected && !hasColors
                  ? ["no-colors"]
                  : pos.appliedToColors,
            }
          : pos
      )
    );

    if (position && !position.selected) {
      const newConfig: BrandingConfig = {
        positionId,
        logoName: "",
        width: "",
        height: "",
        instructions: "",
        appliedColors: hasColors ? [] : ["no-colors"], // Auto-apply for products without colors
        positionInBrandingArea: "",
        artworkColorType: "pantone",
        pantoneColors: [
          {
            id: "1",
            pantoneCode: "",
            exactColor: "",
            standardColor: "",
            selectedColor: "",
          },
        ],
        brandingColors: [""],
        artworkOption: "upload",
        designBrief: "",
        companyName: "",
        industry: "",
        preferredColors: "",
      } as any; // Type assertion needed until interface is updated
      setBrandingConfigs((prev) => [...prev, newConfig]);
    } else {
      setBrandingConfigs((prev) =>
        prev.filter((config) => config.positionId !== positionId)
      );
    }
  };

  const handleMethodSelect = (positionId: string, method: BrandingMethod) => {
    setBrandingPositions((prev) =>
      prev.map((pos) =>
        pos.id === positionId ? { ...pos, selectedMethod: method } : pos
      )
    );
  };

  const handleColorApplyToBranding = (
    positionId: string,
    colorCode: string
  ) => {
    setBrandingPositions((prev) =>
      prev.map((pos) =>
        pos.id === positionId
          ? {
              ...pos,
              appliedToColors: pos.appliedToColors.includes(colorCode)
                ? pos.appliedToColors.filter((c) => c !== colorCode)
                : [...pos.appliedToColors, colorCode],
            }
          : pos
      )
    );

    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? {
              ...config,
              appliedColors: config.appliedColors.includes(colorCode)
                ? config.appliedColors.filter((c) => c !== colorCode)
                : [...config.appliedColors, colorCode],
            }
          : config
      )
    );
  };

  const handleArtworkOptionChange = (
    positionId: string,
    option: "upload" | "previous" | "design"
  ) => {
    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? ({
              ...config,
              artworkOption: option,
              // Clear artwork file if switching away from upload
              ...(option !== "upload" && { artworkFile: undefined }),
            } as any)
          : config
      )
    );

    if (option === "upload") {
      setCurrentUploadingPosition("");
    }
  };

  const handleArtworkUpload = (files: FileList | null) => {
    if (files && files.length > 0 && currentUploadingPosition) {
      const file = files[0];
      const newArtwork: ArtworkFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toLocaleDateString(),
        url: URL.createObjectURL(file),
        positionId: currentUploadingPosition,
      };

      setArtworkFiles((prev) => [...prev, newArtwork]);

      setBrandingConfigs((prev) =>
        prev.map((config) =>
          config.positionId === currentUploadingPosition
            ? { ...config, artworkFile: newArtwork }
            : config
        )
      );

      setShowArtworkUpload(false);
      setCurrentUploadingPosition("");
    }
  };

  const removeArtwork = (artworkId: string) => {
    const artwork = artworkFiles.find((art) => art.id === artworkId);
    if (artwork) {
      setArtworkFiles((prev) => prev.filter((art) => art.id !== artworkId));
      setBrandingConfigs((prev) =>
        prev.map((config) =>
          config.artworkFile?.id === artworkId
            ? { ...config, artworkFile: undefined }
            : config
        )
      );
    }
  };

  const updateBrandingConfig = (
    positionId: string,
    field: keyof BrandingConfig,
    value: any
  ) => {
    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? { ...config, [field]: value }
          : config
      )
    );
  };

  const addPantoneColor = (positionId: string) => {
    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? {
              ...config,
              pantoneColors: [
                ...config.pantoneColors,
                {
                  id: crypto.randomUUID(),
                  pantoneCode: "",
                  exactColor: "",
                  standardColor: "",
                  selectedColor: "",
                },
              ],
            }
          : config
      )
    );
  };

  const updatePantoneColor = (
    positionId: string,
    colorId: string,
    field: string,
    value: string
  ) => {
    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? {
              ...config,
              pantoneColors: config.pantoneColors.map((color) =>
                color.id === colorId ? { ...color, [field]: value } : color
              ),
            }
          : config
      )
    );
  };

  const removePantoneColor = (positionId: string, colorId: string) => {
    setBrandingConfigs((prev) =>
      prev.map((config) =>
        config.positionId === positionId
          ? {
              ...config,
              pantoneColors: config.pantoneColors.filter(
                (color) => color.id !== colorId
              ),
            }
          : config
      )
    );
  };

  const openPantoneChart = (positionId: string, colorId: string) => {
    setCurrentColorSelection({ positionId, colorId });
    setShowPantoneChart(true);
    setPantoneSearchTerm("");
  };

  const openStandardColors = (positionId: string, colorId: string) => {
    setCurrentColorSelection({ positionId, colorId });
    setShowStandardColors(true);
    setStandardColorSearchTerm("");
  };

  const selectPantoneColor = (pantoneCode: string) => {
    if (currentColorSelection) {
      updatePantoneColor(
        currentColorSelection.positionId,
        currentColorSelection.colorId,
        "pantoneCode",
        pantoneCode
      );
      setShowPantoneChart(false);
      setCurrentColorSelection(null);
    }
  };

  const selectStandardColor = (colorCode: string) => {
    if (currentColorSelection) {
      updatePantoneColor(
        currentColorSelection.positionId,
        currentColorSelection.colorId,
        "selectedColor",
        colorCode
      );
      setShowStandardColors(false);
      setCurrentColorSelection(null);
    }
  };

  const openArtworkUpload = (positionId: string) => {
    setCurrentUploadingPosition(positionId);
    setShowArtworkUpload(true);
  };

  const calculateTotalCost = () => {
  // For products without colors, create a temporary ColorQuantity object
  if (colorQuantities.length === 0) {
    const basePrice = product?.price || product?.calculatedPrice || (product?.minimum || 1) * 1.5;
    
    // Create a temporary ColorQuantity object for no-color products
    const noColorQuantityObj: ColorQuantity = {
      colorCode: 'no-color',
      colorName: 'Standard',
      quantity: noColorQuantity,
      unitPrice: basePrice,
      images: product?.images || [],
      selected: true
    };

    return calculateTotalOrderCost(
      [noColorQuantityObj], // Pass as array with the no-color quantity
      brandingPositions,
      brandingConfigs,
      product,
      brandingPrices
    );
  }

  // For products with colors, use the existing logic
  const selectedColors = colorQuantities.filter((cq) => cq.selected);
  return calculateTotalOrderCost(
    selectedColors,
    brandingPositions,
    brandingConfigs,
    product,
    brandingPrices
  );
};
  // Validation function
  const getValidationErrors = () => {
    const errors: string[] = [];
    const selectedColors = colorQuantities.filter((cq) => cq.selected);
    const selectedPositions = brandingPositions.filter((pos) => pos.selected);
    const hasColors = colorQuantities.length > 0;

    // Check if colors are selected (only if the product has colors)
    if (hasColors && selectedColors.length === 0) {
      errors.push("Please select at least one color");
    }

    // Check if positions are selected
    if (selectedPositions.length === 0) {
      errors.push("Please select at least one branding position");
    }

    // Check if methods are selected for all positions
    selectedPositions.forEach((position) => {
      if (!position.selectedMethod) {
        errors.push(`Please select a branding method for ${position.name}`);
      }
    });

    // Check if colors are applied to branding positions (only if product has colors)
    selectedPositions.forEach((position) => {
      if (hasColors && position.appliedToColors.length === 0) {
        errors.push(`Please apply colors to branding for ${position.name}`);
      }
    });

    // Check artwork requirements
    selectedPositions.forEach((position) => {
      const config = brandingConfigs.find((c) => c.positionId === position.id);
      if (!config) {
        errors.push(`Configuration missing for ${position.name}`);
        return;
      }

      const artworkOption = (config as any)?.artworkOption || "upload";

      // Check artwork upload requirement
      if (artworkOption === "upload" && !config.artworkFile) {
        errors.push(`Please upload artwork for ${position.name}`);
      }

      // Check design service requirements
      if (artworkOption === "design") {
        if (!(config as any)?.designBrief?.trim()) {
          errors.push(`Please provide a design brief for ${position.name}`);
        }
      }

      // Logo configuration requirements have been removed - only keeping basic validations
    });

    return errors;
  };

  // UPDATE the effectiveQuantity calculation:
  const selectedColors = colorQuantities.filter((cq) => cq.selected);
  const totalQuantity = selectedColors.reduce(
    (sum, cq) => sum + cq.quantity,
    0
  );
  // For products without colors, use the noColorQuantity state
  const effectiveQuantity =
    colorQuantities.length === 0 ? noColorQuantity : totalQuantity;

  const costBreakdown = calculateTotalCost();
  const validationErrors = getValidationErrors();

  const filteredPantoneColors = pantoneColors.filter(
    (color) =>
      color.code.toLowerCase().includes(pantoneSearchTerm.toLowerCase()) ||
      color.name.toLowerCase().includes(pantoneSearchTerm.toLowerCase())
  );

  const filteredStandardColors = standardColors.filter(
    (color) =>
      color.name
        .toLowerCase()
        .includes(standardColorSearchTerm.toLowerCase()) ||
      color.code.toLowerCase().includes(standardColorSearchTerm.toLowerCase())
  );

  if (!product.brandings || product.brandings.length === 0) {
    return null;
  }
  const getBrandingSetup = () => {
  // For no-color products, create selectedColors array with the no-color quantity
  let selectedColorsForSetup = colorQuantities.filter((cq) => cq.selected);
  
  if (colorQuantities.length === 0) {
    const basePrice = product?.price || product?.calculatedPrice || (product?.minimum || 1) * 1.5;
    selectedColorsForSetup = [{
      colorCode: 'no-color',
      colorName: 'Standard',
      quantity: noColorQuantity,
      unitPrice: basePrice,
      images: product?.images || [],
      selected: true
    }];
  }

  return {
    selectedColors: selectedColorsForSetup,
    selectedPositions: brandingPositions.filter((pos) => pos.selected),
    configurations: brandingConfigs,
    artworkFiles: artworkFiles,
    totalCost: calculateTotalCost(),
  };
};
  const uploadArtworkFiles = async (): Promise<BrandingConfig[]> => {
    const updatedConfigs = [...brandingConfigs];

    for (let i = 0; i < updatedConfigs.length; i++) {
      const config = updatedConfigs[i];

      // Check if this config has an artwork file that needs uploading
      if (config.artworkFile && config.artworkFile.url.startsWith("blob:")) {
        try {
          // Find the original file from artworkFiles
          const artworkFile = artworkFiles.find(
            (art) => art.id === config.artworkFile?.id
          );
          if (artworkFile) {
            // Convert blob URL back to file for upload
            const response = await fetch(artworkFile.url!);
            const blob = await response.blob();
            const file = new File([blob], artworkFile.name, {
              type: artworkFile.type,
            });

            // Create FormData and upload
            const formData = new FormData();
            formData.append("files", file);

            const uploadResponse = await CART_API.UPLOAD_FILE(formData);

            if (uploadResponse?.data && uploadResponse.data.length > 0) {
              const uploadedFile = uploadResponse.data[0];

              // Create updated artwork file with AWS URL
              const updatedArtworkFile = {
                ...config.artworkFile,
                url: uploadedFile.url,
                publicId: uploadedFile.publicId,
              };

              // Update the config with uploaded file info
              updatedConfigs[i] = {
                ...config,
                artworkFile: updatedArtworkFile,
              };

              console.log("Updated artwork file URL:", uploadedFile.url);
              console.log("Updated config artwork file:", updatedArtworkFile);
            } else {
              throw new Error("No upload response received");
            }
          } else {
            throw new Error("Original artwork file not found in state");
          }
        } catch (error) {
          console.error("Error uploading artwork file:", error);
          throw new Error(
            `Failed to upload artwork file: ${config.artworkFile.name} - ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    // Also update the artworkFiles state with the new URLs
    const updatedArtworkFiles = artworkFiles.map((artFile) => {
      const matchingConfig = updatedConfigs.find(
        (config) => config.artworkFile?.id === artFile.id
      );
      if (matchingConfig && matchingConfig.artworkFile) {
        return {
          ...artFile,
          url: matchingConfig.artworkFile.url,
          publicId: matchingConfig.artworkFile.publicId,
        };
      }
      return artFile;
    });

    setArtworkFiles(updatedArtworkFiles);

    return updatedConfigs;
  };

  // Check if all required artwork is uploaded
  const isArtworkRequirementMet = () => {
    const selectedPositions = brandingPositions.filter((pos) => pos.selected);

    return selectedPositions.every((position) => {
      const config = brandingConfigs.find((c) => c.positionId === position.id);
      if (!config) return false;

      // If artwork option is 'upload', then artwork file is required
      if (config.artworkOption === "upload") {
        return config.artworkFile !== undefined;
      }

      // If artwork option is 'design', no file upload is required
      if (config.artworkOption === "design") {
        return true;
      }

      // For 'previous' option, we assume it's valid if selected
      return true;
    });
  };

  const handleAddToCart = async () => {
  if (product) {
    try {
      setIsLoading(true);

      let finalBrandingConfigs = brandingConfigs;

      // If user is logged in, upload artwork files first
      if (userId) {
        finalBrandingConfigs = await uploadArtworkFiles();
        setBrandingConfigs(finalBrandingConfigs);
      }

      // Calculate total quantity
      let totalQuantity = 0;
      
      if (colorQuantities.length === 0) {
        totalQuantity = noColorQuantity;
      } else {
        totalQuantity = colorQuantities
          .filter(cq => cq.selected)
          .reduce((sum, cq) => sum + cq.quantity, 0);
      }

      // FIX: Calculate the CORRECT unit price
      const totalCost = calculateTotalCost();
      
      // Debug logging to understand the calculation
      console.log("PRICING DEBUG:", {
        basePrice: totalCost.basePrice,
        brandingCost: totalCost.brandingCost,
        setupFees: totalCost.setupFees,
        designFees: totalCost.designFees,
        grandTotal: totalCost.grandTotal,
        totalQuantity: totalQuantity,
        calculatedUnitPrice: totalCost.grandTotal / totalQuantity
      });

      // FIX: Store the UNIT price, not the total price
      const unitPrice = totalQuantity > 0 ? totalCost.grandTotal / totalQuantity : totalCost.grandTotal;

      const cartItem: ICartItem = {
        id: uuidv4(),
        product: {
          ...product,
          productName: product.productName,
          categories: product.categories,
          brand: product.brand,
          images: product.images,
          colourImages: product.colourImages,
          variants: product.variants,
          fullCode: product.fullCode,
          simpleCode: product.simpleCode,
        },
        quantity: totalQuantity,
        price: unitPrice, // FIX: Store UNIT price, not total price
        addedAt: new Date().toISOString(),
        brandingConfigs: {
          ...getBrandingSetup(),
          configurations: finalBrandingConfigs,
        },
      };

      // DEBUG: Verify the calculation
      console.log("FINAL CART ITEM VERIFICATION:", {
        storedUnitPrice: unitPrice,
        storedQuantity: totalQuantity,
        calculatedTotal: unitPrice * totalQuantity,
        expectedTotal: totalCost.grandTotal,
        matches: Math.abs((unitPrice * totalQuantity) - totalCost.grandTotal) < 0.01
      });

      if (userId) {
        const addCartData: IAddCartItem = {
          userId: userId,
          item: cartItem,
        };

        const response = await CART_API.ADD_CART_ITEM(addCartData);

        console.log("BRANDED PRODUCT ADDED TO CART:", response.data);

        if (response?.data) {
          success(
            "Added to Cart!",
            `Custom branded product (ZAR ${(unitPrice * totalQuantity).toFixed(2)}) has been added to your cart.`,
            [
              {
                label: "View Cart",
                action: () => router.push("/client/cart"),
                variant: "primary",
              },
              {
                label: "Continue Shopping",
                action: () => {},
                variant: "secondary",
              },
            ]
          );

          triggerCartUpdate();
          router.push("/client/cart");
        } else {
          throw new Error("Failed to add item to cart");
        }
      } else {
        // User not logged in - use localStorage
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        existingCart.push(cartItem);

        success(
          "Added to Cart!",
          `Custom branded product (ZAR ${(unitPrice * totalQuantity).toFixed(2)}) has been added to your cart.`,
          [
            {
              label: "View Cart",
              action: () => router.push("/client/cart"),
              variant: "primary",
            },
            {
              label: "Continue Shopping",
              action: () => {},
              variant: "secondary",
            },
          ]
        );

        localStorage.setItem("cart", JSON.stringify(existingCart));
        triggerCartUpdate();
        router.push("/client/cart");
      }
    } catch (e) {
      console.error("Error adding to cart:", e);
      alertError(
        "Failed to Add Item",
        e instanceof Error && e.message.includes("upload")
          ? e.message
          : "Unable to add item to cart. Please check your connection and try again.",
        [
          {
            label: "Retry",
            action: () => handleAddToCart(),
            variant: "primary",
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  } else {
    alertError(
      "Product Not Found",
      "The selected product could not be found. Please refresh the page and try again."
    );
  }
};

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all duration-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-base sm:text-lg">3</span>
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Add your branding
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Customize your product with logos and artwork
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {effectiveQuantity > 0 && (
            <div className="text-right text-xs sm:text-sm">
              <div className="font-medium text-gray-900">
                {effectiveQuantity} units
              </div>
              <div className="text-gray-500">
                ZAR {costBreakdown.grandTotal.toFixed(2)}
              </div>
              {costBreakdown.brandingCost > 0 && (
                <div className="text-xs text-orange-600 hidden sm:block">
                  +R{costBreakdown.brandingCost.toFixed(2)} branding
                </div>
              )}
              {costBreakdown.setupFees > 0 && (
                <div className="text-xs text-blue-600 hidden sm:block">
                  +R{costBreakdown.setupFees.toFixed(2)} setup
                </div>
              )}
              {costBreakdown.designFees > 0 && (
                <div className="text-xs text-orange-600 hidden sm:block">
                  +R{costBreakdown.designFees} design fees
                </div>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Color Selection Component */}
              <ColorSelection
                colorQuantities={colorQuantities}
                product={product}
                onColorToggle={handleColorToggle}
                onQuantityChange={handleQuantityChange}
                selectedPositions={brandingPositions}
              />

              {/* Branding Position Selector */}
              {(selectedColors.length > 0 || colorQuantities.length === 0) && (
                <BrandingPositionSelector
                  positions={brandingPositions}
                  onPositionToggle={handlePositionToggle}
                />
              )}

              {/* Branding Configuration */}
              {(selectedColors.length > 0 || colorQuantities.length === 0) && (
                <BrandingConfiguration
                  positions={brandingPositions}
                  configs={brandingConfigs}
                  selectedColors={selectedColors}
                  onMethodSelect={handleMethodSelect}
                  onColorApplyToBranding={handleColorApplyToBranding}
                  onConfigUpdate={updateBrandingConfig}
                  onArtworkUpload={openArtworkUpload}
                  onJobSearch={() => setShowJobSearch(true)}
                  onRemoveArtwork={removeArtwork}
                  onOpenPantoneChart={openPantoneChart}
                  onOpenStandardColors={openStandardColors}
                  onAddPantoneColor={addPantoneColor}
                  onUpdatePantoneColor={updatePantoneColor}
                  onRemovePantoneColor={removePantoneColor}
                  onArtworkOptionChange={handleArtworkOptionChange}
                />
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-red-800 mb-1">
                        Please complete the following to add to cart:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-700">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-xl">
                {/* Summary Bar */}
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                      <span className="text-gray-600">
                        {colorQuantities.length === 0
                          ? `Product (no color options) • ${
                              brandingPositions.filter((pos) => pos.selected)
                                .length
                            } position${
                              brandingPositions.filter((pos) => pos.selected)
                                .length !== 1
                                ? "s"
                                : ""
                            }`
                          : `${selectedColors.length} color${
                              selectedColors.length !== 1 ? "s" : ""
                            } • ${
                              brandingPositions.filter((pos) => pos.selected)
                                .length
                            } position${
                              brandingPositions.filter((pos) => pos.selected)
                                .length !== 1
                                ? "s"
                                : ""
                            }`}
                      </span>
                      {effectiveQuantity > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <span className="font-medium text-gray-900">
                            {effectiveQuantity} units • ZAR{" "}
                            {costBreakdown.basePrice.toFixed(2)}
                          </span>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs">
                            {costBreakdown.brandingCost > 0 && (
                              <span className="text-cyan-600 font-medium">
                                Branding: +R
                                {costBreakdown.brandingCost.toFixed(2)}
                              </span>
                            )}
                            {costBreakdown.setupFees > 0 && (
                              <span className="text-blue-600 font-medium">
                                Setup: +R{costBreakdown.setupFees.toFixed(2)}
                              </span>
                            )}
                            {costBreakdown.designFees > 0 && (
                              <span className="text-orange-600 font-medium">
                                Design: +R{costBreakdown.designFees}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                    {/* Left Side - Secondary Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {product.fullBrandingGuide && (
                        <button
                          onClick={() => setShowBrandingGuide(true)}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Branding Guide
                          </span>
                          <span className="sm:hidden">Guide</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Reset color quantities to initial state
                          setColorQuantities((prev) =>
                            prev.map((cq) => ({
                              ...cq,
                              selected: false,
                              quantity: product.minimum || 1,
                            }))
                          );

                          // Reset no-color quantity
                          setNoColorQuantity(product?.minimum || 1);

                          // Reset branding positions to initial state
                          setBrandingPositions((prev) =>
                            prev.map((pos) => ({
                              ...pos,
                              selected: false,
                              appliedToColors: [],
                              selectedMethod: pos.methods?.[0], // Reset to first method
                            }))
                          );

                          // Clear all configurations and files
                          setBrandingConfigs([]);
                          setArtworkFiles([]);

                          // Reset modal states
                          setShowBrandingGuide(false);
                          setShowArtworkUpload(false);
                          setShowJobSearch(false);
                          setShowPantoneChart(false);
                          setShowStandardColors(false);
                          setShowBrandingPreview(false);

                          // Reset selection states
                          setCurrentColorSelection(null);
                          setPantoneSearchTerm("");
                          setStandardColorSearchTerm("");
                          setCurrentUploadingPosition("");
                          setSearchDateFrom("");
                          setSearchDateTo("");
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset Options</span>
                        <span className="sm:hidden">Reset</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowBrandingPreview(true);
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          Preview Branding
                        </span>
                        <span className="sm:hidden">Preview</span>
                      </button>
                    </div>

                    {/* Right Side - Primary Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Price Summary */}
                      {effectiveQuantity > 0 && (
                        <div className="text-center sm:text-right order-2 sm:order-1">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            ZAR {costBreakdown.grandTotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {effectiveQuantity} unit
                            {effectiveQuantity !== 1 ? "s" : ""}
                            {costBreakdown.brandingCost > 0 &&
                              ` + R${costBreakdown.brandingCost.toFixed(
                                2
                              )} branding`}
                            {costBreakdown.setupFees > 0 &&
                              ` + R${costBreakdown.setupFees.toFixed(2)} setup`}
                            {costBreakdown.designFees > 0 &&
                              ` + R${costBreakdown.designFees} design`}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleAddToCart}
                        disabled={validationErrors.length > 0}
                        className={`
        flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg order-1 sm:order-2 w-full sm:w-auto
        ${
          validationErrors.length === 0
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 transform hover:scale-105"
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
        }
    `}
                      >
                        {isLoading ? (
                          <>
                            <LoaderComponent />
                            <span className="hidden sm:inline">Adding...</span>
                            <span className="sm:hidden">Adding...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">
                              Add to Cart
                            </span>
                            <span className="sm:hidden">Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ArtworkUpload
        isOpen={showArtworkUpload}
        onClose={() => {
          setShowArtworkUpload(false);
          setCurrentUploadingPosition("");
        }}
        onUpload={handleArtworkUpload}
      />

      <JobSearchModal
        isOpen={showJobSearch}
        onClose={() => setShowJobSearch(false)}
        searchDateFrom={searchDateFrom}
        searchDateTo={searchDateTo}
        onDateFromChange={setSearchDateFrom}
        onDateToChange={setSearchDateTo}
      />

      <ColorChart
        isOpen={showPantoneChart}
        onClose={() => setShowPantoneChart(false)}
        title="Pantone Colour"
        searchTerm={pantoneSearchTerm}
        onSearchChange={setPantoneSearchTerm}
        colors={filteredPantoneColors}
        onColorSelect={selectPantoneColor}
        description="The below is to give a representation of the Pantone colours available. Please note that Pantone colours may look different on a real product than what you see on your computer monitor. Various factors influence the final appearance of colours on a branded product regardless of calibrated monitors and colour profiles, thus, colour accuracy can't be achieved 100%. As such, please ensure that you have verified the Pantone colour before selecting it below."
      />

      <ColorChart
        isOpen={showStandardColors}
        onClose={() => setShowStandardColors(false)}
        title="Standard Colours"
        searchTerm={standardColorSearchTerm}
        onSearchChange={setStandardColorSearchTerm}
        colors={filteredStandardColors}
        onColorSelect={selectStandardColor}
      />

      {product.fullBrandingGuide && (
        <BrandingGuideModal
          isOpen={showBrandingGuide}
          onClose={() => setShowBrandingGuide(false)}
          guideUrl={product.fullBrandingGuide}
        />
      )}

      <BrandingPreviewModal
        showPreview={showBrandingPreview}
        setShowPreview={setShowBrandingPreview}
        brandingSetup={getBrandingSetup()}
        onConfirm={() => {
          setShowBrandingPreview(false);
        }}
      />
      <AlertComponent />
    </div>
  );
};

export default ProductBranding;
