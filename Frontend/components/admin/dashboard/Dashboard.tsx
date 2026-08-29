"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Users,
  Package,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
  WalletCards,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { ORDER_API } from "@/endpoints/rest-api/order";

// Type definitions
interface SalesData {
  name: string;
  sales: number;
  orders: number;
}


interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface Order {
  id: number;
  total: number;
  paymentStatus: string;
  status: string;
  items: Array<{
    product: {
      productName: string;
    };
    quantity: number;
  }>;
  user: {
    fullName: string;
    email: string;
  };
  createdAt: string;
}

interface TopProduct {
  product: {
    productName: string;
    simpleCode: string;
  };
  orderCount: number;
  totalQuantity: number;
  priceInfo: {
    totalRevenue: number;
    avgPricePerUnit: number;
  };
  brandingInfo: {
    isBranded: boolean;
  };
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
}

type TimeframeOption = "Week" | "Month" | "Year";

const categoryData: CategoryData[] = [
  { name: "Electronics", value: 45, color: "#0f172a" },
  { name: "Furniture", value: 25, color: "#475569" },
  { name: "Branded Items", value: 18, color: "#64748b" },
  { name: "Stationary", value: 12, color: "#94a3b8" },
];

const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-80 bg-gray-100 rounded-xl"></div>
  </div>
);

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all duration-300 ${
        isHovered ? "shadow-lg scale-105 border-slate-900" : ""
      } cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${iconBg} rounded-xl transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          changeType === "increase" 
            ? "bg-emerald-50 text-emerald-600" 
            : "bg-red-50 text-red-600"
        }`}>
          {changeType === "increase" ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="text-sm font-bold">{change}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
    </div>
  );
};

const TopProductSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse border border-gray-200">
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-40"></div>
    </div>
    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
  </div>
);

const RecentOrdersSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse border border-gray-200"
      >
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    ))}
  </div>
);

const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("Week");
  const [statsData, setStatsData] = useState<StatCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
  const [salesOverviewData, setSalesOverviewData] = useState<SalesData[]>([]);
  const [salesDataLoading, setSalesDataLoading] = useState(true);

  // Fetch sales overview data
  useEffect(() => {
    const fetchSalesOverviewData = async () => {
      try {
        setSalesDataLoading(true);
        const response = await ORDER_API.GET_SALES_ANALYTICS({ 
          timeframe: timeframe 
        });
        
        if (response.data?.timeSeriesData) {
          const chartData = response.data.timeSeriesData.map(item => ({
            name: item.period,
            sales: item.sales,
            orders: item.orders
          }));
          setSalesOverviewData(chartData);
        }
      } catch (error) {
        console.error("Error fetching sales overview data:", error);
        setSalesOverviewData([]);
      } finally {
        setSalesDataLoading(false);
      }
    };

    fetchSalesOverviewData();
  }, [timeframe]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await ORDER_API.GET_DASHBOARD_STATS();

        if (response.data) {
          const { totalSales, totalOrders, totalCustomers, totalRefunds } =
            response.data;

          const formattedStats: StatCardProps[] = [
            {
              title: "Total Revenue",
              value: new Intl.NumberFormat("en-ZA", {
                style: "currency",
                currency: "ZAR",
                minimumFractionDigits: 0,
              }).format(totalSales),
              change: "+0%",
              changeType: "increase",
              icon: WalletCards,
              gradient: "from-emerald-600 to-emerald-800",
              iconBg: "bg-emerald-600",
            },
            {
              title: "Total Orders",
              value: totalOrders.toLocaleString(),
              change: "+0%",
              changeType: "increase",
              icon: ShoppingCart,
              gradient: "from-blue-600 to-blue-800",
              iconBg: "bg-blue-600",
            },
            {
              title: "Total Customers",
              value: totalCustomers.toLocaleString(),
              change: "+0%",
              changeType: "increase",
              icon: Users,
              gradient: "from-purple-600 to-purple-800",
              iconBg: "bg-purple-600",
            },
            {
              title: "Refunds",
              value: new Intl.NumberFormat("en-ZA", {
                style: "currency",
                currency: "ZAR",
                minimumFractionDigits: 0,
              }).format(totalRefunds),
              change: "+0%",
              changeType: "decrease",
              icon: RefreshCw,
              gradient: "from-red-600 to-red-800",
              iconBg: "bg-red-600",
            },
          ];

          setStatsData(formattedStats);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setStatsData([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopProducts = async () => {
      try {
        setTopProductsLoading(true);
        const response = await ORDER_API.GET_BEST_SELLING();

        if (response.data) {
          const top5Products = response.data.slice(0, 5);
          setTopProducts(top5Products);
        }
      } catch (err) {
        console.error("Error fetching top products:", err);
        setTopProducts([]);
      } finally {
        setTopProductsLoading(false);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        setRecentOrdersLoading(true);
        const response = await ORDER_API.GET_ALL_ORDERS();

        if (response.data) {
          const sortedOrders = response.data
            .sort(
              (a: Order, b: Order) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 10);

          setRecentOrders(sortedOrders);
        }
      } catch (err) {
        console.error("Error fetching recent orders:", err);
        setRecentOrders([]);
      } finally {
        setRecentOrdersLoading(false);
      }
    };

    fetchDashboardStats();
    fetchTopProducts();
    fetchRecentOrders();
  }, []);

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 shadow-lg p-4 rounded-xl">
          <p className="font-bold mb-2 text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold text-sm">
              {entry.dataKey === "sales" ? "Sales: R" : "Orders: "}
              {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (status: string): string => {
    const statusStyles: Record<string, string> = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      processing: "bg-purple-50 text-purple-700 border-purple-200",
    };
    const style = statusStyles[status.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
    return `px-3 py-1 rounded-full text-xs font-bold border ${style}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-slate-900 rounded-xl shadow-md">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dashboard
              </h1>
            </div>
          </div>
          <p className="text-gray-600 font-medium ml-16">
            Monitor your store performance and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))
            : statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Sales Overview - Larger Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Sales Overview
                </h2>
                <p className="text-gray-600 text-sm">Revenue & Order Trends</p>
              </div>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-slate-700 transition-all"
                disabled={salesDataLoading}
              >
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </div>

            {salesDataLoading ? (
              <ChartSkeleton />
            ) : salesOverviewData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesOverviewData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0f172a"
                    strokeWidth={3}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#64748b"
                    strokeWidth={2}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base font-medium">No sales data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Sales by Category
              </h2>
              <p className="text-gray-600 text-sm mb-6">Distribution Overview</p>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <span className="text-xs text-gray-600 block">{category.name}</span>
                    <span className="text-sm font-bold text-slate-900">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Recent Orders
                </h2>
                <p className="text-gray-600 text-sm">Latest transactions from your store</p>
              </div>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View All
              </button>
            </div>

            {recentOrdersLoading ? (
              <RecentOrdersSkeleton />
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all cursor-pointer"
                  >
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Order ID</p>
                        <p className="font-bold text-slate-900">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Customer</p>
                        <p className="font-semibold text-slate-900 truncate">
                          {order.user?.fullName || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Product</p>
                        <p className="font-semibold text-slate-900 truncate">
                          {order.items?.[0]?.product?.productName || "Multiple Items"}
                        </p>
                        {order.items && order.items.length > 1 && (
                          <span className="text-xs text-gray-500">
                            +{order.items.length - 1} more
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Amount</p>
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base font-medium">No recent orders</p>
                </div>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Top Products
                </h2>
                <p className="text-gray-600 text-sm">Best selling items</p>
              </div>
              <Star className="w-6 h-6 text-amber-500" />
            </div>

            <div className="space-y-3">
              {topProductsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TopProductSkeleton key={index} />
                ))
              ) : topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    key={`${product.product.simpleCode}-${index}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg font-bold text-white text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-gray-500 shrink-0" />
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {product.product.productName}
                        </h3>
                      </div>
                      <p className="text-lg font-bold text-emerald-600 mb-1">
                        {formatCurrency(product.priceInfo.totalRevenue)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-600 font-medium">
                          {product.totalQuantity} units • {product.orderCount} orders
                        </span>
                        {product.brandingInfo.isBranded && (
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-semibold">
                            Branded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg shrink-0 ${
                      product.orderCount > 50 ? "bg-emerald-100" : "bg-amber-100"
                    }`}>
                      {product.orderCount > 50 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base font-medium">No top products data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;