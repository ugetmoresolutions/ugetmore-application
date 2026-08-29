'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Package, Loader2, ShoppingCart, Upload, Check, FileText, AlertCircle, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { GRADE_STATIONERY_API } from '@/endpoints/rest-api/gradeStationery';
import { AGGREGATED_PRODUCTS_API } from '@/endpoints/rest-api/aggregated-product';
import { IGradeStationery, IStationeryItem } from '@/interfaces/gradeStationery/gradeStationery';
import { toast } from 'sonner';
import { IAggregatedProduct } from '@/interfaces/aggregated-product/aggregated-product';
import * as XLSX from 'xlsx';

interface StationeryManagerProps {
  gradeId: number;
  gradeName: string;
}

interface UploadedProduct {
  name: string;
  matchedProducts: IAggregatedProduct[];
  selectedProducts: Map<string, number>; // Changed to Map<productCode, quantity>
  confidence?: number;
}

interface FileProcessingStats {
  totalRows: number;
  processedRows: number;
  matchedProducts: number;
  failedMatches: number;
}

export const StationeryManager: React.FC<StationeryManagerProps> = ({
  gradeId,
  gradeName,
}) => {
  const [stationery, setStationery] = useState<IGradeStationery | null>(null);
  const [productDetails, setProductDetails] = useState<IAggregatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IAggregatedProduct[]>([]);
  const [selectedSearchProducts, setSelectedSearchProducts] = useState<Map<string, number>>(new Map()); // Map<productCode, quantity>
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedProducts, setUploadedProducts] = useState<UploadedProduct[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processingStats, setProcessingStats] = useState<FileProcessingStats | null>(null);

  // Load stationery for this grade
  const loadStationery = useCallback(async () => {
    try {
      setLoading(true);
      const response = await GRADE_STATIONERY_API.GET_STATIONERY_BY_GRADE(gradeId);
      
      if (response.data) {
        setStationery(response.data);
        
        if (response.data.stationeryItems && response.data.stationeryItems.length > 0) {
          // Get product details using the new Parrot stationery endpoint
          const productCodes = response.data.stationeryItems.map(item => item.productCode);
          const products: IAggregatedProduct[] = [];
          
          // Fetch products in batches to avoid overwhelming the API
          for (let i = 0; i < productCodes.length; i += 10) {
            const batch = productCodes.slice(i, i + 10);
            for (const code of batch) {
              try {
                const productResponse = await AGGREGATED_PRODUCTS_API.GET_PARROT_PRODUCT_BY_CODE(code);
                if (productResponse.data) {
                  products.push(productResponse.data);
                }
              } catch (error) {
                console.error(`Failed to fetch product ${code}:`, error);
              }
            }
          }
          
          setProductDetails(products);
        }
      } else {
        setStationery({
          id: 0,
          gradeId,
          stationeryItems: [],
          fileUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setProductDetails([]);
      }
    } catch (error: any) {
      console.error('Failed to load stationery:', error);
      setStationery({
        id: 0,
        gradeId,
        stationeryItems: [],
        fileUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setProductDetails([]);
    } finally {
      setLoading(false);
    }
  }, [gradeId]);

  useEffect(() => {
    if (gradeId) {
      loadStationery();
    }
  }, [gradeId, loadStationery]);

  // Enhanced search with debouncing
  const handleSearch = async (searchText: string = searchTerm) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await AGGREGATED_PRODUCTS_API.GET_PARROT_STATIONERY_PRODUCTS({
        search: searchText,
        page: 1,
        limit: 50
      });
      
      if (response.data) {
        setSearchResults(response.data.products || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search products');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && showSearch) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, showSearch]);

  // Search product selection handlers with quantity
  const handleSearchProductSelect = (productCode: string, quantity: number = 1) => {
    setSelectedSearchProducts(prev => {
      const newMap = new Map(prev);
      if (quantity <= 0) {
        newMap.delete(productCode);
      } else {
        newMap.set(productCode, quantity);
      }
      return newMap;
    });
  };

  const handleSearchQuantityChange = (productCode: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    handleSearchProductSelect(productCode, newQuantity);
  };

  const handleSelectAllSearchResults = () => {
    const newMap = new Map<string, number>();
    searchResults.forEach(product => {
      newMap.set(product.fullCode, 1); // Default quantity 1
    });
    setSelectedSearchProducts(newMap);
  };

  const handleDeselectAllSearchResults = () => {
    setSelectedSearchProducts(new Map());
  };

  const handleAddSelectedSearchProducts = async () => {
    if (!stationery || selectedSearchProducts.size === 0) {
      toast.error('Please select at least one product to add');
      return;
    }

    const newItems: IStationeryItem[] = Array.from(selectedSearchProducts.entries()).map(([productCode, minQuantity]) => ({
      productCode,
      minQuantity
    }));

    try {
      setSaving(true);
      let updatedStationery: IGradeStationery;

      if (stationery.id === 0) {
        // Create new stationery
        const response = await GRADE_STATIONERY_API.CREATE_STATIONERY({
          gradeId,
          stationeryItems: newItems,
          fileUrl: null
        });
        updatedStationery = response.data!;
      } else {
        // Add to existing stationery
        const response = await GRADE_STATIONERY_API.ADD_ITEMS_TO_STATIONERY(gradeId, newItems);
        updatedStationery = response.data!;
      }

      setStationery(updatedStationery);

      // Fetch product details for new items
      const newProducts: IAggregatedProduct[] = [];
      for (const [productCode] of selectedSearchProducts) {
        try {
          const productResponse = await AGGREGATED_PRODUCTS_API.GET_PARROT_PRODUCT_BY_CODE(productCode);
          if (productResponse.data) {
            newProducts.push(productResponse.data);
          }
        } catch (error) {
          console.error(`Failed to fetch product ${productCode}:`, error);
        }
      }

      setProductDetails(prev => {
        const existingCodes = new Set(prev.map(p => p.fullCode));
        const uniqueNewProducts = newProducts.filter(p => !existingCodes.has(p.fullCode));
        return [...prev, ...uniqueNewProducts];
      });

      toast.success(`Added ${selectedSearchProducts.size} products to stationery list`);
      setSelectedSearchProducts(new Map());
      setSearchTerm('');
      setShowSearch(false);
    } catch (error: any) {
      console.error('Failed to add products:', error);
      toast.error(error.response?.data?.message || 'Failed to add products');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedSearchProducts(new Map());
  };

  // Enhanced file upload product selection handlers with quantity
  const handleUploadedProductSelect = (productName: string, productCode: string, quantity: number = 1) => {
    setUploadedProducts(prev => 
      prev.map(item => 
        item.name === productName 
          ? {
              ...item,
              selectedProducts: new Map([...item.selectedProducts, [productCode, quantity]])
            }
          : item
      )
    );
  };

  const handleUploadedProductDeselect = (productName: string, productCode: string) => {
    setUploadedProducts(prev => 
      prev.map(item => 
        item.name === productName 
          ? {
              ...item,
              selectedProducts: new Map([...item.selectedProducts].filter(([code]) => code !== productCode))
            }
          : item
      )
    );
  };

  const handleUploadedQuantityChange = (productName: string, productCode: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUploadedProducts(prev => 
      prev.map(item => 
        item.name === productName 
          ? {
              ...item,
              selectedProducts: new Map([...item.selectedProducts].map(([code, quantity]) => 
                code === productCode ? [code, newQuantity] : [code, quantity]
              ))
            }
          : item
      )
    );
  };

  const handleToggleAllUploadedProducts = (selected: boolean) => {
    setUploadedProducts(prev => 
      prev.map(item => ({
        ...item,
        selectedProducts: selected && item.matchedProducts.length > 0 
          ? new Map(item.matchedProducts.map(p => [p.fullCode, 1])) // Default quantity 1
          : new Map()
      }))
    );
  };

  const handleSelectAllForProduct = (productName: string) => {
    setUploadedProducts(prev => 
      prev.map(item => 
        item.name === productName 
          ? {
              ...item,
              selectedProducts: new Map(item.matchedProducts.map(p => [p.fullCode, 1])) // Default quantity 1
            }
          : item
      )
    );
  };

  const handleDeselectAllForProduct = (productName: string) => {
    setUploadedProducts(prev => 
      prev.map(item => 
        item.name === productName 
          ? {
              ...item,
              selectedProducts: new Map()
            }
          : item
      )
    );
  };

  // Calculate total selected products from uploaded file
  const getTotalSelectedUploadedProducts = () => {
    return uploadedProducts.reduce((total, item) => total + item.selectedProducts.size, 0);
  };

  // Add selected uploaded products to stationery
  const handleAddSelectedUploadedProducts = async () => {
    if (!stationery) return;

    const allSelectedItems: IStationeryItem[] = uploadedProducts.flatMap(item => 
      Array.from(item.selectedProducts.entries()).map(([productCode, minQuantity]) => ({
        productCode,
        minQuantity
      }))
    );

    if (allSelectedItems.length === 0) {
      toast.error('Please select at least one product to add');
      return;
    }

    try {
      setSaving(true);
      let updatedStationery: IGradeStationery;

      if (stationery.id === 0) {
        // Create new stationery
        const response = await GRADE_STATIONERY_API.CREATE_STATIONERY({
          gradeId,
          stationeryItems: allSelectedItems,
          fileUrl: null
        });
        updatedStationery = response.data!;
      } else {
        // Add to existing stationery
        const response = await GRADE_STATIONERY_API.ADD_ITEMS_TO_STATIONERY(gradeId, allSelectedItems);
        updatedStationery = response.data!;
      }

      setStationery(updatedStationery);

      // Fetch product details for new items
      const newProductCodes = allSelectedItems.map(item => item.productCode);
      const newProducts: IAggregatedProduct[] = [];
      for (const productCode of newProductCodes) {
        try {
          const response = await AGGREGATED_PRODUCTS_API.GET_PARROT_PRODUCT_BY_CODE(productCode);
          if (response.data) {
            newProducts.push(response.data);
          }
        } catch (error) {
          console.error(`Failed to fetch product ${productCode}:`, error);
        }
      }

      setProductDetails(prev => {
        const existingCodes = new Set(prev.map(p => p.fullCode));
        const uniqueNewProducts = newProducts.filter(p => !existingCodes.has(p.fullCode));
        return [...prev, ...uniqueNewProducts];
      });

      toast.success(`Added ${allSelectedItems.length} products to stationery list`);
      setShowUpload(false);
      setUploadedProducts([]);
      setFile(null);
      setProcessingStats(null);
    } catch (error: any) {
      console.error('Failed to add products:', error);
      toast.error(error.response?.data?.message || 'Failed to add products');
    } finally {
      setSaving(false);
    }
  };

  // File processing functions (same as before, but updated to use Map for quantities)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const matchingWords = words1.filter(word => 
      words2.some(w2 => w2.includes(word) || word.includes(w2))
    );
    
    return matchingWords.length / Math.max(words1.length, words2.length);
  };

  const searchProductsWithFuzzyMatch = async (productName: string): Promise<IAggregatedProduct[]> => {
    try {
      const response = await AGGREGATED_PRODUCTS_API.GET_PARROT_STATIONERY_PRODUCTS({
        search: productName,
        page: 1,
        limit: 10
      });
      return response.data?.products || [];
    } catch (error) {
      console.error('Search failed for:', productName, error);
      return [];
    }
  };

 
// Replace the processExcelFile function with this:
const processExcelFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const productNames: string[] = [];

        // Process all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          jsonData.forEach((row: any) => {
            if (Array.isArray(row)) {
              row.forEach(cell => {
                if (typeof cell === 'string' && isValidProductName(cell)) {
                  productNames.push(cell);
                }
              });
            }
          });
        });

        const filteredNames = filterProductNames([...new Set(productNames)]);
        resolve(filteredNames.slice(0, 100));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};


  const processCSVFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const productNames: string[] = [];
        
        lines.forEach((line, lineIndex) => {
          // Enhanced CSV parsing that handles quoted fields and various separators
          const columns = parseCSVLine(line);
          
          columns.forEach((column, colIndex) => {
            const trimmedColumn = column.trim();
            if (isValidProductName(trimmedColumn)) {
              productNames.push(trimmedColumn);
            }
          });

          // Also look for product names in the line text itself
          const textMatches = line.match(/[A-Za-z][A-Za-z\s&,.-]{2,}(?:\s+[A-Za-z][A-Za-z\s&,.-]{1,})*/g);
          if (textMatches) {
            textMatches.forEach(match => {
              const name = match.trim();
              if (isValidProductName(name)) {
                productNames.push(name);
              }
            });
          }
        });

        // Filter out common non-product words and duplicates
        const filteredNames = filterProductNames([...new Set(productNames)]);
        resolve(filteredNames.slice(0, 100));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};


const isValidProductName = (name: string): boolean => {
  if (!name || name.length < 2) return false;
  
  const trimmedName = name.trim();
  
  // Common exclusion patterns
  const excludePatterns = [
    /^\d+$/, // Pure numbers
    /^(total|subtotal|quantity|qty|price|cost|amount|description|item|product|code|id|date|invoice|number|grade|school|student|teacher)/i,
    /^(mr|mrs|ms|dr|prof)/i, // Titles
    /^(street|avenue|road|lane|drive|city|state|zip|postal|phone|email|fax)/i, // Address components
    /^[A-Z]\s*$/, // Single letters (like column headers)
    /^\d+\/\d+\/\d+$/, // Dates
    /^\d+\.\d+$/, // Prices
    /^[+-]?\d+$/, // Numbers with signs
    /^[^A-Za-z]*$/, // No letters at all
  ];

  // Check if name matches any exclusion pattern
  if (excludePatterns.some(pattern => pattern.test(trimmedName))) {
    return false;
  }

  // Should contain at least some letters and be meaningful
  const letterCount = (trimmedName.match(/[A-Za-z]/g) || []).length;
  if (letterCount < 2) return false;

  return true;
};

/**
 * Parse a CSV line handling quoted fields and various separators
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      if (nextChar === quoteChar) {
        // Escaped quote
        current += char;
        i++; // Skip next quote
      } else {
        // End of quoted field
        inQuotes = false;
        result.push(current);
        current = '';
        // Skip following comma or separator if present
        if (line[i + 1] === ',' || line[i + 1] === ';' || line[i + 1] === '\t') {
          i++;
        }
      }
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      // Field separator outside quotes
      if (current.trim()) {
        result.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  if (current.trim()) {
    result.push(current.trim());
  }

  return result.filter(field => field.length > 0);
};

/**
 * Filter out common non-product words and clean up the list
 */
const filterProductNames = (names: string[]): string[] => {
  const commonNonProducts = [
    'description', 'item', 'product', 'name', 'title',
    'qty', 'quantity', 'amount', 'price', 'cost', 'total',
    'subtotal', 'invoice', 'number', 'date', 'id', 'code',
    'unit', 'measure', 'size', 'color', 'weight', 'dimensions'
  ];

  return names.filter(name => {
    const lowerName = name.toLowerCase();
    
    // Filter out very short names
    if (name.length < 2) return false;
    
    // Filter out common non-product terms
    if (commonNonProducts.some(term => 
      lowerName === term || 
      lowerName.startsWith(term + ' ') || 
      lowerName.endsWith(' ' + term)
    )) {
      return false;
    }

    // Filter out names that are mostly numbers or special chars
    const letterRatio = (name.match(/[A-Za-z]/g) || []).length / name.length;
    if (letterRatio < 0.3) return false;

    return true;
  });
};

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = event.target.files?.[0];
  if (!selectedFile) return;

  // More flexible file type validation
  const validExtensions = ['xlsx', 'xls', 'csv', 'ods', 'txt'];
  const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    toast.error('Please upload a valid Excel, CSV, or text file');
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    toast.error('File size must be less than 10MB');
    return;
  }

  setFile(selectedFile);
  await processFile(selectedFile);
};

// Update the processFile function to handle binary files:
const processFile = async (file: File) => {
  setUploading(true);
  setProcessingStats({
    totalRows: 0,
    processedRows: 0,
    matchedProducts: 0,
    failedMatches: 0
  });

  try {
    let productNames: string[];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isExcel = file.type.includes('sheet') || 
                   file.name.match(/\.(xlsx|xls|ods)$/i) ||
                   fileExtension === 'xlsx' || 
                   fileExtension === 'xls';

    if (isExcel) {
      productNames = await processExcelFile(file);
    } else {
      productNames = await processCSVFile(file);
    }

    if (productNames.length === 0) {
      toast.error('No valid product names found in the file. Please check the file format.');
      return;
    }

    // Continue with existing processing logic...
    setProcessingStats(prev => prev ? { ...prev, totalRows: productNames.length } : null);

    const batchSize = 5;
    const uploadedProductsData: UploadedProduct[] = [];

    for (let i = 0; i < productNames.length; i += batchSize) {
      const batch = productNames.slice(i, i + batchSize);
      const batchPromises = batch.map(async (name) => {
        try {
          const matchedProducts = await searchProductsWithFuzzyMatch(name);
          
          const productsWithConfidence = matchedProducts.map(product => ({
            ...product,
            confidence: calculateSimilarity(name, product.productName)
          })).sort((a, b) => b.confidence - a.confidence);

          return {
            name,
            matchedProducts: productsWithConfidence,
            selectedProducts: new Map<string, number>(),
            confidence: productsWithConfidence.length > 0 ? productsWithConfidence[0].confidence : 0
          };
        } catch (error) {
          console.error(`Failed to process product: ${name}`, error);
          return {
            name,
            matchedProducts: [],
            selectedProducts: new Map<string, number>()
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      uploadedProductsData.push(...batchResults);
      
      setProcessingStats(prev => prev ? {
        ...prev,
        processedRows: i + batch.length,
        matchedProducts: batchResults.filter(r => r.matchedProducts.length > 0).length,
        failedMatches: batchResults.filter(r => r.matchedProducts.length === 0).length
      } : null);

      // Small delay to avoid overwhelming the API
      if (i + batchSize < productNames.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setUploadedProducts(uploadedProductsData);
    
    const matchedCount = uploadedProductsData.filter(p => p.matchedProducts.length > 0).length;
    toast.success(`Processed ${productNames.length} products. Found ${matchedCount} matches.`);

  } catch (error) {
    console.error('File processing failed:', error);
    toast.error('Failed to process file. Please check the file format and try again.');
  } finally {
    setUploading(false);
  }
};
  // Update quantity for existing stationery item
  const handleUpdateQuantity = async (productCode: string, newQuantity: number) => {
    if (!stationery || newQuantity < 1) return;

    try {
      setSaving(true);
      const response = await GRADE_STATIONERY_API.UPDATE_ITEM_QUANTITY(gradeId, productCode, newQuantity);
      if (response.data) {
        setStationery(response.data);
        toast.success('Quantity updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveItem = async (productCode: string) => {
    if (!stationery) return;

    try {
      setSaving(true);
      const response = await GRADE_STATIONERY_API.REMOVE_ITEM_FROM_STATIONERY(gradeId, productCode);
      if (response.data) {
        setStationery(response.data);
        setProductDetails(prev => prev.filter(product => product.fullCode !== productCode));
        toast.success('Item removed from stationery list');
      }
    } catch (error: any) {
      console.error('Failed to remove item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setSaving(false);
    }
  };

  const getProductDetail = (productCode: string): IAggregatedProduct | undefined => {
    return productDetails.find(product => product.fullCode === productCode);
  };

  const getStationeryItem = (productCode: string): IStationeryItem | undefined => {
    return stationery?.stationeryItems.find(item => item.productCode === productCode);
  };

  const handleSaveStationery = async () => {
    if (!stationery) return;

    setSaving(true);
    try {
      let response;
      if (stationery.id === 0) {
        response = await GRADE_STATIONERY_API.CREATE_STATIONERY({
          gradeId: stationery.gradeId,
          stationeryItems: stationery.stationeryItems,
          fileUrl: stationery.fileUrl
        });
      } else {
        response = await GRADE_STATIONERY_API.UPDATE_STATIONERY_BY_GRADE(gradeId, {
          stationeryItems: stationery.stationeryItems,
          fileUrl: stationery.fileUrl
        });
      }
      
      if (response.data) {
        setStationery(response.data);
        toast.success('Stationery list saved successfully');
      }
    } catch (error: any) {
      console.error('Failed to save stationery:', error);
      toast.error(error.response?.data?.message || 'Failed to save stationery');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    if (!stationery) return { totalItems: 0, totalCost: 0, totalQuantity: 0 };

    const { totalCost, totalQuantity } = stationery.stationeryItems.reduce((acc, item) => {
      const product = getProductDetail(item.productCode);
      const quantity = item.minQuantity;
      const cost = (product?.price || 0) * quantity;
      return {
        totalCost: acc.totalCost + cost,
        totalQuantity: acc.totalQuantity + quantity
      };
    }, { totalCost: 0, totalQuantity: 0 });

    return {
      totalItems: stationery.stationeryItems.length,
      totalCost,
      totalQuantity
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading stationery...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Stationery Requirements</h3>
          <p className="text-muted-foreground text-sm">
            Manage required stationery items for {gradeName}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUpload(!showUpload)}
            variant="outline"
            size="sm"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload List
          </Button>
          
          <Button
            onClick={() => setShowSearch(!showSearch)}
            variant="outline"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            {showSearch ? 'Hide Search' : 'Add Items'}
          </Button>
          
          <Button
            onClick={handleSaveStationery}
            disabled={saving || !stationery}
            size="sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            Save Stationery
          </Button>
        </div>
      </div>

      {/* Enhanced Upload Panel with Quantity Support */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Stationery List
                {getTotalSelectedUploadedProducts() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getTotalSelectedUploadedProducts()} selected
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpload(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Upload an Excel or CSV file with product names. Select products and set quantities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv,.ods"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label 
                htmlFor="file-upload" 
                className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">
                  {file ? file.name : 'Choose Excel or CSV file'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: .xlsx, .xls, .csv (Max 10MB)
                </p>
              </label>
            </div>

            {/* Processing Progress */}
            {uploading && processingStats && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing products...</span>
                  <span>{processingStats.processedRows} / {processingStats.totalRows}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processingStats.processedRows / processingStats.totalRows) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Matched: {processingStats.matchedProducts}</span>
                  <span>Failed: {processingStats.failedMatches}</span>
                </div>
              </div>
            )}

            {/* Uploaded Products List with Quantity Support */}
            {uploadedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h4 className="font-medium">
                      Found Products ({uploadedProducts.filter(p => p.matchedProducts.length > 0).length}/{uploadedProducts.length})
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleAllUploadedProducts(true)}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleAllUploadedProducts(false)}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleAddSelectedUploadedProducts} size="sm" disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Add Selected ({getTotalSelectedUploadedProducts()})
                  </Button>
                </div>

                <ScrollArea className="h-96 border rounded-md">
                  <div className="p-4 space-y-4">
                    {uploadedProducts.map((uploadedProduct, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  uploadedProduct.matchedProducts.length > 0 ? "default" : "destructive"
                                }
                              >
                                {uploadedProduct.matchedProducts.length} matches
                              </Badge>
                              {uploadedProduct.selectedProducts.size > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {uploadedProduct.selectedProducts.size} selected
                                </Badge>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">{uploadedProduct.name}</span>
                              {uploadedProduct.confidence && uploadedProduct.confidence < 0.7 && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Low confidence
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSelectAllForProduct(uploadedProduct.name)}
                              disabled={uploadedProduct.matchedProducts.length === 0}
                            >
                              Select All
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeselectAllForProduct(uploadedProduct.name)}
                              disabled={uploadedProduct.selectedProducts.size === 0}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>

                        {/* Product Matches with Quantity Selection */}
                        {uploadedProduct.matchedProducts.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Select matching products and set quantities:</p>
                            <div className="grid gap-2">
                              {uploadedProduct.matchedProducts.map((product) => {
                                const quantity = uploadedProduct.selectedProducts.get(product.fullCode) || 0;
                                const isSelected = quantity > 0;
                                
                                return (
                                  <div
                                    key={product.fullCode}
                                    className={`flex items-center justify-between p-3 border rounded-lg ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            handleUploadedProductSelect(uploadedProduct.name, product.fullCode, 1);
                                          } else {
                                            handleUploadedProductDeselect(uploadedProduct.name, product.fullCode);
                                          }
                                        }}
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium text-sm">
                                            {product.productName}
                                          </h4>
                                          <Badge variant="secondary" className="text-xs">
                                            {product.fullCode}
                                          </Badge>
                                          {product.confidence && (
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${
                                                product.confidence > 0.8 ? 'bg-green-50' : 
                                                product.confidence > 0.6 ? 'bg-yellow-50' : 'bg-orange-50'
                                              }`}
                                            >
                                              {Math.round(product.confidence * 100)}% match
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                          {product.categories[0]?.name}
                                        </p>
                                        <div className="flex gap-4 mt-1 text-xs">
                                          <span className="text-green-600 font-medium">
                                            R {product.price?.toFixed(2)}
                                          </span>
                                          <span className="text-blue-600">
                                            Stock: {product.stockInfo?.stock || 0}
                                          </span>
                                          <span className="text-gray-600">
                                            Brand: {product.brand?.name || 'Unknown'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {isSelected && (
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center border rounded-md">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                              const currentQty = uploadedProduct.selectedProducts.get(product.fullCode) || 1;
                                              handleUploadedQuantityChange(uploadedProduct.name, product.fullCode, currentQty - 1);
                                            }}
                                            disabled={quantity <= 1}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => {
                                              const newQty = parseInt(e.target.value) || 1;
                                              handleUploadedQuantityChange(uploadedProduct.name, product.fullCode, newQty);
                                            }}
                                            className="w-16 h-8 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => {
                                              const currentQty = uploadedProduct.selectedProducts.get(product.fullCode) || 1;
                                              handleUploadedQuantityChange(uploadedProduct.name, product.fullCode, currentQty + 1);
                                            }}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <Check className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            No matching products found. Try adding this item manually.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Search Panel with Quantity Support */}
      {showSearch && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Products
                {selectedSearchProducts.size > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSearchProducts.size} selected
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Search products, set quantities, and add to your stationery list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, description, or stock code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={() => handleSearch()} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Actions */}
            {searchResults.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllSearchResults}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeselectAllSearchResults}
                  >
                    Deselect All
                  </Button>
                </div>
                <Button 
                  onClick={handleAddSelectedSearchProducts}
                  disabled={selectedSearchProducts.size === 0 || saving}
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Selected ({selectedSearchProducts.size})
                </Button>
              </div>
            )}

            {/* Search Results with Quantity Selection */}
            {searchResults.length > 0 && (
              <ScrollArea className="h-96 border rounded-md">
                <div className="p-4 space-y-3">
                  {searchResults.map((product) => {
                    const quantity = selectedSearchProducts.get(product.fullCode) || 0;
                    const isSelected = quantity > 0;
                    
                    return (
                      <div
                        key={product.fullCode}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          isSelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleSearchProductSelect(product.fullCode, 1);
                              } else {
                                handleSearchProductSelect(product.fullCode, 0);
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {product.productName}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {product.fullCode}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.categories[0]?.name}
                            </p>
                            <div className="flex gap-4 mt-1 text-xs">
                              
                              <span className="text-blue-600">
                                Stock: {product.stockInfo?.stock || 0}
                              </span>
                              <span className="text-gray-600">
                                Brand: {product.brand?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const currentQty = selectedSearchProducts.get(product.fullCode) || 1;
                                  handleSearchQuantityChange(product.fullCode, currentQty - 1);
                                }}
                                disabled={quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  handleSearchQuantityChange(product.fullCode, newQty);
                                }}
                                className="w-16 h-8 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const currentQty = selectedSearchProducts.get(product.fullCode) || 1;
                                  handleSearchQuantityChange(product.fullCode, currentQty + 1);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {searchTerm && searchResults.length === 0 && !searching && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p>No products found matching "{searchTerm}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stationery List with Quantity Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stationery List</span>
            <div className="flex items-center gap-4 text-sm">
              <span>Items: {totals.totalItems}</span>
              <span>Total Qty: {totals.totalQuantity}</span>
              
            </div>
          </CardTitle>
          <CardDescription>
            {stationery?.stationeryItems.length === 0 
              ? 'No stationery items added yet. Upload a list or search to add items.'
              : 'Manage quantities for each stationery item'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stationery?.stationeryItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No stationery items added yet</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button 
                  onClick={() => setShowUpload(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload List
                </Button>
                <Button 
                  onClick={() => setShowSearch(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Search Items
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stationery?.stationeryItems.map((stationeryItem) => {
                const product = getProductDetail(stationeryItem.productCode);
                const quantity = stationeryItem.minQuantity;
                
                if (!product) {
                  return (
                    <div key={stationeryItem.productCode} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading product {stationeryItem.productCode}...</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={product.fullCode}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {product.images && product.images[0]?.urls[0]?.url && (
                        <img
                          src={product.images[0].urls[0].url}
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{product.productName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {product.fullCode}
                          </Badge>
                        </div>
                       
                        <div className="flex gap-4 mt-1 text-xs">
                          
                          <span className="text-blue-600">Brand: {product.brand?.name || 'Unknown'}</span>
                          <span className="text-green-600">Stock: {product.stockInfo?.stock || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(product.fullCode, quantity - 1)}
                          disabled={quantity <= 1 || saving}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            if (newQty !== quantity) {
                              handleUpdateQuantity(product.fullCode, newQty);
                            }
                          }}
                          className="w-16 h-8 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          disabled={saving}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(product.fullCode, quantity + 1)}
                          disabled={saving}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(product.fullCode)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};