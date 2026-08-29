"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { BRANDING_PRODUCT_API } from "@/endpoints/rest-api/branding-product";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";
import Link from "next/link";
import { BulkProductUpload } from "./bulk-product-upload";

export default function BrandingProductsPage() {
  const [products, setProducts] = useState<IBrandingProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IBrandingProduct[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search term or filters change
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.simpleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.fullCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((product) => product.type === typeFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter, typeFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await BRANDING_PRODUCT_API.GET_ALL_BRANDING_PRODUCTS();

      if (response.error) {
        throw new Error(response.message);
      }

      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch products: ${error.message}`);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (productId: number, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      const response = await BRANDING_PRODUCT_API.DELETE_BRANDING_PRODUCT(
        productToDelete.id
      );

      if (response.error) {
        throw new Error(response.message);
      }

      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to delete product: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStatusColor = (product: IBrandingProduct) => {
    if (product.isLogo24) return "bg-blue-100 text-blue-800";
    if (product.decoupled) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (product: IBrandingProduct) => {
    if (product.isLogo24) return "Logo24";
    if (product.decoupled) return "Decoupled";
    return "Standard";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeOptions = () => {
    const types = Array.from(new Set(products.map((product) => product.type)));
    return types.map((type) => ({ value: type, label: type }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Branding Products
          </h1>
          <p className="text-muted-foreground">
            Manage your branding product catalog
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Export
          </Button> */}
          {/* Add Bulk Upload Button */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // You can implement a dialog or separate page for bulk upload
              // For now, we'll add it to the quick actions section
              document.getElementById("bulk-upload-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Link href="/admin/products/branding/create">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              All branding products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Decoupled Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.decoupled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sold separately from branding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(products.map((p) => p.type))).length}
            </div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Search and filter your branding products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {products.length === 0
                  ? "No products found"
                  : "No products match your filters"}
              </div>
              {products.length === 0 && (
                <Link href="/admin/products/branding/create">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Codes</TableHead>
                    <TableHead>Type & Material</TableHead>
                    <TableHead>Branding</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].urls[0]?.url}
                                alt={product.productName}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {product.productName}
                            </div>
                            <div className="text-sm max-w-[200px] truncate text-muted-foreground">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-mono">
                            {product.simpleCode}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {product.fullCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">{product.type}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {product.material}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(product)}>
                            {getStatusText(product)}
                          </Badge>
                          {product.brandings &&
                            product.brandings.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {product.brandings.length} position(s)
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            Min: {product.minimum} | Max: {product.maximum}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.inventoryType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(product.createdAt as string)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/branding/${product.id}?mode=view`}
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/products/branding/${product.id}?mode=edit`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openDeleteDialog(product.id, product.productName)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Info */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product
              <span className="font-semibold">
                {" "}
                "{productToDelete?.name}"
              </span>{" "}
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div id="bulk-upload-section">
        <BulkProductUpload />
      </div>
    </div>
  );
}
