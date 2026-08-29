"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, X, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STOCK_API } from "@/endpoints/rest-api/stock";
import { BRANDING_PRODUCT_API } from "@/endpoints/rest-api/branding-product";
import { IStockItem, IStock } from "@/interfaces/stock/stock.interface";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";

// Add Stock Modal Component
interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockAdded: () => void;
}

function AddStockModal({ isOpen, onClose, onStockAdded }: AddStockModalProps) {
  const [products, setProducts] = useState<IBrandingProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IBrandingProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [formData, setFormData] = useState({
    stock: 0,
    reservedStock: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await BRANDING_PRODUCT_API.GET_ALL_BRANDING_PRODUCTS();
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    try {
      setIsLoading(true);
      const stockData = {
        productId: selectedProduct.id,
        fullCode: selectedProduct.fullCode,
        stock: formData.stock,
        reservedStock: formData.reservedStock,
      };

      const response = await STOCK_API.CREATE_STOCK(stockData);
      
      if (response.data) {
        toast.success("Stock added successfully!");
        setFormData({ stock: 0, reservedStock: 0 });
        setSelectedProduct(null);
        onStockAdded();
        onClose();
      }
    } catch (error: any) {
      toast.error("Failed to add stock", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>
            Select a product and add stock information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Product *</label>
              <Select
                value={selectedProduct?.id.toString() || ""}
                onValueChange={(value) => {
                  const product = products.find(p => p.id.toString() === value);
                  setSelectedProduct(product || null);
                }}
                disabled={isLoadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.productName} - {product.fullCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingProducts && (
                <p className="text-sm text-muted-foreground">Loading products...</p>
              )}
            </div>

            {selectedProduct && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Product Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Code:</span>
                      <span className="ml-2 font-medium">{selectedProduct.fullCode}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <span className="ml-2 font-medium">{selectedProduct.material}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Quantity *</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      stock: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reserved Stock *</label>
                  <Input
                    type="number"
                    value={formData.reservedStock}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reservedStock: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                    max={formData.stock}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available Stock: {formData.stock - formData.reservedStock}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedProduct}
            >
              {isLoading ? "Adding..." : "Add Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const STOCK_TYPE_OPTIONS = [
  { value: "1", label: "Regular Stock" },
  { value: "2", label: "Safety Stock" },
  { value: "3", label: "Return Stock" },
  { value: "4", label: "Damaged Stock" },
];

const CATEGORY_OPTIONS = [
  "All Categories",
  "Tools",
  "Apparel",
  "Drinkware",
  "Stationery",
  "Bags",
  "Headwear",
];

export function StockManagementPage() {
  const [stockItems, setStockItems] = useState<IStockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IStockItem | null>(null);
  const [formData, setFormData] = useState({
    stock: 0,
    reservedStock: 0,
  });

  // Load stock data
  const loadStockData = async () => {
    try {
      setIsLoading(true);
      const stockResponse = await STOCK_API.GET_ALL_STOCKS();
      
      if (stockResponse.data) {
        // Fetch product details for each stock item
        const stockItemsWithProductInfo = await Promise.all(
          stockResponse.data.map(async (stock: IStock) => {
            try {
              const productResponse = await BRANDING_PRODUCT_API.GET_BRANDING_PRODUCT_BY_ID(stock.productId);
              const product = productResponse.data;
              
              return {
                ...stock,
                productName: product?.productName || 'Unknown Product',
                simpleCode: product?.simpleCode || '',
                material: product?.material || '',
                category: product?.categories?.[0]?.name || 'Uncategorized',
                // You might need to extract color information from fullCode or product data
                colourCode: extractColorCode(product?.fullCode || ''),
                colourName: extractColorName(product?.fullCode || ''),
                minimumStock: 1000, // You can get this from product data if available
                maximumStock: 50000, // You can get this from product data if available
              } as IStockItem;
            } catch (error) {
              console.error(`Failed to fetch product ${stock.productId}:`, error);
              return {
                ...stock,
                productName: 'Product Not Found',
                simpleCode: '',
                material: '',
                category: 'Unknown',
                colourCode: '',
                colourName: '',
                minimumStock: 1000,
                maximumStock: 50000,
              } as IStockItem;
            }
          })
        );

        setStockItems(stockItemsWithProductInfo);
        setFilteredItems(stockItemsWithProductInfo);
      }
    } catch (error: any) {
      toast.error("Failed to load stock data", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to extract color information from fullCode
  const extractColorCode = (fullCode: string): string => {
    const parts = fullCode.split('-');
    return parts[parts.length - 1] || '';
  };

  const extractColorName = (colorCode: string): string => {
    const colorMap: { [key: string]: string } = {
      'GM': 'Gun Metal',
      'BL': 'Blue',
      'BK': 'Black',
      'WH': 'White',
      'RD': 'Red',
      'GR': 'Green',
      'YL': 'Yellow',
      'NV': 'Navy',
    };
    return colorMap[colorCode] || colorCode;
  };

  useEffect(() => {
    loadStockData();
  }, []);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = stockItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.simpleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fullCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.colourName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Stock status filter
    if (stockStatusFilter !== "all") {
      switch (stockStatusFilter) {
        case "low":
          filtered = filtered.filter(item => item.stock < (item.minimumStock || 1000));
          break;
        case "adequate":
          filtered = filtered.filter(item => 
            item.stock >= (item.minimumStock || 1000) && 
            item.stock <= (item.maximumStock || 50000)
          );
          break;
        case "overstocked":
          filtered = filtered.filter(item => item.stock > (item.maximumStock || 50000));
          break;
      }
    }

    setFilteredItems(filtered);
  }, [searchTerm, categoryFilter, stockStatusFilter, stockItems]);

  // Open edit modal
  const handleEdit = (item: IStockItem) => {
    setSelectedItem(item);
    setFormData({
      stock: item.stock,
      reservedStock: item.reservedStock,
    });
    setIsEditModalOpen(true);
  };

  // Open delete dialog
  const handleDelete = (item: IStockItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    try {
      setIsLoading(true);
      
      const response = await STOCK_API.UPDATE_STOCK(selectedItem.id, {
        stock: formData.stock,
        reservedStock: formData.reservedStock,
      });

      if (response.data) {
        // Update local state
        setStockItems(prev => prev.map(item =>
          item.id === selectedItem.id
            ? {
                ...item,
                ...response.data,
                availableStock: formData.stock - formData.reservedStock,
              }
            : item
        ));

        setIsEditModalOpen(false);
        setSelectedItem(null);
        toast.success("Stock updated successfully!", {
          description: `${selectedItem.productName} stock has been updated.`,
        });
      }
    } catch (error: any) {
      toast.error("Failed to update stock", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setIsLoading(true);
      
      const response = await STOCK_API.DELETE_STOCK(selectedItem.id);
      
      if (response.data) {
        // Remove the item from state
        setStockItems(prev => prev.filter(item => item.id !== selectedItem.id));

        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
        toast.success("Stock item deleted successfully!", {
          description: `${selectedItem.productName} has been removed from stock management.`,
        });
      }
    } catch (error: any) {
      toast.error("Failed to delete stock item", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get stock status badge
  const getStockStatus = (item: IStockItem) => {
    const minStock = item.minimumStock || 1000;
    const maxStock = item.maximumStock || 50000;

    if (item.stock < minStock) {
      return { label: "Low Stock", variant: "destructive" as const };
    } else if (item.stock > maxStock) {
      return { label: "Overstocked", variant: "warning" as const };
    } else {
      return { label: "Adequate", variant: "success" as const };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics
  const statistics = {
    totalItems: stockItems.length,
    lowStockItems: stockItems.filter(item => item.stock < (item.minimumStock || 1000)).length,
    totalStockValue: stockItems.reduce((sum, item) => sum + item.stock, 0),
    totalAvailableStock: stockItems.reduce((sum, item) => sum + item.availableStock, 0),
  };

  if (isLoading && stockItems.length === 0) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-900" />
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your product inventory levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadStockData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Active stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{statistics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need replenishment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Units in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalAvailableStock.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for sale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Overview</CardTitle>
          <CardDescription>
            Search and filter your stock items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, code, or color..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="adequate">Adequate</SelectItem>
                <SelectItem value="overstocked">Overstocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
          <CardDescription>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No stock items found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.simpleCode} • {item.fullCode}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.category} • {item.material}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{
                                backgroundColor: item.colourCode === 'WH' ? '#ffffff' :
                                                item.colourCode === 'BK' ? '#000000' :
                                                item.colourCode === 'RD' ? '#dc2626' :
                                                item.colourCode === 'BL' ? '#2563eb' :
                                                item.colourCode === 'GM' ? '#6b7280' :
                                                item.colourCode === 'NV' ? '#1e3a8a' : '#d1d5db',
                                borderColor: item.colourCode === 'WH' ? '#d1d5db' : 'transparent'
                              }}
                            />
                            <span>{item.colourName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.stock.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {item.reservedStock.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {item.availableStock.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.updatedAt ? formatDate(item.updatedAt) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStockAdded={loadStockData}
      />

      {/* Edit Stock Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
            <DialogDescription>
              Update stock information for {selectedItem?.productName}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Code</label>
                  <Input value={selectedItem?.fullCode || ""} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input value={selectedItem?.colourName || ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Stock *</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reserved Stock *</label>
                <Input
                  type="number"
                  value={formData.reservedStock}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reservedStock: parseInt(e.target.value) || 0
                  }))}
                  min="0"
                  max={formData.stock}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available Stock: {formData.stock - formData.reservedStock}
                </p>
              </div>

              {selectedItem && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Stock Limits</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Minimum:</span>
                      <span className="ml-2 font-medium">{(selectedItem.minimumStock || 1000).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maximum:</span>
                      <span className="ml-2 font-medium">{(selectedItem.maximumStock || 50000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the stock record for{" "}
              <strong>{selectedItem?.productName}</strong> ({selectedItem?.fullCode}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Stock Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}