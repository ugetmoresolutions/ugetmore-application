"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { BRANDING_PRODUCT_API } from '@/endpoints/rest-api/branding-product';
import { PRODUCT_API } from '@/endpoints/rest-api/product';
import { Eye, EyeOff, ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Interfaces matching IBrandingProduct
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

interface Code {
  simpleCode: string;
  fullCode: string;
}

interface ProductImage {
  name: string;
  isDefault: boolean;
  urls: ImageUrl[];
  hasLogo: boolean;
  angle: string | null;
  type: string;
}

interface ImageUrl {
  url: string;
  width: number;
  height: number;
}

interface ColourImage {
  name: string;
  code: string;
  images: ProductImage[];
}

interface Branding {
  positionName: string;
  positionCode: string;
  positionComment: string | null;
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

// Form state interface that maps to IBrandingProduct
interface BrandingProductFormData {
  // Basic Information
  price: number;
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

// Dropdown options
const PRODUCT_TYPE_OPTIONS = [
  { value: 'Apparel', label: 'Apparel' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Stationery', label: 'Stationery' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Homeware', label: 'Homeware' },
  { value: 'Promotional', label: 'Promotional' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Safety', label: 'Safety' },
];

const MATERIAL_OPTIONS = [
  { value: 'Cotton', label: 'Cotton' },
  { value: 'Polyester', label: 'Polyester' },
  { value: 'Plastic', label: 'Plastic' },
  { value: 'Metal', label: 'Metal' },
  { value: 'Wood', label: 'Wood' },
  { value: 'Glass', label: 'Glass' },
  { value: 'Ceramic', label: 'Ceramic' },
  { value: 'Composite', label: 'Composite' },
  { value: 'Other', label: 'Other' },
];

const INVENTORY_TYPE_OPTIONS = [
  { value: 'Physical', label: 'Physical' },
  { value: 'Digital', label: 'Digital' },
  { value: 'Service', label: 'Service' },
];

const MADE_TO_ORDER_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Custom', label: 'Custom' },
];

const COLOR_OPTIONS = [
  { value: 'BLACK', label: 'Black' },
  { value: 'RED', label: 'Red' },
  { value: 'WHITE', label: 'White' },
  { value: 'BLUE', label: 'Blue' },
  { value: 'GREEN', label: 'Green' },
  { value: 'YELLOW', label: 'Yellow' },
  { value: 'PURPLE', label: 'Purple' },
  { value: 'PINK', label: 'Pink' },
  { value: 'ORANGE', label: 'Orange' },
  { value: 'GRAY', label: 'Gray' },
  { value: 'BROWN', label: 'Brown' },
  { value: 'NAVY', label: 'Navy' },
];

const SIZE_OPTIONS = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
  { value: 'ONESIZE', label: 'One Size' },
];

const BRANDING_METHOD_OPTIONS = [
  { value: 'Embroidery', label: 'Embroidery' },
  { value: 'Screen Print', label: 'Screen Print' },
  { value: 'Heat Transfer', label: 'Heat Transfer' },
  { value: 'Digital Print', label: 'Digital Print' },
  { value: 'Patch', label: 'Patch' },
  { value: 'Debossing', label: 'Debossing' },
  { value: 'Embossing', label: 'Embossing' },
  { value: 'Laser Engraving', label: 'Laser Engraving' },
];

const BRANDING_POSITION_OPTIONS = [
  { value: 'Front', label: 'Front', code: 'FRONT' },
  { value: 'Back', label: 'Back', code: 'BACK' },
  { value: 'Left Side', label: 'Left Side', code: 'LEFT' },
  { value: 'Right Side', label: 'Right Side', code: 'RIGHT' },
  { value: 'Top', label: 'Top', code: 'TOP' },
  { value: 'Bottom', label: 'Bottom', code: 'BOTTOM' },
  { value: 'Center', label: 'Center', code: 'CENTER' },
  { value: 'Full Area', label: 'Full Area', code: 'FULL' },
];

const CATEGORY_OPTIONS = [
  { name: 'Apparel', path: 'clothing/apparel', code: 'APP', image: '' },
  { name: 'Accessories', path: 'accessories', code: 'ACC', image: '' },
  { name: 'Stationery', path: 'office/stationery', code: 'STN', image: '' },
  { name: 'Electronics', path: 'electronics', code: 'ELEC', image: '' },
  { name: 'Homeware', path: 'homeware', code: 'HOME', image: '' },
  { name: 'Promotional', path: 'promotional', code: 'PROMO', image: '' },
  { name: 'Safety', path: 'safety', code: 'SAFE', image: '' },
  { name: 'Corporate', path: 'corporate', code: 'CORP', image: '' },
];

export function CreateBrandingProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImages, setMainImages] = useState<File[]>([]);
  const [colorImages, setColorImages] = useState<{ 
    file: File; 
    colorCode: string; 
    colorName: string;
    preview: string;
    isExpanded: boolean;
  }[]>([]);
  
  // Complex object states
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<Brand>({ name: '', brandWebsiteLogo: '', code: '' });
  const [brandings, setBrandings] = useState<Branding[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<BrandingProductFormData>({
    // Basic Information
    simpleCode: '',
    productName: '',
    description: '',
    price: 0,
    
    // Product Details
    material: 'Other',
    feature: '',
    type: 'Apparel',
    
    // Inventory & Ordering
    minimum: 1,
    maximum: 100,
    inventoryType: 'Physical',
    madeToOrder: 'No',
    
    // Branding & Marketing
    displayCountryOfOrigin: '',
    fullBrandingGuide: '',
    keywords: '',
    tags: '',
    
    // Branding Features
    decoupled: false,
  });

  // Handle input changes
  const handleInputChange = (field: keyof BrandingProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number input changes - UPDATED FOR DECIMAL SUPPORT
  const handleNumberChange = (field: keyof BrandingProductFormData, value: string) => {
    if (field === 'price') {
      // For price, allow decimals
      const numValue = value === '' ? 0 : parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [field]: numValue
        }));
      }
    } else {
      // For other numbers, use integers
      const numValue = value === '' ? 0 : parseInt(value, 10);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [field]: numValue
        }));
      }
    }
  };

  // Handle brand changes
  const handleBrandChange = (field: keyof Brand, value: string) => {
    setBrand(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add category
  const addCategory = (category: Category) => {
    if (!categories.find(cat => cat.code === category.code)) {
      setCategories(prev => [...prev, category]);
    }
  };

  // Remove category
  const removeCategory = (categoryCode: string) => {
    setCategories(prev => prev.filter(cat => cat.code !== categoryCode));
  };

  // Add branding position
  const addBrandingPosition = () => {
    const newBranding: Branding = {
      positionName: '',
      positionCode: '',
      positionComment: null,
      positionMultiplier: 1,
      method: []
    };
    setBrandings(prev => [...prev, newBranding]);
  };

  // Update branding position
  const updateBrandingPosition = (index: number, field: keyof Branding, value: any) => {
    setBrandings(prev => prev.map((branding, i) => 
      i === index ? { ...branding, [field]: value } : branding
    ));
  };

  // Remove branding position
  const removeBrandingPosition = (index: number) => {
    setBrandings(prev => prev.filter((_, i) => i !== index));
  };

  // Add branding method
  const addBrandingMethod = (brandingIndex: number) => {
    const newMethod: BrandingMethod = {
      brandingName: '',
      brandingDepartment: '',
      brandingCode: '',
      brandingInclusiveMethod: false,
      displayIndex: '1',
      maxPrintingSizeWidth: '',
      maxPrintingSizeHeight: '',
      numberOfColours: '',
      brandingMultiplier: 1,
      exclusions: []
    };
    
    setBrandings(prev => prev.map((branding, i) => 
      i === brandingIndex 
        ? { ...branding, method: [...branding.method, newMethod] }
        : branding
    ));
  };

  // Update branding method
  const updateBrandingMethod = (brandingIndex: number, methodIndex: number, field: keyof BrandingMethod, value: any) => {
    setBrandings(prev => prev.map((branding, i) => 
      i === brandingIndex 
        ? { 
            ...branding, 
            method: branding.method.map((method, j) => 
              j === methodIndex ? { ...method, [field]: value } : method
            )
          }
        : branding
    ));
  };

  // Remove branding method
  const removeBrandingMethod = (brandingIndex: number, methodIndex: number) => {
    setBrandings(prev => prev.map((branding, i) => 
      i === brandingIndex 
        ? { ...branding, method: branding.method.filter((_, j) => j !== methodIndex) }
        : branding
    ));
  };

  // Add variant
  const addVariant = () => {
    const newVariant: ProductVariant = {
      simpleCode: '',
      fullCode: '',
      codeColour: '',
      codeColourName: '',
      codeSize: '',
      codeSizeName: '',
      categorisedAttribute: null,
      packagingAndDimension: {
        cartonSizeDimensionL: 0,
        cartonSizeDimensionW: 0,
        cartonSizeDimensionH: 0,
        piecesPerCarton: 0,
        cartonWeight: 0
      },
      productDimension: {
        length: 0,
        width: 0,
        weight: 0
      },
      isLogo24: false,
      components: null
    };
    setVariants(prev => [...prev, newVariant]);
  };

  // Update variant
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  // Update variant packaging
  const updateVariantPackaging = (variantIndex: number, field: keyof PackagingAndDimension, value: number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? { 
            ...variant, 
            packagingAndDimension: { ...variant.packagingAndDimension, [field]: value }
          }
        : variant
    ));
  };

  // Update variant dimension
  const updateVariantDimension = (variantIndex: number, field: keyof ProductDimension, value: number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? { 
            ...variant, 
            productDimension: { ...variant.productDimension, [field]: value }
          }
        : variant
    ));
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Handle color image upload with color code
  const handleColorImageUpload = (files: File[]) => {
    const newColorImages = files.map(file => ({
      file,
      colorCode: '',
      colorName: '',
      preview: URL.createObjectURL(file),
      isExpanded: false // Start collapsed by default
    }));
    setColorImages(prev => [...prev, ...newColorImages]);
  };

  // Update color image details
  const updateColorImage = (index: number, field: 'colorCode' | 'colorName', value: string) => {
    setColorImages(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Toggle color image expansion
  const toggleColorImageExpansion = (index: number) => {
    setColorImages(prev => prev.map((item, i) => 
      i === index ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };


   // Remove color image
  const removeColorImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(colorImages[index].preview);
    setColorImages(prev => prev.filter((_, i) => i !== index));
  };


  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      colorImages.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [colorImages]);


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

  // Simple validation
  const validateForm = () => {
    const requiredFields: (keyof BrandingProductFormData)[] = [
      'simpleCode', 'productName', 'description', 
      'material', 'type', 'inventoryType',
      'displayCountryOfOrigin', 'price'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return false;
      }
    }

    // Add price-specific validation
    if (formData.price < 0) {
      toast.error('Price must be a positive number');
      return false;
    }

    if (categories.length === 0) {
      toast.error('At least one category is required');
      return false;
    }

    if (formData.minimum < 1) {
      toast.error('Minimum order must be at least 1');
      return false;
    }

    if (formData.maximum < formData.minimum) {
      toast.error('Maximum order must be greater than minimum order');
      return false;
    }

    

    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Upload all images first and get their URLs
      let uploadedMainImageUrls: any[] = [];
      let uploadedColorImageUrls: any[] = [];

      if (mainImages.length > 0) {
        uploadedMainImageUrls = await uploadImagesAndGetUrls(mainImages);
        toast.success(`${mainImages.length} main image(s) uploaded successfully`);
      }

      if (colorImages.length > 0) {
        const colorFiles = colorImages.map(item => item.file);
        const colorUrls = await uploadImagesAndGetUrls(colorFiles);
        
        // Map color URLs with their color codes
        uploadedColorImageUrls = colorImages.map((item, index) => ({
          ...item,
          url: colorUrls[index]?.url || ''
        }));
        
        toast.success(`${colorImages.length} color image(s) uploaded successfully`);
      }

      // Prepare the complete branding product data according to IBrandingProduct interface
      const brandingProductData = {
        // Required fields from IBrandingProduct
        actionType: 1,
        gender: '',
        fit: "",
        price: formData.price, // Use the actual price from form data
        simpleCode: formData.simpleCode,
        fullCode: formData.simpleCode, // Use simpleCode for fullCode
        categorisedAttribute: [],
        material: formData.material,
        feature: formData.feature,
        categories: categories,
        brand: brand,
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
        images: uploadedMainImageUrls.map((img, index) => ({
          name: `image-${Date.now()}-${index}`,
          isDefault: index === 0,
          urls: [{ url: img.url, width: 800, height: 600 }],
          hasLogo: false,
          angle: null,
          type: 'main'
        })),
        colourImages: uploadedColorImageUrls.map((item, index) => ({
          name: item.colorName || `color-${index + 1}`,
          code: item.colorCode || `color-${index + 1}`,
          images: [{
            name: `color-img-${Date.now()}-${index}`,
            isDefault: true,
            urls: [{ url: item.url, width: 800, height: 600 }],
            hasLogo: false,
            angle: null,
            type: 'color'
          }]
        })),
        brandings: brandings,
        isLogo24: false,
        logo24Branding: null,
        inclusiveBranding: [],
        variants: variants,
        requiredBrandingPositions: [],
        noCoBrandingPositions: [],
        brandingTemplates: [],
        decoupled: formData.decoupled,
        type: formData.type,
      };

      // Create the branding product
      const response = await BRANDING_PRODUCT_API.CREATE_BRANDING_PRODUCT(brandingProductData);

      if (response.error) {
        throw new Error(response.message);
      }

      toast.success('Branding product created successfully!');
      
      // Redirect to products listing
      router.push('/admin/products/branding');
      
    } catch (error: any) {
      toast.error(`Failed to create branding product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      simpleCode: '',
      productName: '',
      description: '',
      price: 0,
      material: 'Other',
      feature: '',
      type: 'Apparel',
      minimum: 1,
      maximum: 100,
      inventoryType: 'Physical',
      madeToOrder: 'No',
      displayCountryOfOrigin: '',
      fullBrandingGuide: '',
      keywords: '',
      tags: '',
      decoupled: false,
    });
    setMainImages([]);
    setColorImages([]);
    setCategories([]);
    setBrand({ name: '', brandWebsiteLogo: '', code: '' });
    setBrandings([]);
    setVariants([]);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Branding Product</h1>
        <p className="text-muted-foreground">
          Add a new universal branding product to your catalog
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
          </TabsList>

           {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details for your branding product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Code *</label>
                  <Input 
                    placeholder="BP001" 
                    value={formData.simpleCode}
                    onChange={(e) => handleInputChange('simpleCode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input 
                    placeholder="Premium Product" 
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                  />
                </div>

                {/* ADDED PRICE FIELD */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price *</label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => handleNumberChange('price', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Type *</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {PRODUCT_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Material *</label>
                  <Select 
                    value={formData.material} 
                    onValueChange={(value) => handleInputChange('material', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {MATERIAL_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Inventory Type *</label>
                  <Select 
                    value={formData.inventoryType} 
                    onValueChange={(value) => handleInputChange('inventoryType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select inventory type" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {INVENTORY_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Made to Order</label>
                  <Select 
                    value={formData.madeToOrder} 
                    onValueChange={(value) => handleInputChange('madeToOrder', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {MADE_TO_ORDER_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Features *</label>
                <Input 
                  placeholder="Key features and specifications" 
                  value={formData.feature}
                  onChange={(e) => handleInputChange('feature', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea 
                  placeholder="Describe your product..." 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Order *</label>
                  <Input 
                    type="number" 
                    value={formData.minimum}
                    onChange={(e) => handleNumberChange('minimum', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Order *</label>
                  <Input 
                    type="number" 
                    value={formData.maximum}
                    onChange={(e) => handleNumberChange('maximum', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country of Origin *</label>
                  <Input 
                    placeholder="South Africa" 
                    value={formData.displayCountryOfOrigin}
                    onChange={(e) => handleInputChange('displayCountryOfOrigin', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branding Guide URL *</label>
                  <Input 
                    type="url" 
                    placeholder="https://example.com/branding-guide.pdf" 
                    value={formData.fullBrandingGuide}
                    onChange={(e) => handleInputChange('fullBrandingGuide', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <Input 
                    placeholder="branding, custom, product" 
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input 
                    placeholder="brandable,customizable,premium" 
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Decoupled Product</label>
                  <p className="text-sm text-muted-foreground">
                    Product can be sold separately from branding
                  </p>
                </div>
                <Switch
                  checked={formData.decoupled}
                  onCheckedChange={(checked) => handleInputChange('decoupled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            {/* Brand Information */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
                <CardDescription>
                  Brand details for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand Name *</label>
                    <Input 
                      placeholder="Your Brand" 
                      value={brand.name}
                      onChange={(e) => handleBrandChange('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brand Code *</label>
                    <Input 
                      placeholder="BR001" 
                      value={brand.code}
                      onChange={(e) => handleBrandChange('code', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Brand Website Logo URL</label>
                    <Input 
                      type="url" 
                      placeholder="https://example.com/logo.jpg" 
                      value={brand.brandWebsiteLogo}
                      onChange={(e) => handleBrandChange('brandWebsiteLogo', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Product categories and classification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add Category *</label>
                  <Select onValueChange={(value) => {
                    const category = CATEGORY_OPTIONS.find(cat => cat.code === value);
                    if (category) addCategory(category);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name} ({option.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {category.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(category.code)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branding Positions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Branding Positions</CardTitle>
                    <CardDescription>
                      Define branding positions and methods
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addBrandingPosition} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Position
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {brandings.map((branding, brandingIndex) => (
                  <div key={brandingIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Branding Position {brandingIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBrandingPosition(brandingIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Position Name</label>
                        <Select 
                          value={branding.positionName} 
                          onValueChange={(value) => {
                            const position = BRANDING_POSITION_OPTIONS.find(pos => pos.value === value);
                            updateBrandingPosition(brandingIndex, 'positionName', value);
                            if (position) {
                              updateBrandingPosition(brandingIndex, 'positionCode', position.code);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANDING_POSITION_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Position Code</label>
                        <Input 
                          value={branding.positionCode}
                          onChange={(e) => updateBrandingPosition(brandingIndex, 'positionCode', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Position Comment</label>
                        <Input 
                          value={branding.positionComment || ''}
                          onChange={(e) => updateBrandingPosition(brandingIndex, 'positionComment', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Position Multiplier</label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={branding.positionMultiplier}
                          onChange={(e) => updateBrandingPosition(brandingIndex, 'positionMultiplier', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Branding Methods */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Branding Methods</h5>
                        <Button 
                          type="button" 
                          onClick={() => addBrandingMethod(brandingIndex)} 
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Method
                        </Button>
                      </div>

                      {branding.method.map((method, methodIndex) => (
                        <div key={methodIndex} className="border rounded p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium">Method {methodIndex + 1}</h6>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBrandingMethod(brandingIndex, methodIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Branding Name</label>
                              <Select 
                                value={method.brandingName} 
                                onValueChange={(value) => updateBrandingMethod(brandingIndex, methodIndex, 'brandingName', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BRANDING_METHOD_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Branding Department</label>
                              <Input 
                                value={method.brandingDepartment}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'brandingDepartment', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Branding Code</label>
                              <Input 
                                value={method.brandingCode}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'brandingCode', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Display Index</label>
                              <Input 
                                value={method.displayIndex}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'displayIndex', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Max Width</label>
                              <Input 
                                value={method.maxPrintingSizeWidth}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'maxPrintingSizeWidth', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Max Height</label>
                              <Input 
                                value={method.maxPrintingSizeHeight}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'maxPrintingSizeHeight', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Number of Colors</label>
                              <Input 
                                value={method.numberOfColours}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'numberOfColours', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Branding Multiplier</label>
                              <Input 
                                type="number"
                                step="0.1"
                                value={method.brandingMultiplier}
                                onChange={(e) => updateBrandingMethod(brandingIndex, methodIndex, 'brandingMultiplier', parseFloat(e.target.value))}
                              />
                            </div>

                            <div className="flex items-center space-x-2 md:col-span-2">
                              <Switch
                                checked={method.brandingInclusiveMethod}
                                onCheckedChange={(checked) => updateBrandingMethod(brandingIndex, methodIndex, 'brandingInclusiveMethod', checked)}
                              />
                              <label className="text-sm font-medium">Branding Inclusive Method</label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Improved Images Tab */}
          <TabsContent value="images" className="space-y-4">
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
                      {mainImages.length} / 10 images
                    </div>
                  </div>
                  
                  {mainImages.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No main images uploaded yet</p>
                      <FileUpload
                        files={mainImages}
                        onFilesChange={setMainImages}
                        disabled={isLoading}
                        accept="image/*"
                        multiple={true}
                        maxFiles={10}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mainImages.map((file, index) => (
                          <div key={index} className="relative group border rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newImages = [...mainImages];
                                  newImages.splice(index, 1);
                                  setMainImages(newImages);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="p-2">
                              <p className="text-xs truncate" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add more images button */}
                        {mainImages.length < 10 && (
                          <div 
                            className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => document.getElementById('main-file-upload')?.click()}
                          >
                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">Add More Images</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Hidden file input for adding more images */}
                      <div className="hidden">
                        <FileUpload
                          id="main-file-upload"
                          files={mainImages}
                          onFilesChange={(files) => {
                            const remainingSlots = 10 - mainImages.length;
                            const newFiles = files.slice(0, remainingSlots);
                            setMainImages(prev => [...prev, ...newFiles]);
                          }}
                          disabled={isLoading}
                          accept="image/*"
                          multiple={true}
                          maxFiles={10 - mainImages.length}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Variants Section - IMPROVED */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Color Variant Images</h3>
                      <p className="text-sm text-muted-foreground">
                        Add images for different color variants
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById('color-file-upload')?.click()}
                      size="sm"
                      disabled={colorImages.length >= 20}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Color Images
                    </Button>
                  </div>
                  
                  {colorImages.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No color variant images uploaded yet</p>
                      <FileUpload
                        id="color-file-upload"
                        files={[]}
                        onFilesChange={handleColorImageUpload}
                        disabled={isLoading}
                        accept="image/*"
                        multiple={true}
                        maxFiles={20}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {colorImages.length} color variant(s) added
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {colorImages.map((item, index) => (
                          <div 
                            key={index} 
                            className={`border rounded-lg transition-all duration-200 ${
                              item.isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'
                            }`}
                          >
                            {/* Header - Always visible */}
                            <div 
                              className="flex items-center justify-between p-3 cursor-pointer"
                              onClick={() => toggleColorImageExpansion(index)}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <img
                                  src={item.preview}
                                  alt={item.file.name}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {item.file.name}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    {item.colorCode && (
                                      <Badge variant="secondary" className="text-xs">
                                        {item.colorCode}
                                      </Badge>
                                    )}
                                    {item.colorName && (
                                      <span>{item.colorName}</span>
                                    )}
                                    {(!item.colorCode && !item.colorName) && (
                                      <span className="text-orange-500">Color details needed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleColorImageExpansion(index);
                                  }}
                                >
                                  {item.isExpanded ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeColorImage(index);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Expandable Content */}
                            {item.isExpanded && (
                              <div className="px-3 pb-3 border-t pt-3 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Color Code *</label>
                                    <Select 
                                      value={item.colorCode} 
                                      onValueChange={(value) => updateColorImage(index, 'colorCode', value)}
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
                                                  backgroundColor: option.value.toLowerCase() === 'white' ? '#fff' : 
                                                    option.value.toLowerCase() === 'black' ? '#000' :
                                                    option.value.toLowerCase() === 'red' ? '#ef4444' :
                                                    option.value.toLowerCase() === 'blue' ? '#3b82f6' :
                                                    option.value.toLowerCase() === 'green' ? '#22c55e' :
                                                    option.value.toLowerCase() === 'yellow' ? '#eab308' :
                                                    option.value.toLowerCase() === 'purple' ? '#a855f7' :
                                                    option.value.toLowerCase() === 'pink' ? '#ec4899' :
                                                    option.value.toLowerCase() === 'orange' ? '#f97316' :
                                                    option.value.toLowerCase() === 'gray' ? '#6b7280' :
                                                    option.value.toLowerCase() === 'brown' ? '#a16207' :
                                                    option.value.toLowerCase() === 'navy' ? '#1e3a8a' : '#ccc'
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
                                      value={item.colorName}
                                      onChange={(e) => updateColorImage(index, 'colorName', e.target.value)}
                                      placeholder="e.g., Fire Red, Ocean Blue"
                                    />
                                  </div>
                                </div>
                                
                                {/* Image Preview */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Image Preview</label>
                                  <div className="flex justify-center">
                                    <img
                                      src={item.preview}
                                      alt={item.file.name}
                                      className="max-w-full max-h-48 object-contain rounded-lg border"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add more color images button */}
                      {colorImages.length < 20 && (
                        <div className="flex justify-center pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => document.getElementById('color-file-upload')?.click()}
                            className="border-dashed"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add More Color Images
                          </Button>
                        </div>
                      )}
                      
                      {/* Hidden file input for adding more color images */}
                      <div className="hidden">
                        <FileUpload
                          id="color-file-upload"
                          files={[]}
                          onFilesChange={(files) => {
                            const remainingSlots = 20 - colorImages.length;
                            const newFiles = files.slice(0, remainingSlots);
                            handleColorImageUpload(newFiles);
                          }}
                          disabled={isLoading}
                          accept="image/*"
                          multiple={true}
                          maxFiles={20 - colorImages.length}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Define product variants with different colors and sizes
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {variants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {variantIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVariant(variantIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Simple Code</label>
                        <Input 
                          value={variant.simpleCode}
                          onChange={(e) => updateVariant(variantIndex, 'simpleCode', e.target.value)}
                          placeholder="BP001-RED-M"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Code</label>
                        <Input 
                          value={variant.fullCode}
                          onChange={(e) => updateVariant(variantIndex, 'fullCode', e.target.value)}
                          placeholder="BP001-RED-M-FULL"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color Code</label>
                        <Select 
                          value={variant.codeColour} 
                          onValueChange={(value) => {
                            updateVariant(variantIndex, 'codeColour', value);
                            const color = COLOR_OPTIONS.find(c => c.value === value);
                            if (color) {
                              updateVariant(variantIndex, 'codeColourName', color.label);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLOR_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color Name</label>
                        <Input 
                          value={variant.codeColourName}
                          onChange={(e) => updateVariant(variantIndex, 'codeColourName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Size Code</label>
                        <Select 
                          value={variant.codeSize} 
                          onValueChange={(value) => {
                            updateVariant(variantIndex, 'codeSize', value);
                            const size = SIZE_OPTIONS.find(s => s.value === value);
                            if (size) {
                              updateVariant(variantIndex, 'codeSizeName', size.label);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Size Name</label>
                        <Input 
                          value={variant.codeSizeName}
                          onChange={(e) => updateVariant(variantIndex, 'codeSizeName', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Packaging & Dimensions */}
                    <div className="space-y-4">
                      <h5 className="font-medium">Packaging & Dimensions</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Carton Length (cm)</label>
                          <Input 
                            type="number"
                            value={variant.packagingAndDimension.cartonSizeDimensionL}
                            onChange={(e) => updateVariantPackaging(variantIndex, 'cartonSizeDimensionL', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Carton Width (cm)</label>
                          <Input 
                            type="number"
                            value={variant.packagingAndDimension.cartonSizeDimensionW}
                            onChange={(e) => updateVariantPackaging(variantIndex, 'cartonSizeDimensionW', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Carton Height (cm)</label>
                          <Input 
                            type="number"
                            value={variant.packagingAndDimension.cartonSizeDimensionH}
                            onChange={(e) => updateVariantPackaging(variantIndex, 'cartonSizeDimensionH', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Pieces per Carton</label>
                          <Input 
                            type="number"
                            value={variant.packagingAndDimension.piecesPerCarton}
                            onChange={(e) => updateVariantPackaging(variantIndex, 'piecesPerCarton', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Carton Weight (kg)</label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={variant.packagingAndDimension.cartonWeight}
                            onChange={(e) => updateVariantPackaging(variantIndex, 'cartonWeight', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Product Length (cm)</label>
                          <Input 
                            type="number"
                            value={variant.productDimension.length}
                            onChange={(e) => updateVariantDimension(variantIndex, 'length', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Product Width (cm)</label>
                          <Input 
                            type="number"
                            value={variant.productDimension.width}
                            onChange={(e) => updateVariantDimension(variantIndex, 'width', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Product Weight (kg)</label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={variant.productDimension.weight}
                            onChange={(e) => updateVariantDimension(variantIndex, 'weight', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={variant.isLogo24}
                        onCheckedChange={(checked) => updateVariant(variantIndex, 'isLogo24', checked)}
                      />
                      <label className="text-sm font-medium">Logo24 Enabled for this variant</label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            className="bg-slate-900 hover:bg-slate-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Product...
              </>
            ) : (
              'Create Branding Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}