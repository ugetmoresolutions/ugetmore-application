// components/bulk-product-upload.tsx
"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, FileText, X, FileSpreadsheet } from 'lucide-react';
import { BRANDING_PRODUCT_API } from '@/endpoints/rest-api/branding-product';

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

// Simplified interface - REMOVED VARIANTS for now
interface ExcelProductData {
  // Basic Information
  simpleCode: string;
  productName: string;
  description: string;
  price: string; // Keep as string for CSV
  
  // Product Details
  material: string;
  feature: string;
  type: string;
  
  // Inventory & Ordering
  minimum: string;
  maximum: string;
  inventoryType: string;
  madeToOrder: string;
  
  // Branding & Marketing
  displayCountryOfOrigin: string;
  fullBrandingGuide: string;
  keywords: string;
  tags: string;
  
  // Branding Features - use string for CSV compatibility
  decoupled: string;
  
  // Brand Information
  brandName: string;
  brandCode: string;
  brandWebsiteLogo: string;
  
  // Categories (comma-separated)
  categories: string;
}

export function BulkProductUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [activeTab, setActiveTab] = useState('json');

  // Download JSON template - SIMPLIFIED WITHOUT VARIANTS
  const downloadJsonTemplate = () => {
    const template = {
      products: [
        {
          // Basic Information
          simpleCode: "BP001",
          productName: "Premium T-Shirt",
          description: "High-quality cotton t-shirt",
          price: 29.99,
          
          // Product Details
          material: "Cotton",
          feature: "Breathable, Comfortable",
          type: "Apparel",
          
          // Inventory & Ordering
          minimum: 1,
          maximum: 100,
          inventoryType: "Physical",
          madeToOrder: "No",
          
          // Branding & Marketing
          displayCountryOfOrigin: "South Africa",
          fullBrandingGuide: "https://example.com/guide.pdf",
          keywords: "tshirt,cotton,premium",
          tags: "apparel,clothing",
          
          // Branding Features
          decoupled: false,
          
          // Brand Information
          brandName: "Your Brand",
          brandCode: "BR001",
          brandWebsiteLogo: "https://example.com/logo.jpg",
          
          // Categories (comma-separated)
          categories: "Apparel,Clothing",
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'branding-products-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('JSON template downloaded successfully');
  };

  // Download Excel template - SIMPLIFIED WITHOUT VARIANTS
  const downloadExcelTemplate = () => {
    try {
      // Create simplified sample data
      const sampleData: ExcelProductData[] = [
        {
          simpleCode: "BP001",
          productName: "Premium Cotton T-Shirt",
          description: "High-quality 100% cotton t-shirt with excellent durability",
          price: "29.99",
          material: "100% Cotton",
          feature: "Breathable, Comfortable, Pre-shrunk",
          type: "Apparel",
          minimum: "10",
          maximum: "1000",
          inventoryType: "Physical",
          madeToOrder: "No",
          displayCountryOfOrigin: "South Africa",
          fullBrandingGuide: "https://example.com/branding-guide.pdf",
          keywords: "tshirt,cotton,premium,apparel",
          tags: "clothing,tshirt,casual",
          decoupled: "false",
          brandName: "Fashion Brand",
          brandCode: "FASH001",
          brandWebsiteLogo: "https://example.com/logo.png",
          categories: "Apparel,Clothing,T-Shirts",
        },
        {
          simpleCode: "BP002",
          productName: "Executive Polo Shirt",
          description: "Professional polo shirt for corporate wear",
          price: "45.99",
          material: "Poly-Cotton Blend",
          feature: "Wrinkle-resistant, Easy care",
          type: "Apparel",
          minimum: "5",
          maximum: "500",
          inventoryType: "Physical",
          madeToOrder: "Yes",
          displayCountryOfOrigin: "South Africa",
          fullBrandingGuide: "https://example.com/polo-guide.pdf",
          keywords: "polo,corporate,executive",
          tags: "business,corporate,poloshirt",
          decoupled: "false",
          brandName: "Corporate Wear",
          brandCode: "CORP002",
          brandWebsiteLogo: "https://example.com/corp-logo.png",
          categories: "Apparel,Corporate,Polos",
        }
      ];

      // Simplified headers - NO VARIANTS
      const headers = [
        'simpleCode', 'productName', 'description', 'price', 'material', 'feature', 
        'type', 'minimum', 'maximum', 'inventoryType', 'madeToOrder', 
        'displayCountryOfOrigin', 'fullBrandingGuide', 'keywords', 'tags', 
        'decoupled', 'brandName', 'brandCode', 'brandWebsiteLogo', 'categories'
      ];

      const csvContent = [
        headers.join(','), // Header row
        ...sampleData.map(row => 
          headers.map(header => {
            const value = row[header as keyof ExcelProductData];
            // Simple CSV escaping - wrap in quotes if contains comma
            if (value && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'branding-products-template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('CSV template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download CSV template');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (activeTab === 'json' && file.type !== 'application/json') {
        toast.error('Please select a JSON file');
        return;
      }
      if (activeTab === 'excel' && !file.name.match(/\.(csv|xlsx?)$/i)) {
        toast.error('Please select a CSV or Excel file');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  // SIMPLIFIED CSV PARSER - Much more reliable
  const parseCSV = (content: string): ExcelProductData[] => {
    console.log('Raw CSV content:', content);
    
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    console.log('CSV lines:', lines);
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);

    const products: ExcelProductData[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        console.log(`Row ${i} values:`, values);

        if (values.length !== headers.length) {
          console.warn(`Row ${i} has ${values.length} values but expected ${headers.length}`);
          // Continue with available values
        }

        const product: any = {};
        
        headers.forEach((header, index) => {
          let value = values[index] || '';
          value = value.trim();
          
          // Store as string initially - we'll convert in processProductData
          product[header] = value;
        });

        // Validate required fields
        if (!product.simpleCode) {
          throw new Error('simpleCode is required');
        }
        if (!product.productName) {
          throw new Error('productName is required');
        }

        products.push(product as ExcelProductData);
        console.log(`Successfully parsed product:`, product);

      } catch (error: any) {
        console.error(`Error parsing row ${i}:`, error);
        throw new Error(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log('Final parsed products:', products);
    return products;
  };

  // SIMPLIFIED CSV LINE PARSER
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current);
    return result;
  };

  // IMPROVED PROCESS PRODUCT DATA with better error handling
  const processProductData = async (productData: any): Promise<boolean> => {
    try {
      console.log('Processing product:', productData);

      // Convert string values to appropriate types
      const price = parseFloat(productData.price);
      const minimum = parseInt(productData.minimum) || 1;
      const maximum = parseInt(productData.maximum) || 100;
      const decoupled = productData.decoupled?.toLowerCase() === 'true' || 
                       productData.decoupled === '1' || 
                       productData.decoupled?.toLowerCase() === 'yes';

      // Validate numeric fields
      if (isNaN(price) || price < 0) {
        throw new Error(`Invalid price: ${productData.price}`);
      }
      if (minimum < 1) {
        throw new Error(`Minimum order must be at least 1`);
      }
      if (maximum < minimum) {
        throw new Error(`Maximum order must be greater than minimum order`);
      }

      // Transform the data to match IBrandingProduct interface
      const brandingProductData = {
        actionType: 1,
        gender: '',
        fit: "",
        price: price,
        simpleCode: productData.simpleCode,
        fullCode: productData.simpleCode,
        categorisedAttribute: [],
        material: productData.material || 'Other',
        feature: productData.feature || '',
        categories: productData.categories ? 
          productData.categories.split(',').map((cat: string) => ({
            name: cat.trim(),
            path: cat.trim().toLowerCase().replace(/\s+/g, '-'),
            code: cat.trim().substring(0, 3).toUpperCase(),
            image: ""
          })) : [],
        brand: {
          name: productData.brandName || 'Default Brand',
          brandWebsiteLogo: productData.brandWebsiteLogo || '',
          code: productData.brandCode || 'DEF'
        },
        companionCodes: [],
        relatedCodes: [],
        matchingCodes: [],
        groupingCodes: [],
        groupingCodeGiftsets: [],
        productName: productData.productName,
        description: productData.description || 'No description provided',
        minimum: minimum,
        maximum: maximum,
        incrementedBy: 1,
        keywords: productData.keywords || '',
        tags: productData.tags || '',
        inventoryType: productData.inventoryType || 'Physical',
        behaviour: "Standard",
        madeToOrder: productData.madeToOrder || 'No',
        madeToOrderMessage: "",
        displayCountryOfOrigin: productData.displayCountryOfOrigin || 'South Africa',
        promotion: "",
        fullBrandingGuide: productData.fullBrandingGuide || '',
        logo24BrandingGuide: null,
        images: [],
        colourImages: [],
        brandings: [],
        isLogo24: false,
        logo24Branding: null,
        inclusiveBranding: [],
        variants: [], // EMPTY VARIANTS - users can add them later
        requiredBrandingPositions: [],
        noCoBrandingPositions: [],
        brandingTemplates: [],
        decoupled: decoupled,
        type: productData.type || 'Apparel',
      };

      console.log('Sending data to API:', brandingProductData);

      const response = await BRANDING_PRODUCT_API.CREATE_BRANDING_PRODUCT(brandingProductData);

      if (response.error) {
        console.error('API Error:', response);
        throw new Error(response.message || 'Unknown API error');
      }

      console.log('Product created successfully');
      return true;
    } catch (error: any) {
      console.error('Error in processProductData:', error);
      throw new Error(error.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting upload with file:', selectedFile.name);
      
      const results: BulkUploadResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      if (activeTab === 'json') {
        // Process JSON file
        const fileContent = await selectedFile.text();
        console.log('JSON file content:', fileContent);
        
        const data = JSON.parse(fileContent);
        
        if (!data.products || !Array.isArray(data.products)) {
          throw new Error('Invalid JSON format. Please use the provided template.');
        }

        console.log(`Processing ${data.products.length} products from JSON`);

        // Process each product
        for (const [index, productData] of data.products.entries()) {
          try {
            console.log(`Processing product ${index + 1}:`, productData);
            await processProductData(productData);
            results.success++;
            console.log(`Product ${index + 1} created successfully`);
          } catch (error: any) {
            console.error(`Failed to create product ${index + 1}:`, error);
            results.failed++;
            results.errors.push(`Row ${index + 1}: ${productData.productName || 'Unknown'} - ${error.message}`);
          }
        }
      } else {
        // Process Excel/CSV file
        const fileContent = await selectedFile.text();
        console.log('CSV file content:', fileContent);
        
        const products = parseCSV(fileContent);
        console.log(`Parsed ${products.length} products from CSV`);
        
        if (products.length === 0) {
          throw new Error('No valid product data found in the file.');
        }

        // Process each product
        for (const [index, productData] of products.entries()) {
          try {
            console.log(`Processing CSV product ${index + 1}:`, productData);
            await processProductData(productData);
            results.success++;
            console.log(`CSV product ${index + 1} created successfully`);
          } catch (error: any) {
            console.error(`Failed to create CSV product ${index + 1}:`, error);
            results.failed++;
            results.errors.push(`Row ${index + 2}: ${productData.productName || 'Unknown'} - ${error.message}`);
          }
        }
      }

      setUploadResult(results);
      console.log('Upload completed:', results);
      
      if (results.success > 0) {
        toast.success(`Successfully created ${results.success} products`);
      }
      if (results.failed > 0) {
        toast.error(`Failed to create ${results.failed} products. Check the details below.`);
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  const getAcceptedFileTypes = () => {
    return activeTab === 'json' ? '.json' : '.csv,.xlsx,.xls';
  };

  const getFileInputLabel = () => {
    return activeTab === 'json' ? 'Upload JSON File' : 'Upload CSV File';
  };

  const getFilePlaceholderText = () => {
    return activeTab === 'json' 
      ? 'Choose JSON file' 
      : 'Choose CSV file';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Product Upload
        </CardTitle>
        <CardDescription>
          Upload multiple products at once using JSON or CSV templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              JSON Format
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Format
            </TabsTrigger>
          </TabsList>

          {/* JSON Tab Content */}
          <TabsContent value="json" className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Download JSON Template</p>
                  <p className="text-sm text-muted-foreground">
                    Use our JSON template to format your product data
                  </p>
                </div>
              </div>
              <Button onClick={downloadJsonTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </TabsContent>

          {/* CSV Tab Content */}
          <TabsContent value="excel" className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Download CSV Template</p>
                  <p className="text-sm text-muted-foreground">
                    Use our CSV template to format your product data
                  </p>
                </div>
              </div>
              <Button onClick={downloadExcelTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{getFileInputLabel()}</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-file"
              />
              <label
                htmlFor="bulk-upload-file"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-slate-900 transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : getFilePlaceholderText()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === 'json' 
                      ? 'Select the JSON file with your product data'
                      : 'Select the CSV file with your product data'
                    }
                  </p>
                </div>
              </label>
            </div>
            
            {selectedFile && (
              <Button
                onClick={clearFile}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading Products...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Products
            </>
          )}
        </Button>

        {/* Upload Results */}
        {uploadResult && (
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium">Upload Results</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-green-600">
                <span className="font-medium">Successful:</span> {uploadResult.success}
              </div>
              <div className="text-red-600">
                <span className="font-medium">Failed:</span> {uploadResult.failed}
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-2">Errors:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Instructions:</h4>
          {activeTab === 'json' ? (
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Download and use the provided JSON template</li>
              <li>• Add your product data to the "products" array</li>
              <li>• Save the file as JSON format</li>
              <li>• Upload the file to create multiple products at once</li>
              <li>• Each product will be validated individually</li>
              <li>• Variants can be added later through the product edit page</li>
            </ul>
          ) : (
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Download and use the provided CSV template</li>
              <li>• Fill in your product data following the column structure</li>
              <li>• Save the file as CSV format</li>
              <li>• Required fields: simpleCode, productName</li>
              <li>• Boolean fields (decoupled): use "true"/"false" or "yes"/"no"</li>
              <li>• Variants can be added later through the product edit page</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}