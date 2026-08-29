"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Tag,
  Users,
  Search,
  Save,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Building,
  FolderTree,
  Layers,
  MoreVertical,
  Loader2,
  Eye,
  Grid3x3,
  ListTree,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import API endpoints
import { 
  SUPPLIER_API, 
  ISupplier, 
  ICreateSupplier 
} from '@/endpoints/rest-api/supplier';
import { 
  CATEGORY_API, 
  ICategory, 
  ICreateCategory,
  IMainCategory
} from '@/endpoints/rest-api/categories';
import { 
  SUB_CATEGORY_API, 
  ISubCategory, 
  ICreateSubCategory 
} from '@/endpoints/rest-api/subCategories';

type TabType = 'suppliers' | 'categories' | 'subcategories';

interface AddFormData {
  name: string;
  description?: string;
  account?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  mainCategoryId?: string;
  categoryId?: number;
}

const ProductManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('suppliers');
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategories, setSubCategories] = useState<ISubCategory[]>([]);
  const [mainCategories, setMainCategories] = useState<IMainCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [formData, setFormData] = useState<AddFormData>({
    name: '',
    description: '',
    account: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    mainCategoryId: '',
    categoryId: undefined
  });

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load all data on component mount
  useEffect(() => {
    loadMainCategories();
    loadData();
  }, [activeTab]);

  const loadMainCategories = async () => {
    try {
      const response = await CATEGORY_API.GET_ALL_MAIN_CATEGORIES();
      if (response.error === false) {
        setMainCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading main categories:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await CATEGORY_API.GET_ALL_CATEGORIES();
      if (response.error === false) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'suppliers':
          const suppliersResponse = await SUPPLIER_API.GET_ALL_SUPPLIERS();
          if (suppliersResponse.error === false) {
            setSuppliers(suppliersResponse.data || []);
          }
          break;
        case 'categories':
          const categoriesResponse = await CATEGORY_API.GET_ALL_CATEGORIES();
          if (categoriesResponse.error === false) {
            setCategories(categoriesResponse.data || []);
          }
          break;
        case 'subcategories':
          const subCategoriesResponse = await SUB_CATEGORY_API.GET_ALL_SUB_CATEGORIES();
          if (subCategoriesResponse.error === false) {
            setSubCategories(subCategoriesResponse.data || []);
          }
          if (categories.length === 0) {
            await loadCategories();
          }
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filterItems = (items: any[]) => {
    return items.filter(item => {
      // Basic search
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.account && item.account.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by main category (for categories)
      if (activeTab === 'categories' && selectedMainCategory !== 'all') {
        return matchesSearch && item.mainCategoryId === selectedMainCategory;
      }
      
      // Filter by category (for subcategories)
      if (activeTab === 'subcategories' && selectedCategory !== 'all') {
        return matchesSearch && item.categoryId === parseInt(selectedCategory);
      }
      
      return matchesSearch;
    });
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'suppliers': return filterItems(suppliers);
      case 'categories': return filterItems(categories);
      case 'subcategories': return filterItems(subCategories);
      default: return [];
    }
  };

  // Handle form changes
  const handleFormChange = (key: keyof AddFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // If main category changes, reset category selection
    if (key === 'mainCategoryId' && value !== formData.mainCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: undefined }));
    }
  };

  // Add new item
  const handleAdd = async () => {
    setActionLoading(true);
    try {
      switch (activeTab) {
        case 'suppliers':
          const supplierData: ICreateSupplier = {
            name: formData.name,
            account: formData.account!,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          };
          const supplierResponse = await SUPPLIER_API.CREATE_SUPPLIER(supplierData);
          if (supplierResponse.error === false) {
            setSuppliers(prev => [...prev, supplierResponse.data!]);
            toast.success('Supplier created successfully', {
              description: `Supplier "${formData.name}" has been added.`
            });
          } else {
            toast.error(supplierResponse.message || 'Failed to create supplier');
          }
          break;
        
        case 'categories':
          if (!formData.mainCategoryId) {
            toast.error('Please select a main category');
            setActionLoading(false);
            return;
          }
          const categoryData: ICreateCategory = {
            name: formData.name,
            mainCategoryId: formData.mainCategoryId,
            description: formData.description,
          };
          const categoryResponse = await CATEGORY_API.CREATE_CATEGORY(categoryData);
          if (categoryResponse.error === false) {
            setCategories(prev => [...prev, categoryResponse.data!]);
            toast.success('Category created successfully', {
              description: `Category "${formData.name}" has been added.`
            });
          } else {
            toast.error(categoryResponse.message || 'Failed to create category');
          }
          break;
        
        case 'subcategories':
          if (!formData.categoryId) {
            toast.error('Please select a parent category');
            setActionLoading(false);
            return;
          }
          const subCategoryData: ICreateSubCategory = {
            name: formData.name,
            categoryId: formData.categoryId,
            description: formData.description,
          };
          const subCategoryResponse = await SUB_CATEGORY_API.CREATE_SUB_CATEGORY(subCategoryData);
          if (subCategoryResponse.error === false) {
            setSubCategories(prev => [...prev, subCategoryResponse.data!]);
            toast.success('Sub-category created successfully', {
              description: `Sub-category "${formData.name}" has been added.`
            });
          } else {
            toast.error(subCategoryResponse.message || 'Failed to create sub-category');
          }
          break;
      }
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to create item');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit item
  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'suppliers') {
      setFormData({
        name: item.name,
        description: item.description || '',
        account: item.account,
        contactPerson: item.contactPerson || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
      });
    } else if (activeTab === 'categories') {
      setFormData({
        name: item.name,
        description: item.description || '',
        mainCategoryId: item.mainCategoryId,
      });
    } else if (activeTab === 'subcategories') {
      setFormData({
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
      });
    }
    setIsAddModalOpen(true);
  };

  // Update item
  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      switch (activeTab) {
        case 'suppliers':
          const supplierUpdateData: Partial<ICreateSupplier> = {
            name: formData.name,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          };
          const supplierUpdateResponse = await SUPPLIER_API.UPDATE_SUPPLIER(editingItem.account, supplierUpdateData);
          if (supplierUpdateResponse.error === false) {
            setSuppliers(prev => prev.map(s => s.account === editingItem.account ? supplierUpdateResponse.data! : s));
            toast.success('Supplier updated successfully');
          }
          break;
        
        case 'categories':
          const categoryUpdateData: Partial<ICreateCategory> = {
            name: formData.name,
            mainCategoryId: formData.mainCategoryId,
            description: formData.description,
          };
          const categoryUpdateResponse = await CATEGORY_API.UPDATE_CATEGORY(editingItem.id, categoryUpdateData);
          if (categoryUpdateResponse.error === false) {
            setCategories(prev => prev.map(c => c.id === editingItem.id ? categoryUpdateResponse.data! : c));
            toast.success('Category updated successfully');
          }
          break;
        
        case 'subcategories':
          const subCategoryUpdateData: Partial<ICreateSubCategory> = {
            name: formData.name,
            description: formData.description,
            categoryId: formData.categoryId,
          };
          const subCategoryUpdateResponse = await SUB_CATEGORY_API.UPDATE_SUB_CATEGORY(editingItem.id, subCategoryUpdateData);
          if (subCategoryUpdateResponse.error === false) {
            setSubCategories(prev => prev.map(sc => sc.id === editingItem.id ? subCategoryUpdateResponse.data! : sc));
            toast.success('Sub-category updated successfully');
          }
          break;
      }
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Delete item
  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleteLoading(true);
    try {
      switch (activeTab) {
        case 'suppliers':
          const supplierDeleteResponse = await SUPPLIER_API.DELETE_SUPPLIER(itemToDelete.account);
          if (supplierDeleteResponse.error === false) {
            setSuppliers(prev => prev.filter(s => s.account !== itemToDelete.account));
            toast.success('Supplier deleted successfully');
          } else {
            toast.error(supplierDeleteResponse.message || 'Failed to delete supplier');
          }
          break;
        case 'categories':
          const categoryDeleteResponse = await CATEGORY_API.DELETE_CATEGORY(itemToDelete.id);
          if (categoryDeleteResponse.error === false) {
            setCategories(prev => prev.filter(c => c.id !== itemToDelete.id));
            toast.success('Category deleted successfully');
          } else {
            toast.error(categoryDeleteResponse.message || 'Failed to delete category');
          }
          break;
        case 'subcategories':
          const subCategoryDeleteResponse = await SUB_CATEGORY_API.DELETE_SUB_CATEGORY(itemToDelete.id);
          if (subCategoryDeleteResponse.error === false) {
            setSubCategories(prev => prev.filter(sc => sc.id !== itemToDelete.id));
            toast.success('Sub-category deleted successfully');
          } else {
            toast.error(subCategoryDeleteResponse.message || 'Failed to delete sub-category');
          }
          break;
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      account: '', 
      contactPerson: '', 
      email: '', 
      phone: '', 
      address: '',
      mainCategoryId: '',
      categoryId: undefined
    });
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.name} (${category.code})` : `ID: ${categoryId}`;
  };

  // Get main category name by ID
  const getMainCategoryName = (mainCategoryId: string) => {
    const mainCategory = mainCategories.find(mc => mc.id === mainCategoryId);
    return mainCategory?.name || mainCategoryId;
  };

  // View hierarchy
  const viewHierarchy = () => {
    toast.info('Category Hierarchy', {
      description: 'Showing complete category structure',
      action: {
        label: 'View',
        onClick: () => {
          // You can implement a modal to show hierarchy
          console.log('Show hierarchy modal');
        }
      }
    });
  };

  // Stats for dashboard
  const stats = [
    {
      title: 'Total Suppliers',
      value: suppliers.length,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Categories',
      value: categories.length,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Sub-Categories',
      value: subCategories.length,
      icon: FolderTree,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Main Categories',
      value: mainCategories.length,
      icon: Layers,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage suppliers, categories, and sub-categories in your system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadData}
                size="sm"
                className="gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings size={16} />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={viewHierarchy}>
                    <FolderTree className="mr-2 h-4 w-4" />
                    View Hierarchy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
                    {viewMode === 'table' ? (
                      <>
                        <Grid3x3 className="mr-2 h-4 w-4" />
                        Grid View
                      </>
                    ) : (
                      <>
                        <ListTree className="mr-2 h-4 w-4" />
                        Table View
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Management Console</CardTitle>
                <CardDescription>
                  Add, edit, or delete items from the system
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                {activeTab === 'categories' && (
                  <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
                    <SelectTrigger className="w-[180px]">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {mainCategories.map(mc => (
                        <SelectItem key={mc.id} value={mc.id}>
                          {mc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {activeTab === 'subcategories' && (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Add Button */}
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus size={18} className="mr-2" />
                  Add {activeTab === 'subcategories' ? 'Sub-Category' : activeTab.slice(0, -1)}
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                  <TabsTrigger value="suppliers" className="gap-2">
                    <Building size={16} />
                    Suppliers
                    <Badge variant="secondary" className="ml-2">
                      {suppliers.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="gap-2">
                    <Package size={16} />
                    Categories
                    <Badge variant="secondary" className="ml-2">
                      {categories.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="subcategories" className="gap-2">
                    <FolderTree size={16} />
                    Sub-Categories
                    <Badge variant="secondary" className="ml-2">
                      {subCategories.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                {/* Data Table */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading {activeTab}...</p>
                      </div>
                    </div>
                  ) : getCurrentData().length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || selectedMainCategory !== 'all' || selectedCategory !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : `Get started by adding your first ${activeTab.slice(0, -1)}`}
                      </p>
                      {(!searchTerm && selectedMainCategory === 'all' && selectedCategory === 'all') && (
                        <Button onClick={() => setIsAddModalOpen(true)}>
                          <Plus size={16} className="mr-2" />
                          Add {activeTab === 'subcategories' ? 'Sub-Category' : activeTab.slice(0, -1)}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>
                              {activeTab === 'suppliers' ? 'Account' : 'Code'}
                            </TableHead>
                            {activeTab === 'suppliers' && (
                              <>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                              </>
                            )}
                            {activeTab === 'categories' && (
                              <TableHead>Main Category</TableHead>
                            )}
                            {activeTab === 'subcategories' && (
                              <TableHead>Parent Category</TableHead>
                            )}
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentData().map((item, index) => (
                            <TableRow key={item.id || item.account} className="hover:bg-gray-50/50">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  {activeTab === 'suppliers' && (
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                      <Building className="h-4 w-4 text-blue-600" />
                                    </div>
                                  )}
                                  {activeTab === 'categories' && (
                                    <div className="p-2 bg-green-50 rounded-lg">
                                      <Package className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                  {activeTab === 'subcategories' && (
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                      <FolderTree className="h-4 w-4 text-purple-600" />
                                    </div>
                                  )}
                                  <span>{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {activeTab === 'suppliers' ? item.account : item.code}
                                </Badge>
                              </TableCell>
                              {activeTab === 'suppliers' && (
                                <>
                                  <TableCell>{item.contactPerson || '-'}</TableCell>
                                  <TableCell>{item.email || '-'}</TableCell>
                                </>
                              )}
                              {activeTab === 'categories' && (
                                <TableCell>
                                  <Badge variant="secondary">
                                    {getMainCategoryName(item.mainCategoryId)}
                                  </Badge>
                                </TableCell>
                              )}
                              {activeTab === 'subcategories' && (
                                <TableCell>
                                  <Badge variant="secondary">
                                    {getCategoryName(item.categoryId)}
                                  </Badge>
                                </TableCell>
                              )}
                              <TableCell>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEdit(item)}
                                          className="h-8 w-8"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => openDeleteDialog(item)}
                                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'subcategories' ? 'Sub-Category' : activeTab.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Update the details below' 
                : `Fill in the details to add a new ${activeTab.slice(0, -1)} to the system`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder={`Enter ${activeTab === 'subcategories' ? 'sub-category' : activeTab.slice(0, -1)} name`}
                className="h-11"
              />
            </div>

            {/* Supplier Fields */}
            {activeTab === 'suppliers' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="account" className="text-sm font-medium">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="account"
                      value={formData.account}
                      onChange={(e) => handleFormChange('account', e.target.value)}
                      placeholder="Enter account number"
                      className="h-11"
                      disabled={!!editingItem}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="contactPerson" className="text-sm font-medium">
                      Contact Person
                    </label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                      placeholder="Enter contact person name"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address
                    </label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Enter address"
                      className="h-11"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Category Fields */}
            {activeTab === 'categories' && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="mainCategoryId" className="text-sm font-medium">
                    Main Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.mainCategoryId} 
                    onValueChange={(value) => handleFormChange('mainCategoryId', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map(mc => (
                        <SelectItem key={mc.id} value={mc.id}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {mc.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.mainCategoryId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {getMainCategoryName(formData.mainCategoryId)}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Enter category description (optional)"
                    className="h-11"
                  />
                </div>
              </>
            )}

            {/* Subcategory Fields */}
            {activeTab === 'subcategories' && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.categoryId?.toString()} 
                    onValueChange={(value) => handleFormChange('categoryId', parseInt(value))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {cat.name} ({cat.code})
                            <Badge variant="outline" className="ml-auto text-xs">
                              {getMainCategoryName(cat.mainCategoryId)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.categoryId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {getCategoryName(formData.categoryId)}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Enter sub-category description (optional)"
                    className="h-11"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={resetForm} 
              disabled={actionLoading}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={editingItem ? handleUpdate : handleAdd}
              disabled={actionLoading || !formData.name.trim() || 
                (activeTab === 'suppliers' && !editingItem && !formData.account?.trim()) ||
                (activeTab === 'categories' && !formData.mainCategoryId) ||
                (activeTab === 'subcategories' && !formData.categoryId)}
              className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingItem ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {editingItem ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Delete {activeTab === 'subcategories' ? 'Sub-Category' : activeTab.slice(0, -1)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete "{itemToDelete?.name}"? 
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone and will permanently remove this item from the system.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;