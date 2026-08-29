"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { BRANDING_PRODUCT_API } from "@/endpoints/rest-api/branding-product";
import {
  Eye,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { PRODUCT_API } from "@/endpoints/rest-api/product";
import Image from "next/image";

// Image Card Component
const ImageCard = ({
  image,
  type,
  mode,
  onDelete,
  index,
}: {
  image: any;
  type: "existing" | "new";
  mode: Mode;
  onDelete: () => void;
  index: number;
}) => (
  <div className="group relative">
    <div
      className={`
      aspect-square relative rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow
      ${
        type === "new"
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-100 border-gray-200"
      }
    `}
    >
      {image.urls?.[0]?.url || image.previewUrl ? (
        <Image
          src={image.urls?.[0]?.url || image.previewUrl}
          alt={image.name || `Image ${index + 1}`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 200px) 100vw, 200px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-xs">No image</span>
        </div>
      )}

      {mode === "edit" && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {image.isDefault && (
        <div className="absolute top-2 left-2">
          <Badge variant="default" className="text-xs bg-green-600">
            Default
          </Badge>
        </div>
      )}

      {type === "new" && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-90 text-white text-xs py-1 text-center">
          New Upload
        </div>
      )}
    </div>
    <div className="mt-2 text-center">
      <p className="text-xs font-medium text-gray-700 truncate">
        {image.name || `Image ${index + 1}`}
      </p>
      <p className="text-xs text-gray-500">
        {type === "new"
          ? `${(image.size / 1024 / 1024).toFixed(1)} MB`
          : `${image.urls?.[0]?.width || 0} × ${image.urls?.[0]?.height || 0}`}
      </p>
    </div>
  </div>
);

// Color Variant Card Component
const ColorVariantCard = ({
  colorImage,
  mode,
  onDeleteImage,
  colorIndex,
}: {
  colorImage: any;
  mode: Mode;
  onDeleteImage: (imageIndex: number) => void;
  colorIndex: number;
}) => (
  <Card className="bg-white border shadow-sm">
    <CardHeader className="pb-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 rounded-full border-2 border-gray-300"
            style={{
              backgroundColor: getColorHex(colorImage.code),
              borderColor:
                colorImage.code.toLowerCase() === "white"
                  ? "#d1d5db"
                  : "transparent",
            }}
          />
          <div>
            <CardTitle className="text-base">{colorImage.name}</CardTitle>
            <CardDescription>Color Code: {colorImage.code}</CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="ml-2">
          {colorImage.images.length} image
          {colorImage.images.length !== 1 ? "s" : ""}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {colorImage.images.map((image: any, imageIndex: number) => (
          <ImageCard
            key={imageIndex}
            image={image}
            type="existing"
            mode={mode}
            onDelete={() => onDeleteImage(imageIndex)}
            index={imageIndex}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

// New Color Variant Card Component
const NewColorVariantCard = ({
  item,
  mode,
  onUpdate,
  onDelete,
  index,
}: {
  item: any;
  mode: Mode;
  onUpdate: (field: "colorCode" | "colorName", value: string) => void;
  onDelete: () => void;
  index: number;
}) => (
  <Card className="bg-blue-50 border-blue-200 shadow-sm">
    <CardHeader className="pb-3 bg-blue-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-blue-300 bg-white" />
          <div>
            <CardTitle className="text-base text-blue-900">
              {item.colorName || "Unnamed Color"}
            </CardTitle>
            <CardDescription className="text-blue-700">
              Code: {item.colorCode || "Not set"}
            </CardDescription>
          </div>
        </div>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageCard
          image={{
            name: item.file.name,
            previewUrl: item.previewUrl,
            size: item.file.size,
            isDefault: false,
          }}
          type="new"
          mode={mode}
          onDelete={onDelete}
          index={index}
        />
      </div>

      {mode === "edit" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Color Code *
            </label>
            <Select
              value={item.colorCode}
              onValueChange={(value) => onUpdate("colorCode", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color code" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{
                          backgroundColor: getColorHex(option.value),
                          borderColor:
                            option.value.toLowerCase() === "white"
                              ? "#d1d5db"
                              : "transparent",
                        }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Color Name *
            </label>
            <Input
              value={item.colorName}
              onChange={(e) => onUpdate("colorName", e.target.value)}
              placeholder="e.g., Midnight Black, Ocean Blue"
              className="w-full"
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = ({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
    <div className="text-gray-400 mx-auto mb-4">{icon}</div>
    <p className="text-gray-500 text-lg font-medium mb-2">{title}</p>
    <p className="text-gray-400 text-sm mb-4">{description}</p>
    {action}
  </div>
);

// Helper function to get color hex values
const getColorHex = (colorCode: string): string => {
  const colorMap: { [key: string]: string } = {
    white: "#ffffff",
    black: "#000000",
    red: "#dc2626",
    blue: "#2563eb",
    green: "#16a34a",
    yellow: "#ca8a04",
    purple: "#9333ea",
    pink: "#db2777",
    orange: "#ea580c",
    gray: "#6b7280",
    brown: "#78350f",
    navy: "#1e3a8a",
  };

  return colorMap[colorCode.toLowerCase()] || "#6b7280";
};

// Interfaces matching the simplified create form
interface Category {
  name: string;
  path: string;
  code: string;
  image: string;
}

interface Brand {
  name: string;
  brandWebsiteLogo: string;
  code: string;
}

interface ProductImage {
  name: string;
  isDefault: boolean;
  urls: { url: string; width: number; height: number }[];
  hasLogo: boolean;
  angle: string | null;
  type: string;
}

interface ColorImage {
  name: string;
  code: string;
  images: ProductImage[];
}

interface BrandingPosition {
  positionName: string;
  positionCode: string;
  positionComment: string;
  positionMultiplier: number;
  method: BrandingMethod[];
}

interface BrandingMethod {
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
}

interface ProductVariant {
  simpleCode: string;
  fullCode: string;
  codeColour: string;
  codeColourName: string;
  codeSize: string;
  codeSizeName: string;
  categorisedAttribute: any | null;
  packagingAndDimension: PackagingAndDimension;
  productDimension: ProductDimension;
  isLogo24: boolean;
  components: any | null;
}

interface PackagingAndDimension {
  cartonSizeDimensionL: number;
  cartonSizeDimensionW: number;
  cartonSizeDimensionH: number;
  piecesPerCarton: number;
  cartonWeight: number;
}

interface ProductDimension {
  length: number;
  width: number;
  weight: number;
}

// Simplified form state matching the create form
interface BrandingProductFormData {
  // Basic Information
  price: number; // ADDED PRICE FIELD
  simpleCode: string;
  productName: string;
  description: string;

  // Product Details
  material: string;
  feature: string;
  type: string;

  // Inventory & Ordering
  minimum: number;
  maximum: number;
  inventoryType: string;
  madeToOrder: string;

  // Branding & Marketing
  displayCountryOfOrigin: string;
  fullBrandingGuide: string;
  keywords: string;
  tags: string;

  // Branding Features
  decoupled: boolean;
}

// Options Arrays - simplified to match create form
const PRODUCT_TYPE_OPTIONS = [
  { value: "Apparel", label: "Apparel" },
  { value: "Accessories", label: "Accessories" },
  { value: "Stationery", label: "Stationery" },
  { value: "Electronics", label: "Electronics" },
  { value: "Homeware", label: "Homeware" },
  { value: "Promotional", label: "Promotional" },
  { value: "Corporate", label: "Corporate" },
  { value: "Safety", label: "Safety" },
];

const MATERIAL_OPTIONS = [
  { value: "Cotton", label: "Cotton" },
  { value: "Polyester", label: "Polyester" },
  { value: "Plastic", label: "Plastic" },
  { value: "Metal", label: "Metal" },
  { value: "Wood", label: "Wood" },
  { value: "Glass", label: "Glass" },
  { value: "Ceramic", label: "Ceramic" },
  { value: "Composite", label: "Composite" },
  { value: "Other", label: "Other" },
];

const INVENTORY_TYPE_OPTIONS = [
  { value: "Physical", label: "Physical" },
  { value: "Digital", label: "Digital" },
  { value: "Service", label: "Service" },
];

const MADE_TO_ORDER_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "Custom", label: "Custom" },
];

const COLOR_OPTIONS = [
  { value: "BLACK", label: "Black" },
  { value: "RED", label: "Red" },
  { value: "WHITE", label: "White" },
  { value: "BLUE", label: "Blue" },
  { value: "GREEN", label: "Green" },
  { value: "YELLOW", label: "Yellow" },
  { value: "PURPLE", label: "Purple" },
  { value: "PINK", label: "Pink" },
  { value: "ORANGE", label: "Orange" },
  { value: "GRAY", label: "Gray" },
  { value: "BROWN", label: "Brown" },
  { value: "NAVY", label: "Navy" },
];

const SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "XXXL", label: "XXXL" },
  { value: "ONESIZE", label: "One Size" },
];

const BRANDING_METHOD_OPTIONS = [
  { value: "Embroidery", label: "Embroidery" },
  { value: "Screen Print", label: "Screen Print" },
  { value: "Heat Transfer", label: "Heat Transfer" },
  { value: "Digital Print", label: "Digital Print" },
  { value: "Patch", label: "Patch" },
  { value: "Debossing", label: "Debossing" },
  { value: "Embossing", label: "Embossing" },
  { value: "Laser Engraving", label: "Laser Engraving" },
];

const BRANDING_POSITION_OPTIONS = [
  { value: "Front", label: "Front", code: "FRONT" },
  { value: "Back", label: "Back", code: "BACK" },
  { value: "Left Side", label: "Left Side", code: "LEFT" },
  { value: "Right Side", label: "Right Side", code: "RIGHT" },
  { value: "Top", label: "Top", code: "TOP" },
  { value: "Bottom", label: "Bottom", code: "BOTTOM" },
  { value: "Center", label: "Center", code: "CENTER" },
  { value: "Full Area", label: "Full Area", code: "FULL" },
];

const CATEGORY_OPTIONS = [
  { name: "Apparel", path: "clothing/apparel", code: "APP", image: "" },
  { name: "Accessories", path: "accessories", code: "ACC", image: "" },
  { name: "Stationery", path: "office/stationery", code: "STN", image: "" },
  { name: "Electronics", path: "electronics", code: "ELEC", image: "" },
  { name: "Homeware", path: "homeware", code: "HOME", image: "" },
  { name: "Promotional", path: "promotional", code: "PROMO", image: "" },
  { name: "Safety", path: "safety", code: "SAFE", image: "" },
  { name: "Corporate", path: "corporate", code: "CORP", image: "" },
];

type Mode = "view" | "edit";

export function BrandingProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = params.id as string;

  const urlMode = searchParams.get("mode") as Mode;
  const [mode, setMode] = useState<Mode>(urlMode || "view");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Image states
  const [mainImages, setMainImages] = useState<File[]>([]);
  const [colorImages, setColorImages] = useState<
    { file: File; colorCode: string; colorName: string; previewUrl: string }[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<Brand>({
    name: "",
    brandWebsiteLogo: "",
    code: "",
  });
  const [brandings, setBrandings] = useState<BrandingPosition[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [existingColorImages, setExistingColorImages] = useState<ColorImage[]>(
    []
  );

  // Simplified form state
  const [formData, setFormData] = useState<BrandingProductFormData>({
    // Basic Information
    price: 0, // ADDED PRICE FIELD
    simpleCode: "",
    productName: "",
    description: "",

    // Product Details
    material: "Other",
    feature: "",
    type: "Apparel",

    // Inventory & Ordering
    minimum: 1,
    maximum: 100,
    inventoryType: "Physical",
    madeToOrder: "No",

    // Branding & Marketing
    displayCountryOfOrigin: "",
    fullBrandingGuide: "",
    keywords: "",
    tags: "",

    // Branding Features
    decoupled: false,
  });

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setIsFetching(true);
      const response = await BRANDING_PRODUCT_API.GET_BRANDING_PRODUCT_BY_ID(
        parseInt(productId)
      );

      if (response.error) {
        throw new Error(response.message);
      }

      const product = response.data;

      // Map the API response to simplified form data
      setFormData({
        price: product.price || 0, // ADDED PRICE FIELD
        simpleCode: product.simpleCode || "",
        productName: product.productName || "",
        description: product.description || "",
        material: product.material || "Other",
        feature: product.feature || "",
        type: product.type || "Apparel",
        minimum: product.minimum || 1,
        maximum: product.maximum || 100,
        inventoryType: product.inventoryType || "Physical",
        madeToOrder: product.madeToOrder || "No",
        displayCountryOfOrigin: product.displayCountryOfOrigin || "",
        fullBrandingGuide: product.fullBrandingGuide || "",
        keywords: product.keywords || "",
        tags: product.tags || "",
        decoupled: product.decoupled || false,
      });

      // Set complex objects
      setCategories(product.categories || []);
      setBrand(product.brand || { name: "", brandWebsiteLogo: "", code: "" });
      setBrandings((product.brandings as BrandingPosition[]) || []);
      setVariants(product.variants || []);
      setExistingImages(product.images || []);
      setExistingColorImages(product.colourImages || []);
    } catch (error: any) {
      toast.error(`Failed to fetch product: ${error.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  // Add these functions inside your BrandingProductDetailPage component:

  // Update existing color variant
  const updateExistingColorVariant = (
    colorIndex: number,
    field: "colorCode" | "colorName",
    value: string
  ) => {
    setExistingColorImages((prev) =>
      prev.map((colorImage, index) =>
        index === colorIndex
          ? {
              ...colorImage,
              [field === "colorCode" ? "code" : "name"]: value,
            }
          : colorImage
      )
    );
  };

  // Remove entire color variant
  const removeExistingColorVariant = (colorIndex: number) => {
    setExistingColorImages((prev) =>
      prev.filter((_, index) => index !== colorIndex)
    );
  };

  // Add more images to existing color variant
  const addImagesToExistingColorVariant = async (
    colorIndex: number,
    files: File[]
  ) => {
    try {
      const uploadedUrls = await uploadImagesAndGetUrls(files);

      const newImages = uploadedUrls.map((img, index) => ({
        name: `color-image-${Date.now()}-${index}`,
        isDefault: false,
        urls: [{ url: img.url, width: 800, height: 600 }],
        hasLogo: false,
        angle: null,
        type: "color",
      }));

      setExistingColorImages((prev) =>
        prev.map((colorImage, index) =>
          index === colorIndex
            ? {
                ...colorImage,
                images: [...colorImage.images, ...newImages],
              }
            : colorImage
        )
      );

      toast.success(`${files.length} image(s) added to color variant`);
    } catch (error: any) {
      toast.error(`Failed to add images: ${error.message}`);
    }
  };

  // Input handlers
  const handleInputChange = (
    field: keyof BrandingProductFormData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle number input changes - UPDATED FOR DECIMAL SUPPORT
  const handleNumberChange = (
    field: keyof BrandingProductFormData,
    value: string
  ) => {
    if (value === "") {
      // Set to 0 when field is cleared
      setFormData((prev) => ({
        ...prev,
        [field]: 0,
      }));
    } else {
      if (field === "price") {
        // For price, allow decimals
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setFormData((prev) => ({
            ...prev,
            [field]: numValue,
          }));
        }
      } else {
        // For other numbers, use integers
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          setFormData((prev) => ({
            ...prev,
            [field]: numValue,
          }));
        }
      }
    }
  };

  const handleBrandChange = (field: keyof Brand, value: string) => {
    setBrand((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCategory = (category: Category) => {
    if (!categories.find((cat) => cat.code === category.code)) {
      setCategories((prev) => [...prev, category]);
    }
  };

  const removeCategory = (categoryCode: string) => {
    setCategories((prev) => prev.filter((cat) => cat.code !== categoryCode));
  };

  const addBrandingPosition = () => {
    const newBranding: BrandingPosition = {
      positionName: "",
      positionCode: "",
      positionComment: "",
      positionMultiplier: 1,
      method: [],
    };
    setBrandings((prev) => [...prev, newBranding]);
  };

  const updateBrandingPosition = (
    index: number,
    field: keyof BrandingPosition,
    value: any
  ) => {
    setBrandings((prev) =>
      prev.map((branding, i) =>
        i === index ? { ...branding, [field]: value } : branding
      )
    );
  };

  const removeBrandingPosition = (index: number) => {
    setBrandings((prev) => prev.filter((_, i) => i !== index));
  };

  const addBrandingMethod = (brandingIndex: number) => {
    const newMethod: BrandingMethod = {
      brandingName: "",
      brandingDepartment: "",
      brandingCode: "",
      brandingInclusiveMethod: false,
      displayIndex: "1",
      maxPrintingSizeWidth: "",
      maxPrintingSizeHeight: "",
      numberOfColours: "",
      brandingMultiplier: 1,
      exclusions: [],
    };

    setBrandings((prev) =>
      prev.map((branding, i) =>
        i === brandingIndex
          ? { ...branding, method: [...branding.method, newMethod] }
          : branding
      )
    );
  };

  const updateBrandingMethod = (
    brandingIndex: number,
    methodIndex: number,
    field: keyof BrandingMethod,
    value: any
  ) => {
    setBrandings((prev) =>
      prev.map((branding, i) =>
        i === brandingIndex
          ? {
              ...branding,
              method: branding.method.map((method, j) =>
                j === methodIndex ? { ...method, [field]: value } : method
              ),
            }
          : branding
      )
    );
  };

  const removeBrandingMethod = (brandingIndex: number, methodIndex: number) => {
    setBrandings((prev) =>
      prev.map((branding, i) =>
        i === brandingIndex
          ? {
              ...branding,
              method: branding.method.filter((_, j) => j !== methodIndex),
            }
          : branding
      )
    );
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      simpleCode: "",
      fullCode: "",
      codeColour: "",
      codeColourName: "",
      codeSize: "",
      codeSizeName: "",
      categorisedAttribute: null,
      packagingAndDimension: {
        cartonSizeDimensionL: 0,
        cartonSizeDimensionW: 0,
        cartonSizeDimensionH: 0,
        piecesPerCarton: 0,
        cartonWeight: 0,
      },
      productDimension: {
        length: 0,
        width: 0,
        weight: 0,
      },
      isLogo24: false,
      components: null,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const updateVariantPackaging = (
    variantIndex: number,
    field: keyof PackagingAndDimension,
    value: number
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              packagingAndDimension: {
                ...variant.packagingAndDimension,
                [field]: value,
              },
            }
          : variant
      )
    );
  };

  const updateVariantDimension = (
    variantIndex: number,
    field: keyof ProductDimension,
    value: number
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              productDimension: { ...variant.productDimension, [field]: value },
            }
          : variant
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Image handlers
  const handleMainImageUpload = (files: File[]) => {
    setMainImages((prev) => [...prev, ...files]);
  };

  const handleColorImageUpload = (files: File[]) => {
    const newColorImages = files.map((file) => ({
      file,
      colorCode: "",
      colorName: "",
      previewUrl: URL.createObjectURL(file),
    }));
    setColorImages((prev) => [...prev, ...newColorImages]);
  };

  const removeMainImage = (index: number) => {
    setMainImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingColorImage = (colorIndex: number, imageIndex: number) => {
    setExistingColorImages((prev) =>
      prev
        .map((colorImage, ci) =>
          ci === colorIndex
            ? {
                ...colorImage,
                images: colorImage.images.filter((_, ii) => ii !== imageIndex),
              }
            : colorImage
        )
        .filter((colorImage) => colorImage.images.length > 0)
    );
  };

  const updateColorImage = (
    index: number,
    field: "colorCode" | "colorName",
    value: string
  ) => {
    setColorImages((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeColorImage = (index: number) => {
    if (colorImages[index].previewUrl) {
      URL.revokeObjectURL(colorImages[index].previewUrl);
    }
    setColorImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images and get URLs
  const uploadImagesAndGetUrls = async (files: File[]): Promise<any[]> => {
    if (files.length === 0) return [];

    try {
      const response = await PRODUCT_API.UPLOAD_PRODUCT_IMAGES(files);

      if (response.error) {
        throw new Error(response.message);
      }

      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  };

  // Form submission for update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Upload new images if any
      let uploadedMainImageUrls: any[] = [];
      let uploadedColorImageUrls: any[] = [];

      if (mainImages.length > 0) {
        uploadedMainImageUrls = await uploadImagesAndGetUrls(mainImages);
        toast.success(
          `${mainImages.length} main image(s) uploaded successfully`
        );
      }

      if (colorImages.length > 0) {
        const colorFiles = colorImages.map((item) => item.file);
        const colorUrls = await uploadImagesAndGetUrls(colorFiles);

        uploadedColorImageUrls = colorImages.map((item, index) => ({
          ...item,
          url: colorUrls[index]?.url || "",
        }));

        toast.success(
          `${colorImages.length} color image(s) uploaded successfully`
        );
      }

      // Combine existing images with new ones
      const allImages = [
        ...existingImages,
        ...uploadedMainImageUrls.map((img, index) => ({
          name: `image-${Date.now()}-${index}`,
          isDefault: index === 0 && existingImages.length === 0,
          urls: [{ url: img.url, width: 800, height: 600 }],
          hasLogo: false,
          angle: null,
          type: "main",
        })),
      ];

      const allColorImages = [
        ...existingColorImages,
        ...uploadedColorImageUrls.map((item, index) => ({
          name: item.colorName || item.colorCode,
          code: item.colorCode,
          images: [
            {
              name: item.colorCode,
              isDefault: true,
              urls: [{ url: item.url, width: 800, height: 600 }],
              hasLogo: false,
              angle: null,
              type: "color",
            },
          ],
        })),
      ];

      // Prepare update data matching the simplified structure
      const updateData = {
        actionType: 1,
        gender: "",
        fit: "",
        price: formData.price, // ADDED PRICE FIELD
        simpleCode: formData.simpleCode,
        fullCode: formData.simpleCode,
        categorisedAttribute: [],
        material: formData.material,
        feature: formData.feature,
        categories,
        brand,
        companionCodes: [],
        relatedCodes: [],
        matchingCodes: [],
        groupingCodes: [],
        groupingCodeGiftsets: [],
        productName: formData.productName,
        description: formData.description,
        minimum: formData.minimum,
        maximum: formData.maximum,
        incrementedBy: 1,
        keywords: formData.keywords,
        tags: formData.tags,
        inventoryType: formData.inventoryType,
        behaviour: "Standard",
        madeToOrder: formData.madeToOrder,
        madeToOrderMessage: "",
        displayCountryOfOrigin: formData.displayCountryOfOrigin,
        promotion: "",
        fullBrandingGuide: formData.fullBrandingGuide,
        logo24BrandingGuide: null,
        images: allImages,
        colourImages: allColorImages,
        brandings,
        isLogo24: false,
        logo24Branding: null,
        inclusiveBranding: [],
        variants,
        requiredBrandingPositions: [],
        noCoBrandingPositions: [],
        brandingTemplates: [],
        decoupled: formData.decoupled,
        type: formData.type,
      };

      const response = await BRANDING_PRODUCT_API.UPDATE_BRANDING_PRODUCT(
        parseInt(productId),
        updateData
      );

      if (response.error) {
        throw new Error(response.message);
      }

      toast.success("Product updated successfully!");
      setMode("view");
      fetchProductData();
    } catch (error: any) {
      toast.error(`Failed to update product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields: (keyof BrandingProductFormData)[] = [
      "price", // ADDED PRICE TO REQUIRED FIELDS
      "simpleCode",
      "productName",
      "description",
      "material",
      "type",
      "inventoryType",
      "displayCountryOfOrigin",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return false;
      }
    }

    // Add price-specific validation
    if (formData.price < 0) {
      toast.error("Price must be a positive number");
      return false;
    }

    if (categories.length === 0) {
      toast.error("At least one category is required");
      return false;
    }

    if (formData.minimum < 1) {
      toast.error("Minimum order must be at least 1");
      return false;
    }

    if (formData.maximum < formData.minimum) {
      toast.error("Maximum order must be greater than minimum order");
      return false;
    }

    return true;
  };

  const handleCancel = () => {
    setMode("view");
    fetchProductData();
  };

  // Helper function to render fields consistently
  const renderField = (
    field: keyof BrandingProductFormData,
    label: string,
    renderEdit: () => React.ReactNode,
    renderView?: () => React.ReactNode
  ) => {
    if (mode === "edit") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {renderEdit()}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2 min-h-[40px] flex items-center">
          {renderView ? renderView() : formData[field] || "N/A"}
        </div>
      </div>
    );
  };

  const renderBrandField = (
    field: keyof Brand,
    label: string,
    renderEdit: () => React.ReactNode,
    renderView?: () => React.ReactNode
  ) => {
    if (mode === "edit") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {renderEdit()}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2 min-h-[40px] flex items-center">
          {renderView ? renderView() : brand[field] || "N/A"}
        </div>
      </div>
    );
  };

  const renderSwitchField = (
    field: keyof BrandingProductFormData,
    label: string,
    description: string
  ) => {
    if (mode === "edit") {
      return (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <label className="text-base font-medium">{label}</label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch
            checked={formData[field] as boolean}
            onCheckedChange={(checked) => handleInputChange(field, checked)}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">{label}</label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant={formData[field] ? "default" : "secondary"}>
          {formData[field] ? "Yes" : "No"}
        </Badge>
      </div>
    );
  };

  // Image Preview Component
  const ImagePreview = ({
    image,
    onDelete,
    isDeletable = false,
    showInfo = false,
  }: {
    image: any;
    onDelete?: () => void;
    isDeletable?: boolean;
    showInfo?: boolean;
  }) => (
    <div className="relative group border rounded-lg overflow-hidden bg-gray-100">
      <div className="aspect-square relative">
        {image.urls?.[0]?.url ? (
          <Image
            src={image.urls[0].url}
            alt={image.name}
            fill
            className="object-cover"
            sizes="(max-width: 200px) 100vw, 200px"
          />
        ) : image.previewUrl ? (
          <Image
            src={image.previewUrl}
            alt={image.name}
            fill
            className="object-cover"
            sizes="(max-width: 200px) 100vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {isDeletable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="p-2 bg-white border-t">
          <p className="text-xs font-medium truncate">{image.name}</p>
          {image.isDefault && (
            <Badge variant="secondary" className="text-xs mt-1">
              Default
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  if (isFetching) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products/branding">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "view" ? "Product Details" : "Edit Product"}
            </h1>
            <p className="text-gray-600 mt-1">
              {formData.productName} • {formData.simpleCode}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {mode === "view" ? (
            <Button
              onClick={() => setMode("edit")}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white">
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className="data-[state=active]:bg-white"
            >
              Branding
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="data-[state=active]:bg-white"
            >
              Images
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="data-[state=active]:bg-white"
            >
              Variants
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab - Simplified */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">Basic Information</CardTitle>
                <CardDescription>
                  Essential details for your branding product
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField("simpleCode", "Product Code", () => (
                    <Input
                      placeholder="BP001"
                      value={formData.simpleCode}
                      onChange={(e) =>
                        handleInputChange("simpleCode", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}

                  {renderField("productName", "Product Name", () => (
                    <Input
                      placeholder="Premium Product"
                      value={formData.productName}
                      onChange={(e) =>
                        handleInputChange("productName", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}

                  {/* ADDED PRICE FIELD */}
                  {renderField(
                    "price",
                    "Price *",
                    () => (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price === 0 ? "" : formData.price}
                        onChange={(e) =>
                          handleNumberChange("price", e.target.value)
                        }
                        className="w-full"
                      />
                    ),
                    () => (
                      <div className="flex items-center">
                        <span className="text-green-600 font-semibold">
                          R {formData.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    )
                  )}

                  {renderField("type", "Product Type", () => (
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}

                  {renderField("material", "Material", () => (
                    <Select
                      value={formData.material}
                      onValueChange={(value) =>
                        handleInputChange("material", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {MATERIAL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}

                  {renderField("inventoryType", "Inventory Type", () => (
                    <Select
                      value={formData.inventoryType}
                      onValueChange={(value) =>
                        handleInputChange("inventoryType", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select inventory type" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {INVENTORY_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}

                  {renderField("madeToOrder", "Made to Order", () => (
                    <Select
                      value={formData.madeToOrder}
                      onValueChange={(value) =>
                        handleInputChange("madeToOrder", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {MADE_TO_ORDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                {renderField("feature", "Product Features", () => (
                  <Input
                    placeholder="Key features and specifications"
                    value={formData.feature}
                    onChange={(e) =>
                      handleInputChange("feature", e.target.value)
                    }
                    className="w-full"
                  />
                ))}

                {renderField(
                  "description",
                  "Description",
                  () => (
                    <Textarea
                      placeholder="Describe your product..."
                      className="min-h-[120px] w-full"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  ),
                  () => (
                    <div className="whitespace-pre-wrap text-gray-900">
                      {formData.description}
                    </div>
                  )
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField("minimum", "Minimum Order", () => (
                    <Input
                      type="number"
                      value={formData.minimum === 0 ? "" : formData.minimum}
                      onChange={(e) =>
                        handleNumberChange("minimum", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}

                  {renderField("maximum", "Maximum Order", () => (
                    <Input
                      type="number"
                      value={formData.maximum === 0 ? "" : formData.maximum}
                      onChange={(e) =>
                        handleNumberChange("maximum", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField(
                    "displayCountryOfOrigin",
                    "Country of Origin",
                    () => (
                      <Input
                        placeholder="South Africa"
                        value={formData.displayCountryOfOrigin}
                        onChange={(e) =>
                          handleInputChange(
                            "displayCountryOfOrigin",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    )
                  )}

                  {renderField(
                    "fullBrandingGuide",
                    "Branding Guide URL",
                    () => (
                      <Input
                        type="url"
                        placeholder="https://example.com/branding-guide.pdf"
                        value={formData.fullBrandingGuide}
                        onChange={(e) =>
                          handleInputChange("fullBrandingGuide", e.target.value)
                        }
                        className="w-full"
                      />
                    ),
                    () =>
                      formData.fullBrandingGuide ? (
                        <a
                          href={formData.fullBrandingGuide}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Branding Guide
                        </a>
                      ) : (
                        "N/A"
                      )
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField(
                    "keywords",
                    "Keywords",
                    () => (
                      <Input
                        placeholder="branding, custom, product"
                        value={formData.keywords}
                        onChange={(e) =>
                          handleInputChange("keywords", e.target.value)
                        }
                        className="w-full"
                      />
                    ),
                    () => (
                      <div className="flex flex-wrap gap-1">
                        {formData.keywords.split(",").map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    )
                  )}

                  {renderField(
                    "tags",
                    "Tags",
                    () => (
                      <Input
                        placeholder="brandable,customizable,premium"
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange("tags", e.target.value)
                        }
                        className="w-full"
                      />
                    ),
                    () => (
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {renderSwitchField(
                  "decoupled",
                  "Decoupled Product",
                  "Product can be sold separately from branding"
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rest of the tabs remain the same... */}
          <TabsContent value="branding" className="space-y-6">
            {/* Brand Information */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">Brand Information</CardTitle>
                <CardDescription>
                  Brand details for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderBrandField("name", "Brand Name", () => (
                    <Input
                      placeholder="Your Brand"
                      value={brand.name}
                      onChange={(e) =>
                        handleBrandChange("name", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}

                  {renderBrandField("code", "Brand Code", () => (
                    <Input
                      placeholder="BR001"
                      value={brand.code}
                      onChange={(e) =>
                        handleBrandChange("code", e.target.value)
                      }
                      className="w-full"
                    />
                  ))}

                  {renderBrandField(
                    "brandWebsiteLogo",
                    "Brand Website Logo URL",
                    () => (
                      <Input
                        type="url"
                        placeholder="https://example.com/logo.jpg"
                        value={brand.brandWebsiteLogo}
                        onChange={(e) =>
                          handleBrandChange("brandWebsiteLogo", e.target.value)
                        }
                        className="w-full"
                      />
                    ),
                    () =>
                      brand.brandWebsiteLogo ? (
                        <a
                          href={brand.brandWebsiteLogo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Logo
                        </a>
                      ) : (
                        "N/A"
                      )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">Categories</CardTitle>
                <CardDescription>
                  Product categories and classification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {mode === "edit" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Add Category
                    </label>
                    <Select
                      onValueChange={(value) => {
                        const category = CATEGORY_OPTIONS.find(
                          (cat) => cat.code === value
                        );
                        if (category) addCategory(category);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.name} ({option.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {categories.length > 0 ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Selected Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {category.name}
                          {mode === "edit" && (
                            <button
                              type="button"
                              onClick={() => removeCategory(category.code)}
                              className="hover:text-destructive ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No categories selected
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branding Positions */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Branding Positions
                    </CardTitle>
                    <CardDescription>
                      Define branding positions and methods
                    </CardDescription>
                  </div>
                  {mode === "edit" && (
                    <Button
                      type="button"
                      onClick={addBrandingPosition}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Position
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {brandings.length > 0 ? (
                  brandings.map((branding, brandingIndex) => (
                    <div
                      key={brandingIndex}
                      className="border rounded-lg p-6 space-y-6 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">
                          Branding Position {brandingIndex + 1}
                        </h4>
                        {mode === "edit" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeBrandingPosition(brandingIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mode === "edit" ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Position Name
                              </label>
                              <Select
                                value={branding.positionName}
                                onValueChange={(value) => {
                                  const position =
                                    BRANDING_POSITION_OPTIONS.find(
                                      (pos) => pos.value === value
                                    );
                                  updateBrandingPosition(
                                    brandingIndex,
                                    "positionName",
                                    value
                                  );
                                  if (position) {
                                    updateBrandingPosition(
                                      brandingIndex,
                                      "positionCode",
                                      position.code
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                  {BRANDING_POSITION_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Position Code
                              </label>
                              <Input
                                value={branding.positionCode}
                                onChange={(e) =>
                                  updateBrandingPosition(
                                    brandingIndex,
                                    "positionCode",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium">
                                Position Comment
                              </label>
                              <Input
                                value={branding.positionComment}
                                onChange={(e) =>
                                  updateBrandingPosition(
                                    brandingIndex,
                                    "positionComment",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Position Multiplier
                              </label>
                              <Input
                                type="number"
                                step="0.1"
                                value={branding.positionMultiplier}
                                onChange={(e) =>
                                  updateBrandingPosition(
                                    brandingIndex,
                                    "positionMultiplier",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Position Name
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {branding.positionName || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Position Code
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {branding.positionCode || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Position Comment
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {branding.positionComment || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Position Multiplier
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {branding.positionMultiplier}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Branding Methods */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-lg">
                            Branding Methods
                          </h5>
                          {mode === "edit" && (
                            <Button
                              type="button"
                              onClick={() => addBrandingMethod(brandingIndex)}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Method
                            </Button>
                          )}
                        </div>

                        {branding.method.length > 0 ? (
                          branding.method.map((method, methodIndex) => (
                            <div
                              key={methodIndex}
                              className="border rounded p-6 space-y-4 bg-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <h6 className="font-medium text-base">
                                  Method {methodIndex + 1}
                                </h6>
                                {mode === "edit" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      removeBrandingMethod(
                                        brandingIndex,
                                        methodIndex
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {mode === "edit" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Branding Name
                                    </label>
                                    <Select
                                      value={method.brandingName}
                                      onValueChange={(value) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "brandingName",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select method" />
                                      </SelectTrigger>
                                      <SelectContent className="w-full">
                                        {BRANDING_METHOD_OPTIONS.map(
                                          (option) => (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Branding Department
                                    </label>
                                    <Input
                                      value={method.brandingDepartment}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "brandingDepartment",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Branding Code
                                    </label>
                                    <Input
                                      value={method.brandingCode}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "brandingCode",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Display Index
                                    </label>
                                    <Input
                                      value={method.displayIndex}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "displayIndex",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Max Width
                                    </label>
                                    <Input
                                      value={method.maxPrintingSizeWidth}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "maxPrintingSizeWidth",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Max Height
                                    </label>
                                    <Input
                                      value={method.maxPrintingSizeHeight}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "maxPrintingSizeHeight",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Number of Colors
                                    </label>
                                    <Input
                                      value={method.numberOfColours}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "numberOfColours",
                                          e.target.value
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Branding Multiplier
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={method.brandingMultiplier}
                                      onChange={(e) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "brandingMultiplier",
                                          parseFloat(e.target.value)
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2 md:col-span-2">
                                    <Switch
                                      checked={method.brandingInclusiveMethod}
                                      onCheckedChange={(checked) =>
                                        updateBrandingMethod(
                                          brandingIndex,
                                          methodIndex,
                                          "brandingInclusiveMethod",
                                          checked
                                        )
                                      }
                                    />
                                    <label className="text-sm font-medium">
                                      Branding Inclusive Method
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Branding Name
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.brandingName || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Branding Department
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.brandingDepartment || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Branding Code
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.brandingCode || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Display Index
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.displayIndex || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Max Width
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.maxPrintingSizeWidth || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Max Height
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.maxPrintingSizeHeight || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Number of Colors
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.numberOfColours || "N/A"}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Branding Multiplier
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.brandingMultiplier}
                                    </div>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Branding Inclusive Method
                                    </label>
                                    <div className="text-base text-gray-900 bg-white rounded-lg px-3 py-2">
                                      {method.brandingInclusiveMethod
                                        ? "Yes"
                                        : "No"}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                            No branding methods added
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                    No branding positions configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab - SIMPLIFIED LIKE CREATE FORM */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload product images and color variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Main Product Images</h3>
                    <div className="text-sm text-muted-foreground">
                      {existingImages.length + mainImages.length} / 10 images
                    </div>
                  </div>

                  {existingImages.length === 0 && mainImages.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No main images uploaded yet
                      </p>
                      {mode === "edit" && (
                        <FileUpload
                          files={mainImages}
                          onFilesChange={handleMainImageUpload}
                          disabled={isLoading}
                          accept="image/*"
                          multiple={true}
                          maxFiles={10}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingImages.map((image, index) => (
                          <div
                            key={`existing-${index}`}
                            className="relative group border rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.urls?.[0]?.url}
                              alt={image.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              {mode === "edit" && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeExistingImage(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="p-2">
                              <p
                                className="text-xs truncate"
                                title={image.name}
                              >
                                {image.name}
                              </p>
                              {image.isDefault && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* New Images */}
                        {mainImages.map((file, index) => (
                          <div
                            key={`new-${index}`}
                            className="relative group border rounded-lg overflow-hidden"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              {mode === "edit" && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeMainImage(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs truncate" title={file.name}>
                                {file.name}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs mt-1 bg-blue-50"
                              >
                                New
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {/* Add more images button */}
                        {mode === "edit" &&
                          existingImages.length + mainImages.length < 10 && (
                            <div
                              className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-primary transition-colors"
                              onClick={() =>
                                document
                                  .getElementById("main-file-upload")
                                  ?.click()
                              }
                            >
                              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center">
                                Add More Images
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Hidden file input for adding more images */}
                      {mode === "edit" && (
                        <div className="hidden">
                          <FileUpload
                            id="main-file-upload"
                            files={mainImages}
                            onFilesChange={(files) => {
                              const remainingSlots =
                                10 -
                                (existingImages.length + mainImages.length);
                              const newFiles = files.slice(0, remainingSlots);
                              setMainImages((prev) => [...prev, ...newFiles]);
                            }}
                            disabled={isLoading}
                            accept="image/*"
                            multiple={true}
                            maxFiles={
                              10 - (existingImages.length + mainImages.length)
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Color Variants Section - SIMPLIFIED */}
                {/* Color Variants Section - WITH EDIT FUNCTIONALITY */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        Color Variant Images
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Add images for different color variants
                      </p>
                    </div>
                    {mode === "edit" && (
                      <Button
                        type="button"
                        onClick={() =>
                          document.getElementById("color-file-upload")?.click()
                        }
                        size="sm"
                        disabled={
                          existingColorImages.length + colorImages.length >= 20
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Color Images
                      </Button>
                    )}
                  </div>

                  {existingColorImages.length === 0 &&
                  colorImages.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No color variant images uploaded yet
                      </p>
                      {mode === "edit" && (
                        <FileUpload
                          id="color-file-upload"
                          files={[]}
                          onFilesChange={handleColorImageUpload}
                          disabled={isLoading}
                          accept="image/*"
                          multiple={true}
                          maxFiles={20}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {existingColorImages.length + colorImages.length} color
                        variant(s) added
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Existing Color Variants - WITH EDIT FUNCTIONALITY */}
                        {existingColorImages.map((colorImage, colorIndex) => (
                          <EditableColorVariantCard
                            key={`existing-color-${colorIndex}`}
                            colorImage={colorImage}
                            mode={mode}
                            onUpdate={(field, value) =>
                              updateExistingColorVariant(
                                colorIndex,
                                field,
                                value
                              )
                            }
                            onDeleteImage={(imageIndex) =>
                              removeExistingColorImage(colorIndex, imageIndex)
                            }
                            onDeleteVariant={() =>
                              removeExistingColorVariant(colorIndex)
                            }
                            colorIndex={colorIndex}
                          />
                        ))}

                        {/* New Color Variants */}
                        {colorImages.map((item, index) => (
                          <div
                            key={`new-color-${index}`}
                            className="border rounded-lg p-4 space-y-3 bg-blue-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 rounded-full border-2 border-blue-300 bg-white" />
                                <div>
                                  <p className="font-medium text-blue-900">
                                    {item.colorName || "Unnamed Color"}
                                  </p>
                                  <p className="text-sm text-blue-700">
                                    Code: {item.colorCode || "Not set"}
                                  </p>
                                </div>
                              </div>
                              {mode === "edit" && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeColorImage(index)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <img
                                  src={item.previewUrl}
                                  alt={item.file.name}
                                  className="w-full h-32 object-cover rounded border"
                                />
                                <p className="text-xs text-blue-700 text-center">
                                  {item.file.name}
                                </p>
                              </div>

                              {mode === "edit" && (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Color Code *
                                    </label>
                                    <Select
                                      value={item.colorCode}
                                      onValueChange={(value) =>
                                        updateColorImage(
                                          index,
                                          "colorCode",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select color code" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COLOR_OPTIONS.map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            <div className="flex items-center space-x-2">
                                              <div
                                                className="w-4 h-4 rounded border"
                                                style={{
                                                  backgroundColor: getColorHex(
                                                    option.value
                                                  ),
                                                  borderColor:
                                                    option.value.toLowerCase() ===
                                                    "white"
                                                      ? "#d1d5db"
                                                      : "transparent",
                                                }}
                                              />
                                              <span>{option.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Color Name *
                                    </label>
                                    <Input
                                      value={item.colorName}
                                      onChange={(e) =>
                                        updateColorImage(
                                          index,
                                          "colorName",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., Fire Red, Ocean Blue"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add more color images button */}
                      {mode === "edit" &&
                        existingColorImages.length + colorImages.length <
                          20 && (
                          <div className="flex justify-center pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById("color-file-upload")
                                  ?.click()
                              }
                              className="border-dashed"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add More Color Images
                            </Button>
                          </div>
                        )}

                      {/* Hidden file input for adding more color images */}
                      {mode === "edit" && (
                        <div className="hidden">
                          <FileUpload
                            id="color-file-upload"
                            files={[]}
                            onFilesChange={(files) => {
                              const remainingSlots =
                                20 -
                                (existingColorImages.length +
                                  colorImages.length);
                              const newFiles = files.slice(0, remainingSlots);
                              handleColorImageUpload(newFiles);
                            }}
                            disabled={isLoading}
                            accept="image/*"
                            multiple={true}
                            maxFiles={
                              20 -
                              (existingColorImages.length + colorImages.length)
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Product Variants</CardTitle>
                    <CardDescription>
                      Define product variants with different colors and sizes
                    </CardDescription>
                  </div>
                  {mode === "edit" && (
                    <Button type="button" onClick={addVariant} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {variants.length > 0 ? (
                  variants.map((variant, variantIndex) => (
                    <div
                      key={variantIndex}
                      className="border rounded-lg p-6 space-y-6 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">
                          Variant {variantIndex + 1}
                        </h4>
                        {mode === "edit" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(variantIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mode === "edit" ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Simple Code
                              </label>
                              <Input
                                value={variant.simpleCode}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "simpleCode",
                                    e.target.value
                                  )
                                }
                                placeholder="BP001-RED-M"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Full Code
                              </label>
                              <Input
                                value={variant.fullCode}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "fullCode",
                                    e.target.value
                                  )
                                }
                                placeholder="BP001-RED-M-FULL"
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Color Code
                              </label>
                              <Select
                                value={variant.codeColour}
                                onValueChange={(value) => {
                                  updateVariant(
                                    variantIndex,
                                    "codeColour",
                                    value
                                  );
                                  const color = COLOR_OPTIONS.find(
                                    (c) => c.value === value
                                  );
                                  if (color) {
                                    updateVariant(
                                      variantIndex,
                                      "codeColourName",
                                      color.label
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                  {COLOR_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Color Name
                              </label>
                              <Input
                                value={variant.codeColourName}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "codeColourName",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Size Code
                              </label>
                              <Select
                                value={variant.codeSize}
                                onValueChange={(value) => {
                                  updateVariant(
                                    variantIndex,
                                    "codeSize",
                                    value
                                  );
                                  const size = SIZE_OPTIONS.find(
                                    (s) => s.value === value
                                  );
                                  if (size) {
                                    updateVariant(
                                      variantIndex,
                                      "codeSizeName",
                                      size.label
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                  {SIZE_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Size Name
                              </label>
                              <Input
                                value={variant.codeSizeName}
                                onChange={(e) =>
                                  updateVariant(
                                    variantIndex,
                                    "codeSizeName",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Simple Code
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.simpleCode || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Full Code
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.fullCode || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Color Code
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.codeColour || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Color Name
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.codeColourName || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Size Code
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.codeSize || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">
                                Size Name
                              </label>
                              <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                {variant.codeSizeName || "N/A"}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Packaging & Dimensions */}
                      <div className="space-y-6">
                        <h5 className="font-medium text-lg">
                          Packaging & Dimensions
                        </h5>
                        {mode === "edit" ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Carton Length (cm)
                                </label>
                                <Input
                                  type="number"
                                  value={
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionL
                                  }
                                  onChange={(e) =>
                                    updateVariantPackaging(
                                      variantIndex,
                                      "cartonSizeDimensionL",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Carton Width (cm)
                                </label>
                                <Input
                                  type="number"
                                  value={
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionW
                                  }
                                  onChange={(e) =>
                                    updateVariantPackaging(
                                      variantIndex,
                                      "cartonSizeDimensionW",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Carton Height (cm)
                                </label>
                                <Input
                                  type="number"
                                  value={
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionH
                                  }
                                  onChange={(e) =>
                                    updateVariantPackaging(
                                      variantIndex,
                                      "cartonSizeDimensionH",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Pieces per Carton
                                </label>
                                <Input
                                  type="number"
                                  value={
                                    variant.packagingAndDimension
                                      .piecesPerCarton
                                  }
                                  onChange={(e) =>
                                    updateVariantPackaging(
                                      variantIndex,
                                      "piecesPerCarton",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Carton Weight (kg)
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={
                                    variant.packagingAndDimension.cartonWeight
                                  }
                                  onChange={(e) =>
                                    updateVariantPackaging(
                                      variantIndex,
                                      "cartonWeight",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Product Length (cm)
                                </label>
                                <Input
                                  type="number"
                                  value={variant.productDimension.length}
                                  onChange={(e) =>
                                    updateVariantDimension(
                                      variantIndex,
                                      "length",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Product Width (cm)
                                </label>
                                <Input
                                  type="number"
                                  value={variant.productDimension.width}
                                  onChange={(e) =>
                                    updateVariantDimension(
                                      variantIndex,
                                      "width",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Product Weight (kg)
                                </label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={variant.productDimension.weight}
                                  onChange={(e) =>
                                    updateVariantDimension(
                                      variantIndex,
                                      "weight",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Carton Length (cm)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionL
                                  }
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Carton Width (cm)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionW
                                  }
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Carton Height (cm)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {
                                    variant.packagingAndDimension
                                      .cartonSizeDimensionH
                                  }
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Pieces per Carton
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {
                                    variant.packagingAndDimension
                                      .piecesPerCarton
                                  }
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Carton Weight (kg)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {variant.packagingAndDimension.cartonWeight}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Product Length (cm)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {variant.productDimension.length}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Product Width (cm)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {variant.productDimension.width}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Product Weight (kg)
                                </label>
                                <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                                  {variant.productDimension.weight}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {mode === "edit" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={variant.isLogo24}
                            onCheckedChange={(checked) =>
                              updateVariant(variantIndex, "isLogo24", checked)
                            }
                          />
                          <label className="text-sm font-medium">
                            Logo24 Enabled for this variant
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Logo24 Enabled
                          </label>
                          <div className="text-base text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                            {variant.isLogo24 ? "Yes" : "No"}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                    No variants configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}



// Editable Color Variant Card Component
const EditableColorVariantCard = ({ 
  colorImage, 
  mode, 
  onUpdate, 
  onDeleteImage, 
  onDeleteVariant,
  colorIndex 
}: { 
  colorImage: any;
  mode: Mode;
  onUpdate: (field: 'colorCode' | 'colorName', value: string) => void;
  onDeleteImage: (imageIndex: number) => void;
  onDeleteVariant: () => void;
  colorIndex: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    colorCode: colorImage.code,
    colorName: colorImage.name
  });

  const handleSave = () => {
    onUpdate('colorCode', editData.colorCode);
    onUpdate('colorName', editData.colorName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      colorCode: colorImage.code,
      colorName: colorImage.name
    });
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-6 h-6 rounded-full border"
            style={{
              backgroundColor: getColorHex(colorImage.code),
              borderColor: colorImage.code.toLowerCase() === 'white' ? '#d1d5db' : 'transparent'
            }}
          />
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editData.colorName}
                  onChange={(e) => setEditData(prev => ({ ...prev, colorName: e.target.value }))}
                  placeholder="Color name"
                  className="w-48"
                />
              </div>
            ) : (
              <>
                <p className="font-medium">{colorImage.name}</p>
                <p className="text-sm text-muted-foreground">Code: {colorImage.code}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {colorImage.images.length} image{colorImage.images.length !== 1 ? 's' : ''}
          </Badge>
          
          {mode === "edit" && (
            <div className="flex items-center space-x-1">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDeleteVariant}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Code *</label>
            <Select 
              value={editData.colorCode} 
              onValueChange={(value) => setEditData(prev => ({ ...prev, colorCode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color code" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: getColorHex(option.value),
                          borderColor: option.value.toLowerCase() === 'white' ? '#d1d5db' : 'transparent'
                        }}
                      />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color Name *</label>
            <Input 
              value={editData.colorName}
              onChange={(e) => setEditData(prev => ({ ...prev, colorName: e.target.value }))}
              placeholder="e.g., Fire Red, Ocean Blue"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {colorImage.images.map((image: any, imageIndex: number) => (
          <div key={imageIndex} className="relative group">
            <img
              src={image.urls?.[0]?.url}
              alt={image.name}
              className="w-full h-20 object-cover rounded border"
            />
            {mode === "edit" && (
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={() => onDeleteImage(imageIndex)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            {image.isDefault && (
              <div className="absolute top-1 left-1">
                <Badge variant="default" className="text-xs bg-green-600">
                  Default
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
