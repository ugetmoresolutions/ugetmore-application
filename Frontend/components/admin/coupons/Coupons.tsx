"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Copy,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  School,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  Tag,
  Clock,
  User,
  Mail,
  Package,
  ShoppingCart,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Loader,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COUPON_API } from "@/endpoints/rest-api/coupon";
import { SCHOOL_API } from "@/endpoints/rest-api/school";
import { AUTH_API } from "@/endpoints/rest-api/auth";
import {
  ProductFilters,
  SUPPLIER_PRODUCTS_API,
} from "@/endpoints/rest-api/supplierProduct";
import {
  ICoupon,
  ICreateCoupon,
  IUpdateCoupon,
  IProduct,
} from "@/interfaces/coupon/coupon";
import { ISchool } from "@/interfaces/school/school";
import { IUser } from "@/interfaces/user/user";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  totalUsage: number;
  schoolCoupons: number;
  generalCoupons: number;
  userCoupons: number;
  productCoupons: number;
  categoryCoupons: number;
  expiredCoupons: number;
  upcomingCoupons: number;
}

interface FilterState {
  searchTerm: string;
  status: "all" | "active" | "inactive";
  couponType: "all" | "school" | "general" | "user" | "product" | "category";
  school: number | "all";
  user: number | "all";
  validity: "all" | "active" | "expired" | "upcoming";
}

interface ProductState {
  selectedProducts: IProduct[];
  availableProducts: IProduct[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

// Category options constant
const CATEGORY_OPTIONS = [
  { value: "Electronics", label: "Electronics" },
  { value: "Stationery", label: "Stationery" },
  { value: "Janitorial", label: "Janitorial" },
];

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<ICoupon[]>([]);
  const [stats, setStats] = useState<CouponStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    inactiveCoupons: 0,
    totalUsage: 0,
    schoolCoupons: 0,
    generalCoupons: 0,
    userCoupons: 0,
    productCoupons: 0,
    categoryCoupons: 0,
    expiredCoupons: 0,
    upcomingCoupons: 0,
  });

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    status: "all",
    couponType: "all",
    school: "all",
    user: "all",
    validity: "all",
  });

  const [productState, setProductState] = useState<ProductState>({
    selectedProducts: [],
    availableProducts: [],
    loading: false,
    page: 1,
    hasMore: true,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [productSearch, setProductSearch] = useState("");

  // Form state
  const [formData, setFormData] = useState<ICreateCoupon>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumCartAmount: 0,
    maximumDiscount: null,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    usageLimit: null,
    couponType: "general",
    applicableSchoolId: null,
    applicableUserId: null,
    applicableProductIds: null,
    applicableCategories: null,
    isSingleUse: false,
    isActive: true,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate stats when coupons change
  useEffect(() => {
    calculateStats(coupons);
  }, [coupons]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [couponsResponse, schoolsResponse, usersResponse] =
        await Promise.all([
          COUPON_API.GET_ALL_COUPONS(),
          SCHOOL_API.GET_ACTIVE_SCHOOLS(),
          AUTH_API.GET_ALL_USERS(),
        ]);

      if (couponsResponse.data) {
        setCoupons(couponsResponse.data);
      }

      if (schoolsResponse.data) {
        setSchools(schoolsResponse.data);
      }

      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const [couponsResponse, schoolsResponse, usersResponse] =
        await Promise.all([
          COUPON_API.GET_ALL_COUPONS(),
          SCHOOL_API.GET_ACTIVE_SCHOOLS(),
          AUTH_API.GET_ALL_USERS(),
        ]);

      if (couponsResponse.data) {
        setCoupons(couponsResponse.data);
      }

      if (schoolsResponse.data) {
        setSchools(schoolsResponse.data);
      }

      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }

      toast.success("Data refreshed successfully");
    } catch (error: any) {
      toast.error("Failed to refresh data");
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (couponData: ICoupon[]) => {
    const now = new Date();
    const stats: CouponStats = {
      totalCoupons: couponData.length,
      activeCoupons: couponData.filter(
        (c) =>
          c.isActive &&
          new Date(c.validFrom) <= now &&
          new Date(c.validTo) >= now
      ).length,
      inactiveCoupons: couponData.filter((c) => !c.isActive).length,
      totalUsage: couponData.reduce((sum, c) => sum + c.usedCount, 0),
      schoolCoupons: couponData.filter((c) => c.couponType === "school").length,
      generalCoupons: couponData.filter((c) => c.couponType === "general")
        .length,
      userCoupons: couponData.filter((c) => c.couponType === "user").length,
      productCoupons: couponData.filter((c) => c.couponType === "product")
        .length,
      categoryCoupons: couponData.filter((c) => c.couponType === "category")
        .length,
      expiredCoupons: couponData.filter((c) => new Date(c.validTo) < now)
        .length,
      upcomingCoupons: couponData.filter((c) => new Date(c.validFrom) > now)
        .length,
    };
    setStats(stats);
  };

  // Get products from endpoint with search and filters
  const getProducts = async (page: number = 1, searchQuery: string = "") => {
    try {
      setProductState((prev) => ({ ...prev, loading: true }));

      // Use the new endpoint with filters for search
      const filters: ProductFilters = {
        page,
        limit: 50,
        ...(searchQuery && { search: searchQuery }), // Only add search if there's a query
      };

      const response =
        await SUPPLIER_PRODUCTS_API.GET_ALL_PRODUCTS_WITH_FILTERS(filters);

      if (response.data && response.data.products) {
        const products: any[] = response.data.products.map((product: any) => ({
          id: product.fullCode,
          simpleCode: product.simpleCode,
          fullCode: product.fullCode,
          productName: product.productName,
          description: product.description || "",
          price: product.price,
          supplier: product.supplier,
          categories: product.categories || [],
          brand: product.brand,
          images: product.images || [],
          isAvailable: product.isAvailable !== false,
        }));

        setProductState((prev) => ({
          ...prev,
          availableProducts:
            page === 1 ? products : [...prev.availableProducts, ...products],
          loading: false,
          hasMore: response.data?.pagination?.hasNext || false,
          page,
        }));
      }
    } catch (error: any) {
      console.error("Error getting products:", error);
      toast.error("Failed to load products");
      setProductState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle product search on Enter key
  const handleProductSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Reset to first page and search
      getProducts(1, productSearch);
    }
  };

  // Clear search and reset products
  const handleClearSearch = () => {
    setProductSearch("");
    getProducts(1); // Reset to first page without search
  };

  // Get product by full code for edit
  const getProductByFullCode = async (
    fullCode: string
  ): Promise<any | null> => {
    try {
      const response = await SUPPLIER_PRODUCTS_API.GET_PRODUCT_BY_FULL_CODE(
        fullCode
      );

      if (response.data) {
        const product = response.data;
        return {
          id: product.fullCode,
          simpleCode: product.simpleCode,
          fullCode: product.fullCode,
          productName: product.productName,
          description: product.description || "",
          price: product.price,
          categories: product.categories || [],
          brand: product.brand,
          images: product.images || [],
        };
      }
      return null;
    } catch (error: any) {
      console.error(`Error getting product ${fullCode}:`, error);
      return null;
    }
  };

  // Add product to selection
  const addProduct = (product: IProduct) => {
    if (
      !productState.selectedProducts.find(
        (p) => p.fullCode === product.fullCode
      )
    ) {
      setProductState((prev) => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, product],
      }));
    }
  };

  // Remove product from selection
  const removeProduct = (productFullCode: string) => {
    setProductState((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(
        (p) => p.fullCode !== productFullCode
      ),
    }));
  };

  // Clear product selection
  const clearProductSelection = () => {
    setProductState((prev) => ({
      ...prev,
      selectedProducts: [],
    }));
  };

  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear category selection
  const clearCategorySelection = () => {
    setSelectedCategories([]);
  };

  // Load products when product coupon type is selected
  useEffect(() => {
    if (
      (showCreateModal || showEditModal) &&
      formData.couponType === "product"
    ) {
      getProducts(1, productSearch);
    }
  }, [showCreateModal, showEditModal, formData.couponType]);

  // Filter coupons
  useEffect(() => {
    let filtered = coupons;
    const now = new Date();

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.code
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          coupon.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((coupon) =>
        filters.status === "active" ? coupon.isActive : !coupon.isActive
      );
    }

    // School filter
    if (filters.school !== "all") {
      filtered = filtered.filter(
        (coupon) => coupon.applicableSchoolId === filters.school
      );
    }

    // User filter
    if (filters.user !== "all") {
      filtered = filtered.filter(
        (coupon) => coupon.applicableUserId === filters.user
      );
    }

    // Coupon type filter
    if (filters.couponType !== "all") {
      filtered = filtered.filter(
        (coupon) => coupon.couponType === filters.couponType
      );
    }

    // Validity filter
    if (filters.validity !== "all") {
      filtered = filtered.filter((coupon) => {
        const validFrom = new Date(coupon.validFrom);
        const validTo = new Date(coupon.validTo);

        switch (filters.validity) {
          case "active":
            return validFrom <= now && validTo >= now;
          case "expired":
            return validTo < now;
          case "upcoming":
            return validFrom > now;
          default:
            return true;
        }
      });
    }

    // Tab filter
    if (activeTab !== "all") {
      switch (activeTab) {
        case "active":
          filtered = filtered.filter(
            (c) =>
              c.isActive &&
              new Date(c.validTo) >= now &&
              new Date(c.validFrom) <= now
          );
          break;
        case "expired":
          filtered = filtered.filter((c) => new Date(c.validTo) < now);
          break;
        case "upcoming":
          filtered = filtered.filter((c) => new Date(c.validFrom) > now);
          break;
        case "school":
          filtered = filtered.filter((c) => c.couponType === "school");
          break;
        case "general":
          filtered = filtered.filter((c) => c.couponType === "general");
          break;
        case "user":
          filtered = filtered.filter((c) => c.couponType === "user");
          break;
        case "product":
          filtered = filtered.filter((c) => c.couponType === "product");
          break;
        case "category":
          filtered = filtered.filter((c) => c.couponType === "category");
          break;
      }
    }

    setFilteredCoupons(filtered);
  }, [coupons, filters, activeTab]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: keyof ICreateCoupon, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]:
        value === ""
          ? null
          : name === "applicableSchoolId"
          ? value
            ? Number(value)
            : null
          : name === "applicableUserId"
          ? value
            ? Number(value)
            : null
          : name === "discountValue"
          ? Number(value)
          : name === "minimumCartAmount"
          ? Number(value)
          : name === "maximumDiscount"
          ? value
            ? Number(value)
            : null
          : name === "usageLimit"
          ? value
            ? Number(value)
            : null
          : value,
    }));

    // Clear selections when coupon type changes
    if (name === "couponType") {
      if (value !== "product") {
        clearProductSelection();
      }
      if (value !== "category") {
        clearCategorySelection();
      }
    }
  };

  // Create new coupon
  const handleCreateCoupon = async () => {
    try {
      setActionLoading(true);

      if (!formData.code.trim()) {
        toast.error("Coupon code is required");
        return;
      }

      if (formData.discountValue <= 0) {
        toast.error("Discount value must be greater than 0");
        return;
      }

      if (
        formData.discountType === "percentage" &&
        formData.discountValue > 100
      ) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }

      if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
        toast.error("Valid from date must be before valid to date");
        return;
      }

      if (formData.couponType === "school" && !formData.applicableSchoolId) {
        toast.error("School is required for school-specific coupons");
        return;
      }

      if (formData.couponType === "user" && !formData.applicableUserId) {
        toast.error("User is required for user-specific coupons");
        return;
      }

      if (
        formData.couponType === "product" &&
        productState.selectedProducts.length === 0
      ) {
        toast.error(
          "At least one product is required for product-specific coupons"
        );
        return;
      }

      if (
        formData.couponType === "category" &&
        selectedCategories.length === 0
      ) {
        toast.error(
          "At least one category is required for category-specific coupons"
        );
        return;
      }

      // Convert dates to proper format and handle product IDs as strings
      const couponData: ICreateCoupon = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        applicableSchoolId:
          formData.couponType === "school" ? formData.applicableSchoolId : null,
        applicableUserId:
          formData.couponType === "user" ? formData.applicableUserId : null,
        applicableProductIds:
          formData.couponType === "product"
            ? productState.selectedProducts.map((p) => p.fullCode)
            : null,
        applicableCategories:
          formData.couponType === "category" ? selectedCategories : null,
      };

      const response = await COUPON_API.CREATE_COUPON(couponData);

      if (response.data) {
        setCoupons((prev) => [response.data, ...prev]);
        setShowCreateModal(false);
        resetForm();
        clearProductSelection();
        clearCategorySelection();
        toast.success("Coupon created successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit coupon
  const handleEditCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setActionLoading(true);

      const updateData: IUpdateCoupon = {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minimumCartAmount: formData.minimumCartAmount,
        maximumDiscount: formData.maximumDiscount,
        validFrom: new Date(formData.validFrom).toISOString(),
        validTo: new Date(formData.validTo).toISOString(),
        usageLimit: formData.usageLimit,
        couponType: formData.couponType,
        applicableSchoolId:
          formData.couponType === "school" ? formData.applicableSchoolId : null,
        applicableUserId:
          formData.couponType === "user" ? formData.applicableUserId : null,
        applicableProductIds:
          formData.couponType === "product"
            ? productState.selectedProducts.map((p) => p.fullCode)
            : null,
        applicableCategories:
          formData.couponType === "category" ? selectedCategories : null,
        isSingleUse: formData.isSingleUse,
        isActive: formData.isActive,
      };

      const response = await COUPON_API.UPDATE_COUPON(
        selectedCoupon.id,
        updateData
      );

      if (response.data) {
        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon.id === selectedCoupon.id ? response.data : coupon
          )
        );
        setShowEditModal(false);
        setSelectedCoupon(null);
        resetForm();
        clearProductSelection();
        clearCategorySelection();
        toast.success("Coupon updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setActionLoading(true);
      await COUPON_API.DELETE_COUPON(selectedCoupon.id);

      setCoupons((prev) =>
        prev.filter((coupon) => coupon.id !== selectedCoupon.id)
      );
      setShowDeleteModal(false);
      setSelectedCoupon(null);
      toast.success("Coupon deleted successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    } finally {
      setActionLoading(false);
    }
  };

  // Copy coupon code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minimumCartAmount: 0,
      maximumDiscount: null,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      usageLimit: null,
      couponType: "general",
      applicableSchoolId: null,
      applicableUserId: null,
      applicableProductIds: null,
      applicableCategories: null,
      isSingleUse: false,
      isActive: true,
    });
    clearProductSelection();
    clearCategorySelection();
  };

  // Open edit modal
  const openEditModal = async (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumCartAmount: coupon.minimumCartAmount,
      maximumDiscount: coupon.maximumDiscount,
      validFrom: coupon.validFrom.split("T")[0],
      validTo: coupon.validTo.split("T")[0],
      usageLimit: coupon.usageLimit,
      couponType: coupon.couponType,
      applicableSchoolId: coupon.applicableSchoolId,
      applicableUserId: coupon.applicableUserId,
      applicableProductIds: coupon.applicableProductIds,
      applicableCategories: coupon.applicableCategories,
      isSingleUse: coupon.isSingleUse,
      isActive: coupon.isActive,
    });

    // Set selected categories for category coupons
    if (coupon.couponType === "category" && coupon.applicableCategories) {
      setSelectedCategories(coupon.applicableCategories);
    }

    // If it's a product coupon, load the selected products by fullCode
    if (coupon.couponType === "product" && coupon.applicableProductIds) {
      const productPromises = coupon.applicableProductIds.map(
        async (fullCode) => {
          return await getProductByFullCode(fullCode);
        }
      );

      const products = (await Promise.all(productPromises)).filter(
        Boolean
      ) as IProduct[];

      setProductState((prev) => ({
        ...prev,
        selectedProducts: products,
      }));
    }

    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get school name by ID
  const getSchoolName = (schoolId: number | null) => {
    if (schoolId === null) return "All Schools";
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : "Unknown School";
  };

  // Get user name by ID
  const getUserName = (userId: number | null) => {
    if (userId === null) return "All Users";
    const user = users.find((u) => u.id === userId);
    return user ? user.fullName : "Unknown User";
  };

  // Get user email by ID
  const getUserEmail = (userId: number | null) => {
    if (userId === null) return "";
    const user = users.find((u) => u.id === userId);
    return user ? user.email : "";
  };

  // Get user initials for avatar
  const getUserInitials = (userId: number | null) => {
    if (userId === null) return "AU";
    const user = users.find((u) => u.id === userId);
    if (!user || !user.fullName) return "UU";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get product name by ID (for display in table)
  const getProductNames = (productIds: string[] | null) => {
    if (!productIds || productIds.length === 0) return "No products";
    if (productIds.length === 1) return `1 product`;
    return `${productIds.length} products`;
  };

  // Get category names for display
  const getCategoryNames = (categories: string[] | null) => {
    if (!categories || categories.length === 0) return "No categories";
    if (categories.length === 1) return `1 category`;
    return `${categories.length} categories`;
  };

  // Check if coupon is active
  const isCouponActive = (coupon: ICoupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);
    return coupon.isActive && validFrom <= now && validTo >= now;
  };

  // Check if coupon is expired
  const isCouponExpired = (coupon: ICoupon) => {
    return new Date(coupon.validTo) < new Date();
  };

  // Check if coupon is upcoming
  const isCouponUpcoming = (coupon: ICoupon) => {
    return new Date(coupon.validFrom) > new Date();
  };

  // Get coupon status for badge display
  const getCouponStatus = (
    coupon: ICoupon
  ): {
    status: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  } => {
    if (!coupon.isActive) {
      return { status: "Inactive", variant: "secondary" };
    }

    if (isCouponExpired(coupon)) {
      return { status: "Expired", variant: "destructive" };
    }

    if (isCouponUpcoming(coupon)) {
      return { status: "Upcoming", variant: "outline" };
    }

    if (isCouponActive(coupon)) {
      return { status: "Active", variant: "default" };
    }

    return { status: "Inactive", variant: "secondary" };
  };

  // Get coupon type badge color
  const getCouponTypeBadge = (couponType: string) => {
    switch (couponType) {
      case "school":
        return { label: "School", variant: "default" as const };
      case "user":
        return { label: "User", variant: "secondary" as const };
      case "general":
        return { label: "General", variant: "outline" as const };
      case "product":
        return { label: "Product", variant: "destructive" as const };
      case "category":
        return { label: "Category", variant: "default" as const };
      default:
        return { label: couponType, variant: "outline" as const };
    }
  };

  // Export coupons
  const exportCoupons = () => {
    const csvContent = [
      [
        "Code",
        "Description",
        "Discount Type",
        "Discount Value",
        "Minimum Amount",
        "Maximum Discount",
        "Usage",
        "Status",
        "Type",
        "Applicable To",
        "Valid From",
        "Valid To",
        "Single Use",
      ],
      ...filteredCoupons.map((coupon) => {
        const statusInfo = getCouponStatus(coupon);
        const applicableTo =
          coupon.couponType === "school"
            ? getSchoolName(coupon.applicableSchoolId)
            : coupon.couponType === "user"
            ? getUserName(coupon.applicableUserId)
            : coupon.couponType === "product"
            ? getProductNames(coupon.applicableProductIds)
            : coupon.couponType === "category"
            ? getCategoryNames(coupon.applicableCategories)
            : "All Customers";

        return [
          coupon.code,
          coupon.description,
          coupon.discountType,
          coupon.discountValue,
          coupon.minimumCartAmount,
          coupon.maximumDiscount || "No limit",
          `${coupon.usedCount}${
            coupon.usageLimit ? `/${coupon.usageLimit}` : ""
          }`,
          statusInfo.status,
          coupon.couponType.charAt(0).toUpperCase() +
            coupon.couponType.slice(1),
          applicableTo,
          formatDate(coupon.validFrom),
          formatDate(coupon.validTo),
          coupon.isSingleUse ? "Yes" : "No",
        ];
      }),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupons-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Coupons exported successfully");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      couponType: "all",
      school: "all",
      user: "all",
      validity: "all",
    });
    setActiveTab("all");
  };

  // Product Selection Component with Search
  const ProductSelectionSection = () => {
    const [localSearch, setLocalSearch] = useState(productSearch);

    const handleLocalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setProductSearch(localSearch);
        getProducts(1, localSearch);
      }
    };

    const handleClearLocalSearch = () => {
      setLocalSearch("");
      setProductSearch("");
      getProducts(1);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Select Products</Label>
          <span className="text-sm text-muted-foreground">
            {productState.selectedProducts.length} product(s) selected
          </span>
        </div>

        {/* Selected Products */}
        {productState.selectedProducts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Selected Products:</Label>
            <ScrollArea className="h-32 border rounded-lg">
              <div className="p-2 space-y-2">
                {productState.selectedProducts.map((product) => (
                  <div
                    key={product.fullCode}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {product.images?.[0]?.urls?.[0]?.url ? (
                        <img
                          src={product.images[0].urls[0].url}
                          alt={product.productName}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {product.productName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Code: {product.fullCode} • R{product.price}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.fullCode)}
                      className="ml-2 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Available Products with Search */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available Products</Label>
            {productSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocalSearch}
                className="h-8 text-xs"
              >
                Clear Search
              </Button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products... Press Enter to search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleLocalSearch}
              className="pl-9"
            />
            {localSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocalSearch}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {productSearch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-3 w-3" />
              Showing results for: "{productSearch}"
            </div>
          )}

          {productState.loading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                {productSearch
                  ? "Searching products..."
                  : "Loading products..."}
              </span>
            </div>
          )}

          {productState.availableProducts.length > 0 && (
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-2 space-y-2">
                {productState.availableProducts.map((product) => (
                  <div
                    key={product.fullCode}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    {product.images?.[0]?.urls?.[0]?.url ? (
                      <img
                        src={product.images[0].urls[0].url}
                        alt={product.productName}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {product.productName}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="font-mono">
                          Code: {product.fullCode}
                        </span>
                        <span>Price: R{product.price}</span>
                      </div>
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.categories
                            .slice(0, 2)
                            .map((category, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {category.name}
                              </Badge>
                            ))}
                          {product.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.categories.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {productState.hasMore && (
            <Button
              variant="outline"
              onClick={() => getProducts(productState.page + 1, productSearch)}
              disabled={productState.loading}
              className="w-full"
            >
              {productState.loading ? "Loading..." : "Load More Products"}
            </Button>
          )}

          {!productState.loading &&
            productState.availableProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2" />
                <div>
                  {productSearch
                    ? `No products found for "${productSearch}"`
                    : "No products available"}
                </div>
                {productSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLocalSearch}
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>
    );
  };

  // Category Selection Component
  const CategorySelectionSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select Categories</Label>
        <span className="text-sm text-muted-foreground">
          {selectedCategories.length} categor(ies) selected
        </span>
      </div>

      <div className="space-y-3">
        {CATEGORY_OPTIONS.map((category) => (
          <div key={category.value} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.value}`}
              checked={selectedCategories.includes(category.value)}
              onCheckedChange={() => handleCategoryToggle(category.value)}
            />
            <Label
              htmlFor={`category-${category.value}`}
              className="text-sm font-normal cursor-pointer flex items-center gap-2"
            >
              <FolderTree className="w-4 h-4 text-green-600" />
              {category.label}
            </Label>
          </div>
        ))}
      </div>

      {selectedCategories.length > 0 && (
        <div className="p-3 border rounded-lg bg-muted/20">
          <Label className="text-sm mb-2 block">Selected Categories:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => {
              const categoryInfo = CATEGORY_OPTIONS.find(
                (c) => c.value === category
              );
              return (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <FolderTree className="w-3 h-3" />
                  {categoryInfo?.label || category}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryToggle(category)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coupons Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage discount coupons for schools, users, products,
            categories, and general customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCoupons}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5  gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoupons}</div>
            <p className="text-xs text-muted-foreground">Coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeCoupons}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactiveCoupons}
            </div>
            <p className="text-xs text-muted-foreground">Disabled coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalUsage}
            </div>
            <p className="text-xs text-muted-foreground">Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School</CardTitle>
            <School className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.schoolCoupons}
            </div>
            <p className="text-xs text-muted-foreground">School-specific</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">General</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.generalCoupons}
            </div>
            <p className="text-xs text-muted-foreground">All customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <User className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {stats.userCoupons}
            </div>
            <p className="text-xs text-muted-foreground">User-specific</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product</CardTitle>
            <Package className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.productCoupons}
            </div>
            <p className="text-xs text-muted-foreground">Product-specific</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <FolderTree className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.categoryCoupons}
            </div>
            <p className="text-xs text-muted-foreground">Category-specific</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.expiredCoupons}
            </div>
            <p className="text-xs text-muted-foreground">Past validity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>
                Filter coupons by various criteria
              </CardDescription>
            </div>
            <Button variant="outline" onClick={clearAllFilters} size="sm">
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="pl-9"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value: "all" | "active" | "inactive") =>
                handleFilterChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.couponType}
              onValueChange={(
                value:
                  | "all"
                  | "school"
                  | "general"
                  | "user"
                  | "product"
                  | "category"
              ) => handleFilterChange("couponType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Coupon Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">School Only</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="user">User Specific</SelectItem>
                <SelectItem value="product">Product Specific</SelectItem>
                <SelectItem value="category">Category Specific</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.school === "all" ? "all" : filters.school.toString()
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "school",
                  value === "all" ? "all" : Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.user === "all" ? "all" : filters.user.toString()}
              onValueChange={(value) =>
                handleFilterChange(
                  "user",
                  value === "all" ? "all" : Number(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user?.id.toString()}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.validity}
              onValueChange={(
                value: "all" | "active" | "expired" | "upcoming"
              ) => handleFilterChange("validity", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Validity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Currently Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{filteredCoupons.length} coupon(s) found</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(filteredCoupons.length, 50)} of{" "}
          {filteredCoupons.length}
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applicable To</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.slice(0, 50).map((coupon) => {
                  const statusInfo = getCouponStatus(coupon);
                  const typeInfo = getCouponTypeBadge(coupon.couponType);

                  return (
                    <TableRow key={coupon.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[200px] truncate"
                          title={coupon.description}
                        >
                          {coupon.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `R${coupon.discountValue}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min: R{coupon.minimumCartAmount}
                          {coupon.maximumDiscount &&
                            ` • Max: R${coupon.maximumDiscount}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {coupon.couponType === "school" && (
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4 text-purple-500" />
                              <div>
                                <div className="font-medium">
                                  {getSchoolName(coupon.applicableSchoolId)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  School
                                </div>
                              </div>
                            </div>
                          )}
                          {coupon.couponType === "user" &&
                            coupon.applicableUserId && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(coupon.applicableUserId)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {getUserName(coupon.applicableUserId)}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {getUserEmail(coupon.applicableUserId)}
                                  </div>
                                </div>
                              </div>
                            )}
                          {coupon.couponType === "product" && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-pink-500" />
                              <div>
                                <div className="font-medium">
                                  {getProductNames(coupon.applicableProductIds)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Product Specific
                                </div>
                              </div>
                            </div>
                          )}
                          {coupon.couponType === "category" && (
                            <div className="flex items-center gap-2">
                              <FolderTree className="h-4 w-4 text-green-500" />
                              <div>
                                <div className="font-medium">
                                  {getCategoryNames(
                                    coupon.applicableCategories
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Category Specific
                                </div>
                              </div>
                            </div>
                          )}
                          {coupon.couponType === "general" && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-orange-500" />
                              <div>
                                <div className="font-medium">All Customers</div>
                                <div className="text-xs text-muted-foreground">
                                  General
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-1">
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.label}
                            </Badge>
                            {coupon.isSingleUse && (
                              <Badge variant="outline">Single Use</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium">
                            {coupon.usedCount}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </div>
                          {coupon.usageLimit && (
                            <Progress
                              value={
                                (coupon.usedCount / coupon.usageLimit) * 100
                              }
                              className="h-2"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDate(coupon.validFrom)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            to {formatDate(coupon.validTo)}
                          </div>
                          {isCouponExpired(coupon) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                          {isCouponUpcoming(coupon) && (
                            <Badge variant="secondary" className="text-xs">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(coupon)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No coupons found</div>
              <div className="text-sm text-muted-foreground">
                {coupons.length === 0
                  ? "No coupons created yet"
                  : "Try adjusting your search or filters"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Coupon Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl min-w-[60%] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create New Coupon
            </DialogTitle>
            <DialogDescription>
              Choose a coupon type and configure the discount settings for your
              customers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Step 1: Coupon Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">1. Choose Coupon Type</h3>
                <Badge variant="outline" className="text-xs">
                  Step 1 of 3
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* General Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "general"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "general")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-1">General Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Available to all customers
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "general"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "general"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* School Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "school"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "school")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <School className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-1">School Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Specific to a school
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "school"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "school"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* User Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "user"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "user")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold mb-1">User Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For specific users only
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "user" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "user" ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "product"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "product")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold mb-1">Product Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For specific products
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "product"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "product"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "category"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "category")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-1">Category Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For product categories
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "category"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "category"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Step 2: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">2. Basic Information</h3>
                <Badge variant="outline" className="text-xs">
                  Step 2 of 3
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="create-code"
                    className="flex items-center gap-2"
                  >
                    Coupon Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="create-code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., BACK2SCHOOL24"
                    className="text-lg font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose of this coupon..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3: Configuration - Fixed to prevent stretching */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">3. Configuration</h3>
                <Badge variant="outline" className="text-xs">
                  Step 3 of 3
                </Badge>
              </div>

              {/* Configuration container that stays within modal */}
              <div className="space-y-4 max-w-3xl max-h-[60vh] overflow-y-auto">
                {/* School Selection */}
                {formData.couponType === "school" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <School className="w-5 h-5 text-purple-600" />
                      <Label className="text-base">Select School</Label>
                    </div>
                    <Select
                      value={formData.applicableSchoolId?.toString() || ""}
                      onValueChange={(value) =>
                        handleSelectChange("applicableSchoolId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a school..." />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem
                            key={school.id}
                            value={school.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              {school.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User Selection */}
                {formData.couponType === "user" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-600" />
                      <Label className="text-base">Select User</Label>
                    </div>
                    <Select
                      value={formData.applicableUserId?.toString() || ""}
                      onValueChange={(value) =>
                        handleSelectChange("applicableUserId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-cyan-100 text-cyan-800">
                                  {user.fullName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "UU"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {user.fullName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Product Selection */}
                {formData.couponType === "product" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-pink-600" />
                      <Label className="text-base">Select Products</Label>
                    </div>
                    <ProductSelectionSection />
                  </div>
                )}

                {/* Category Selection */}
                {formData.couponType === "category" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-green-600" />
                      <Label className="text-base">Select Categories</Label>
                    </div>
                    <CategorySelectionSection />
                  </div>
                )}

                {/* Discount Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="create-discountType">Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        handleSelectChange("discountType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-discountValue">
                      {formData.discountType === "percentage"
                        ? "Discount Value (%)"
                        : "Discount Amount (R)"}
                    </Label>
                    <Input
                      id="create-discountValue"
                      name="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      min="0"
                      max={
                        formData.discountType === "percentage" ? 100 : undefined
                      }
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-minimumCartAmount">
                      Minimum Amount (R)
                    </Label>
                    <Input
                      id="create-minimumCartAmount"
                      name="minimumCartAmount"
                      type="number"
                      value={formData.minimumCartAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* ADD THIS NEW SECTION FOR MAXIMUM DISCOUNT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="create-maximumDiscount">
                      Maximum Discount Amount (R)
                    </Label>
                    <Input
                      id="create-maximumDiscount"
                      name="maximumDiscount"
                      type="number"
                      value={formData.maximumDiscount || ""}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum discount amount (leave empty for no limit)
                    </p>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-medium">Validity Period</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="create-validFrom">Start Date</Label>
                        <Input
                          id="create-validFrom"
                          name="validFrom"
                          type="date"
                          value={formData.validFrom as string}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-validTo">End Date</Label>
                        <Input
                          id="create-validTo"
                          name="validTo"
                          type="date"
                          value={formData.validTo as string}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Usage Settings</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="create-usageLimit">Usage Limit</Label>
                        <Input
                          id="create-usageLimit"
                          name="usageLimit"
                          type="number"
                          value={formData.usageLimit || ""}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Unlimited"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="create-isSingleUse"
                          checked={formData.isSingleUse}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isSingleUse: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor="create-isSingleUse"
                          className="cursor-pointer"
                        >
                          Single use per customer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="create-isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor="create-isActive"
                          className="cursor-pointer"
                        >
                          Activate immediately
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
                clearProductSelection();
                clearCategorySelection();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoupon}
              disabled={actionLoading || !formData.code.trim()}
              className="w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="min-w-[60%] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Edit Coupon
            </DialogTitle>
            <DialogDescription>
              Update the coupon details for {selectedCoupon?.code}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Step 1: Coupon Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">1. Choose Coupon Type</h3>
                <Badge variant="outline" className="text-xs">
                  Step 1 of 3
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* General Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "general"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "general")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-1">General Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Available to all customers
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "general"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "general"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* School Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "school"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "school")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <School className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-1">School Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Specific to a school
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "school"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "school"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* User Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "user"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "user")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold mb-1">User Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For specific users only
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "user" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "user" ? "Selected" : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "product"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "product")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold mb-1">Product Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For specific products
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "product"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "product"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Coupon Card */}
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    formData.couponType === "category"
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => handleSelectChange("couponType", "category")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-1">Category Coupon</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For product categories
                    </p>
                    <div className="flex items-center justify-center">
                      <Badge
                        variant={
                          formData.couponType === "category"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {formData.couponType === "category"
                          ? "Selected"
                          : "Select"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Step 2: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">2. Basic Information</h3>
                <Badge variant="outline" className="text-xs">
                  Step 2 of 3
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-code"
                    className="flex items-center gap-2"
                  >
                    Coupon Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., BACK2SCHOOL24"
                    className="text-lg font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose of this coupon..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3: Configuration - Fixed to prevent stretching */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">3. Configuration</h3>
                <Badge variant="outline" className="text-xs">
                  Step 3 of 3
                </Badge>
              </div>

              {/* Configuration container that stays within modal */}
              <div className="space-y-4 max-w-3xl max-h-[60vh] overflow-y-auto">
                {/* School Selection */}
                {formData.couponType === "school" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <School className="w-5 h-5 text-purple-600" />
                      <Label className="text-base">Select School</Label>
                    </div>
                    <Select
                      value={formData.applicableSchoolId?.toString() || ""}
                      onValueChange={(value) =>
                        handleSelectChange("applicableSchoolId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a school..." />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem
                            key={school.id}
                            value={school.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              {school.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* User Selection */}
                {formData.couponType === "user" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-600" />
                      <Label className="text-base">Select User</Label>
                    </div>
                    <Select
                      value={formData.applicableUserId?.toString() || ""}
                      onValueChange={(value) =>
                        handleSelectChange("applicableUserId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-cyan-100 text-cyan-800">
                                  {user.fullName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "UU"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {user.fullName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Product Selection */}
                {formData.couponType === "product" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-pink-600" />
                      <Label className="text-base">Select Products</Label>
                    </div>
                    <ProductSelectionSection />
                  </div>
                )}

                {/* Category Selection */}
                {formData.couponType === "category" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-green-600" />
                      <Label className="text-base">Select Categories</Label>
                    </div>
                    <CategorySelectionSection />
                  </div>
                )}

                {/* Discount Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountType">Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        handleSelectChange("discountType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-discountValue">
                      {formData.discountType === "percentage"
                        ? "Discount Value (%)"
                        : "Discount Amount (R)"}
                    </Label>
                    <Input
                      id="edit-discountValue"
                      name="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      min="0"
                      max={
                        formData.discountType === "percentage" ? 100 : undefined
                      }
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-minimumCartAmount">
                      Minimum Amount (R)
                    </Label>
                    <Input
                      id="edit-minimumCartAmount"
                      name="minimumCartAmount"
                      type="number"
                      value={formData.minimumCartAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* ADD THIS NEW SECTION FOR MAXIMUM DISCOUNT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="edit-maximumDiscount">
                      Maximum Discount Amount (R)
                    </Label>
                    <Input
                      id="edit-maximumDiscount"
                      name="maximumDiscount"
                      type="number"
                      value={formData.maximumDiscount || ""}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum discount amount (leave empty for no limit)
                    </p>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-medium">Validity Period</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-validFrom">Start Date</Label>
                        <Input
                          id="edit-validFrom"
                          name="validFrom"
                          type="date"
                          value={formData.validFrom as string}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-validTo">End Date</Label>
                        <Input
                          id="edit-validTo"
                          name="validTo"
                          type="date"
                          value={formData.validTo as string}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Usage Settings</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="edit-usageLimit">Usage Limit</Label>
                        <Input
                          id="edit-usageLimit"
                          name="usageLimit"
                          type="number"
                          value={formData.usageLimit || ""}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Unlimited"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-isSingleUse"
                          checked={formData.isSingleUse}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isSingleUse: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor="edit-isSingleUse"
                          className="cursor-pointer"
                        >
                          Single use per customer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor="edit-isActive"
                          className="cursor-pointer"
                        >
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                clearProductSelection();
                clearCategorySelection();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCoupon}
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-red-100 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="font-semibold">{selectedCoupon?.code}</div>
              <div className="text-sm text-muted-foreground">
                {selectedCoupon?.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Used {selectedCoupon?.usedCount} times
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCoupon}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
