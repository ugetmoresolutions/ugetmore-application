"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Wallet
} from 'lucide-react';
import { ORDER_API } from '@/endpoints/rest-api/order';
import { IUserAnalytics, IUserProfile } from '@/interfaces/analytics/analytics';

// Types - Using IUserProfile as Customer interface
type Customer = IUserProfile & {
  avatar: string;
  status: 'active' | 'inactive' | 'vip';
};

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  topSpenders: number;
}

// Helper function to generate avatar from name
const generateAvatar = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to determine status based on activity
const getCustomerStatus = (activityStatus: string, totalOrders: number, totalAmountSpent: number): 'active' | 'inactive' | 'vip' => {
  if (activityStatus === 'inactive') return 'inactive';
  if (totalAmountSpent > 2000 || totalOrders > 10) return 'vip';
  return 'active';
};

// Utility Components
const ActionButton: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ 
  onClick, 
  variant = 'primary', 
  children, 
  className = '', 
  disabled = false 
}) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm',
    ghost: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number | React.ReactNode; // ✅ allow ReactNode (e.g., Loader2)
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, change, icon: Icon, prefix = '', suffix = '', trend }) => {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        {trend && change && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          {typeof value === 'number'
            ? `${prefix}${value.toLocaleString()}${suffix}`
            : value} 
        </p>
        <p className="text-sm text-slate-600">{title}</p>
      </div>
    </motion.div>
  );
};


const StatusBadge: React.FC<{ status: Customer['status'] }> = ({ status }) => {
  const configs = {
    active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Active' },
    inactive: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Inactive' },
    vip: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'VIP' }
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-700 font-semibold text-sm">{customer.avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{customer.fullName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={customer.status} />
              <span className="text-xs text-slate-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="w-4 h-4" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone className="w-4 h-4" />
          <span>{customer.phone}</span>
        </div>
        {customer.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      <div className="grid  gap-4 mb-4 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">{customer.totalOrders}</p>
          <p className="text-xs text-slate-500">Orders</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">R {customer.totalAmountSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Total Spent</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">Last Order</p>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Customer['status']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'joinDate'>('name');
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [analytics, setAnalytics] = useState<IUserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await ORDER_API.GET_ADMIN_USER_ANALYTICS();
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await ORDER_API.GET_ADMIN_USERPROFILE_ANALYTICS();
      if (response.data && Array.isArray(response.data)) {
        // Convert IUserProfile[] to Customer[]
        const customersData: Customer[] = response.data.map((profile: IUserProfile) => ({
          ...profile,
          avatar: generateAvatar(profile.fullName),
          status: getCustomerStatus(profile.activityStatus, profile.totalOrders, profile.totalAmountSpent)
        }));
        setCustomers(customersData);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchCustomers();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchAnalytics(), fetchCustomers()])
      .finally(() => {
        setTimeout(() => setLoading(false), 500);
      });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fullName.localeCompare(b.fullName);
      case 'orders':
        return b.totalOrders - a.totalOrders;
      case 'spent':
        return b.totalAmountSpent - a.totalAmountSpent;
      case 'joinDate':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Calculate stats from real data
  const calculateStats = () => {
    if (!analytics) return null;
    
    return {
      totalCustomers: analytics.totalUsers || 0,
      activeCustomers: analytics.activeUsers || 0,
      newCustomersThisMonth: analytics.newCustomersThisMonth || 0,
      averageOrderValue: analytics.averageOrderValue || 0,
      topSpenders: analytics.topSpenders?.length || 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage and view your customer base.</p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            onClick={handleRefresh}
            variant="secondary"
            disabled={loading}
            className="text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Stats Cards */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
  <StatCard
    title="Total Customers"
    value={
      analyticsLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        stats?.totalCustomers || 0
      )
    }
    icon={Users}
  />
  <StatCard
    title="Active Customers"
    value={
      analyticsLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        stats?.activeCustomers || 0
      )
    }
    icon={CheckCircle}
  />
  <StatCard
    title="New This Month"
    value={
      analyticsLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        stats?.newCustomersThisMonth || 0
      )
    }
    icon={TrendingUp}
  />
  <StatCard
    title="Avg Order Value"
    value={
      analyticsLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        stats?.averageOrderValue || 0
      )
    }
    prefix="R"
    icon={Wallet}
  />
  <StatCard
    title="Top Spenders"
    value={
      analyticsLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      ) : (
        stats?.topSpenders || 0
      )
    }
    icon={Star}
  />
</div>


      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="orders">Sort by Orders</option>
              <option value="spent">Sort by Total Spent</option>
              <option value="joinDate">Sort by Join Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {customersLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-8 bg-slate-200 rounded"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            sortedCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!customersLoading && sortedCustomers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No customers found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
        </motion.div>
      )}

      {/* Results Summary */}
      {!customersLoading && sortedCustomers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 text-center">
            Showing {sortedCustomers.length} of {customers.length} customers
          </p>
        </div>
      )}

    </div>
  );
};

export default CustomersList;
