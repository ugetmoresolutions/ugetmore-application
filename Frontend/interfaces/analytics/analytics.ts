export interface IUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  topSpenders: Array<{
    userId: number;
    fullName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }>;
}

export interface IUserProfile {  
  id: number;  
  email: string;  
  fullName: string;  
  phone: string;  
  role: "client" | "admin";  
  address?: string;  
  businessName?: string;  
  businessType?: string;  
  vatNumber?: string;  
  createdAt: Date;  
  updatedAt: Date;  
  activityStatus: "active" | "inactive";  
  totalOrders: number;  
  lastOrderDate: Date | null;  
  totalAmountSpent: number;  
}
