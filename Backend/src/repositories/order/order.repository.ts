import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { Address, IBrandedArtwork, IDesignCommunication, IOrder, OrderStatus, PaymentStatus } from "@/types/order/order.types";
import { ICartItem } from "@/types/cart/cart.interface";
import Order from "@/models/order/order.model";
import { IOrderRepository } from "@/interfaces/order/order.repository.interface";
import Notification from "@/models/notification/notification.model";
import { IProduct } from "@/types/product/product.types";
import User from "@/models/user/user.model";
import { Op, Sequelize } from "sequelize";

@Service()
export class OrderRepository implements IOrderRepository {
  public async createOrder(
    userId: number,
    orderData: {
      total: number;
      items: ICartItem[];
      paymentReference?: string;
      address?: string;
    }
  ): Promise<IOrder> {
    const transaction = await Order.sequelize.transaction();

    try {
      const order = await Order.create(
        {
          userId,
          total: orderData.total,
          items: orderData.items,
          paymentStatus: PaymentStatus.PENDING,
          paymentReference: orderData.paymentReference || null,
          status: OrderStatus.PENDING,
          address: orderData.address ,
        },
        { transaction }
      );

      await transaction.commit();
      return order.toJSON() as IOrder;
    } catch (error: any) {
      await transaction.rollback();
      throw new HttpException(409, `Failed to create order: ${error.message}`);
    }
  }

// repository/order.repository.ts
public async addMockupToOrder(
  orderId: number, 
  itemId: string,
  mockupData: {
    url: string;
    notes?: string;
    adminId: number;
  }
): Promise<IOrder> {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }

    const items = order.items || [];
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new HttpException(404, "Item not found in order");
    }

    // Initialize arrays if they don't exist
    if (!items[itemIndex].brandedArtWorks) {
      items[itemIndex].brandedArtWorks = [];
    }
    if (!items[itemIndex].designCommunications) {
      items[itemIndex].designCommunications = [];
    }

    // Add new mockup artwork
    const newArtwork: IBrandedArtwork = {
      url: mockupData.url,
      notes: mockupData.notes,
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    items[itemIndex].brandedArtWorks.push(newArtwork);

    // Add design communication
    const newCommunication: IDesignCommunication = {
      id: Date.now().toString(),
      type: 'mockup_submission',
      message: mockupData.notes || 'New mockup design submitted',
      sender: 'admin',
      attachments: [{
        url: mockupData.url,
        fileName: `mockup-${Date.now()}`,
        fileType: 'image'
      }],
      createdAt: new Date(),
      isRead: false
    };

    items[itemIndex].designCommunications.push(newCommunication);

    // Mark item as branded
    items[itemIndex].isBranded = true;

    // Update order
    await order.update({
      items
    });

    return order.toJSON() as IOrder;
  } catch (error: any) {
    throw new HttpException(500, `Failed to add mockup to order: ${error.message}`);
  }
}

public async getDesignHistory(orderId: number, itemId: string): Promise<IBrandedArtwork[]> {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }

    const item = order.items.find(item => item.id === itemId);
    if (!item) {
      throw new HttpException(404, "Item not found in order");
    }

    return item.brandedArtWorks || [];
  } catch (error: any) {
    throw new HttpException(500, `Failed to get design history: ${error.message}`);
  }
}

public async updateBrandingStatus(
  orderId: number, 
  itemId: string,
  statusData: {
    isApproved: boolean;
    notes?: string;
    userId: number;
    isAdmin: boolean;
  }
): Promise<IOrder> {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }

    const items = order.items || [];
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new HttpException(404, "Item not found in order");
    }

    // Update the latest artwork status
    const brandedArtWorks = items[itemIndex].brandedArtWorks || [];
    if (brandedArtWorks.length > 0) {
      const latestArtwork = brandedArtWorks[brandedArtWorks.length - 1];
      latestArtwork.isApproved = statusData.isApproved;
      latestArtwork.updatedAt = new Date();
      
      if (statusData.notes) {
        latestArtwork.notes = statusData.notes;
      }
    }

    // Add design communication
    const designCommunications = items[itemIndex].designCommunications || [];
    const messageType = statusData.isApproved ? 'approval' : 'revision_request';
    const message = statusData.isApproved 
      ? 'Design has been approved' 
      : 'Design revision requested';
    
    designCommunications.push({
      id: Date.now().toString(),
      type: messageType,
      message: statusData.notes || message,
      sender: statusData.isAdmin ? 'admin' : 'customer',
      createdAt: new Date(),
      isRead: false
    });

    // Update item
    items[itemIndex].brandedArtWorks = brandedArtWorks;
    items[itemIndex].designCommunications = designCommunications;

    await order.update({
      items
    });

    return order.toJSON() as IOrder;
  } catch (error: any) {
    throw new HttpException(500, `Failed to update branding status: ${error.message}`);
  }
}


public async getDesignCommunications(orderId: number, itemId: string): Promise<IDesignCommunication[]> {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new HttpException(404, "Order not found");
    }

    const item = order.items.find(item => item.id === itemId);
    if (!item) {
      throw new HttpException(404, "Item not found in order");
    }

    return item.designCommunications || [];
  } catch (error: any) {
    throw new HttpException(500, `Failed to get design communications: ${error.message}`);
  }
}


  // In OrderRepository
public async getAllOrders(): Promise<IOrder[]> {
  try {
    const orders = await Order.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'fullName', 'phone', 'businessName','role', 'businessType', 'address', 'businessName', 'businessType'] 
      }],
      order: [['createdAt', 'DESC']],
      raw: false // Ensure we get Sequelize instances to use getters
    });

    return orders.map(order => {
      // Use order.get() to get the plain object with getters applied
      const orderData = order.get({ plain: true });

      
      return {
        id: orderData.id,
        total: orderData.total,
        paymentStatus: orderData.paymentStatus,
        paymentReference: orderData.paymentReference,
        status: orderData.status,
        address: orderData.address, 
        items: orderData.items, 
        userId: orderData.userId,
        user: orderData.user,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt
      } as IOrder;
    });
  } catch (error: any) {
    console.error('Error in getAllOrders:', error);
    throw new HttpException(409, `Failed to get all orders: ${error.message}`);
  }
}


// In your OrderRepository

public async getDashboardStats(): Promise<{
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalRefunds: number;
}> {
  try {
    // Get all orders
    const allOrders = await Order.findAll();
    
    // Calculate total sales from completed, paid orders
    const totalSales = allOrders
      .filter(order => 
        order.status === OrderStatus.COMPLETED && 
        order.paymentStatus === PaymentStatus.PAID
      )
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    // Total orders count
    const totalOrders = allOrders.length;

    // Total unique customers
    const uniqueCustomerIds = new Set(allOrders.map(order => order.userId));
    const totalCustomers = uniqueCustomerIds.size;

    // Total refunds (cancelled orders)
    const totalRefunds = allOrders.filter(order => 
      order.status === OrderStatus.CANCELLED
    ).length;

    return {
      totalSales,
      totalOrders,
      totalCustomers,
      totalRefunds
    };
  } catch (error: any) {
    throw new Error(`Failed to get dashboard stats: ${error.message}`);
  }
}

public async getSalesAnalytics(timeRange?: {
  startDate?: Date;
  endDate?: Date;
  timeframe?: "Week" | "Month" | "Year";
}): Promise<{
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueTrend: number;
  orderTrend: number;
  timeSeriesData: Array<{
    period: string;
    sales: number;
    orders: number;
  }>;
}> {
  try {
    const { startDate, endDate, timeframe } = timeRange || {};
    
    // Get all orders
    let allOrders = await Order.findAll();
    
    // Filter by date range if provided
    if (startDate && endDate) {
      allOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Filter only completed, paid orders for revenue calculation
    const validOrders = allOrders.filter(order => 
      order.status === OrderStatus.COMPLETED && 
      order.paymentStatus === PaymentStatus.PAID
    );

    // Current period stats
    const totalRevenue = validOrders.reduce((sum, order) => 
      sum + parseFloat(order.total.toString()), 0
    );
    const totalOrders = allOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Generate time series data based on timeframe
    const timeSeriesData = await this.generateTimeSeriesData(allOrders, validOrders, timeframe);

    // Calculate trends
    const { revenueTrend, orderTrend } = await this.calculateTrends(
      allOrders, 
      validOrders, 
      timeframe
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueTrend: Math.round(revenueTrend * 100) / 100,
      orderTrend: Math.round(orderTrend * 100) / 100,
      timeSeriesData
    };
  } catch (error: any) {
    throw new Error(`Failed to get sales analytics: ${error.message}`);
  }
}

private async generateTimeSeriesData(
  allOrders: Order[], 
  validOrders: Order[], 
  timeframe?: "Week" | "Month" | "Year"
): Promise<Array<{ period: string; sales: number; orders: number }>> {
  
  if (!timeframe) {
    // Default to current month if no timeframe specified
    return this.generateMonthlyData(allOrders, validOrders);
  }

  switch (timeframe) {
    case "Week":
      return this.generateWeeklyData(allOrders, validOrders);
    case "Month":
      return this.generateMonthlyData(allOrders, validOrders);
    case "Year":
      return this.generateYearlyData(allOrders, validOrders);
    default:
      return this.generateMonthlyData(allOrders, validOrders);
  }
}

private generateWeeklyData(
  allOrders: Order[],
  validOrders: Order[]
): Array<{ period: string; sales: number; orders: number }> {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData: { [key: string]: { sales: number; orders: number } } = {};

  daysOfWeek.forEach(day => {
    weeklyData[day] = { sales: 0, orders: 0 };
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  console.log("DEBUG week range:", startOfWeek, endOfWeek);

  // Count all orders
  allOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const t = orderDate.getTime();
    if (t >= startOfWeek.getTime() && t <= endOfWeek.getTime()) {
      const dayName = daysOfWeek[orderDate.getDay()];
      weeklyData[dayName].orders += 1;
    }
  });

  // Count valid orders (for sales)
  validOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const t = orderDate.getTime();
    if (t >= startOfWeek.getTime() && t <= endOfWeek.getTime()) {
      const dayName = daysOfWeek[orderDate.getDay()];
      const revenue = parseFloat(order.total?.toString() || "0");
      weeklyData[dayName].sales += revenue;
    }
  });

  console.log("DEBUG weeklyData after counting:", weeklyData);

  return daysOfWeek.map(day => ({
    period: day,
    sales: weeklyData[day].sales,
    orders: weeklyData[day].orders
  }));
}



private generateMonthlyData(
  allOrders: Order[], 
  validOrders: Order[]
): Array<{ period: string; sales: number; orders: number }> {
  const monthlyData: { [key: string]: { sales: number; orders: number } } = {};
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Initialize all months with zero values
  months.forEach(month => {
    monthlyData[month] = { sales: 0, orders: 0 };
  });

  // Process orders for the current year
  const currentYear = new Date().getFullYear();
  
  allOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate.getFullYear() === currentYear) {
      const monthName = months[orderDate.getMonth()];
      monthlyData[monthName].orders += 1;
      
      // Add to sales if it's a valid order
      if (order.status === OrderStatus.COMPLETED && order.paymentStatus === PaymentStatus.PAID) {
        monthlyData[monthName].sales += parseFloat(order.total.toString());
      }
    }
  });

  // Convert to array format for the chart
  return months.map(month => ({
    period: month,
    sales: monthlyData[month].sales,
    orders: monthlyData[month].orders
  }));
}

private generateYearlyData(
  allOrders: Order[], 
  validOrders: Order[]
): Array<{ period: string; sales: number; orders: number }> {
  const yearlyData: { [key: string]: { sales: number; orders: number } } = {};

  // Process all orders to group by year
  allOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const year = orderDate.getFullYear().toString();
    
    if (!yearlyData[year]) {
      yearlyData[year] = { sales: 0, orders: 0 };
    }
    
    yearlyData[year].orders += 1;
    
    // Add to sales if it's a valid order
    if (order.status === OrderStatus.COMPLETED && order.paymentStatus === PaymentStatus.PAID) {
      yearlyData[year].sales += parseFloat(order.total.toString());
    }
  });

  // Convert to array format for the chart, limit to last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
  
  return years.map(year => ({
    period: year,
    sales: yearlyData[year]?.sales || 0,
    orders: yearlyData[year]?.orders || 0
  }));
}

private async calculateTrends(
  allOrders: Order[], 
  validOrders: Order[], 
  timeframe?: "Week" | "Month" | "Year"
): Promise<{ revenueTrend: number; orderTrend: number }> {
  // For simplicity, let's calculate trends based on previous period
  const now = new Date();
  let previousStart: Date;
  let previousEnd: Date;

  switch (timeframe) {
    case "Week":
      previousStart = new Date(now);
      previousStart.setDate(now.getDate() - 7 - now.getDay());
      previousEnd = new Date(now);
      previousEnd.setDate(now.getDate() - 1 - now.getDay());
      break;
    case "Month":
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "Year":
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  // Get previous period orders
  const previousOrders = await Order.findAll({
    where: {
      createdAt: {
        [Op.between]: [previousStart, previousEnd]
      }
    }
  });

  const previousValidOrders = previousOrders.filter(order => 
    order.status === OrderStatus.COMPLETED && 
    order.paymentStatus === PaymentStatus.PAID
  );

  const currentRevenue = validOrders.reduce((sum, order) => 
    sum + parseFloat(order.total.toString()), 0
  );
  const previousRevenue = previousValidOrders.reduce((sum, order) => 
    sum + parseFloat(order.total.toString()), 0
  );

  const revenueTrend = previousRevenue > 0 ? 
    ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  const orderTrend = previousOrders.length > 0 ? 
    ((allOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

  return { revenueTrend, orderTrend };
}


public async getTop5Products(): Promise<Array<{ 
  product: IProduct; 
  orderCount: number; 
  totalQuantity: number;
  priceInfo: {
    totalRevenue: number;
    avgPricePerUnit: number;
    minPrice: number;
    maxPrice: number;
  };
  brandingInfo: {
    isBranded: boolean;
    brandingMethods?: string[];
    avgBrandingCost?: number;
  };
}>> {
  try {
    // Get all orders with non-null items
    const orders = await Order.findAll({
      where: {},
      attributes: ['items']
    });

    // Create a map to track product statistics with branding and pricing consideration
    const productStats = new Map<string, {
      product: IProduct;
      orderCount: number;
      totalQuantity: number;
      priceInfo: {
        totalRevenue: number;
        prices: number[];
      };
      brandingInfo: {
        isBranded: boolean;
        brandingMethods: Set<string>;
        totalBrandingCost: number;
        brandedOrderCount: number;
      };
    }>();

    // Process each order's items
    orders.forEach(order => {
      const orderData = order.toJSON();
      if (orderData.items && Array.isArray(orderData.items)) {
        const items = orderData.items;

        // Track which products appear in this order (for order count)
        const productsInThisOrder = new Set<string>();

        items.forEach((item: ICartItem) => {
          if (item.product && item.product.fullCode) {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const brandingConfigs = item.brandingConfigs;
            const isBranded = !!(brandingConfigs && 
              brandingConfigs.configurations && 
              brandingConfigs.configurations.length > 0);

            // Create a unique key that considers both product and branding status
            const productKey = isBranded 
              ? `${item.product.fullCode}_BRANDED` 
              : `${item.product.fullCode}_UNBRANDED`;

            // Track this product in current order
            productsInThisOrder.add(productKey);

            if (productStats.has(productKey)) {
              const stats = productStats.get(productKey)!;
              stats.totalQuantity += quantity;
              
              // Update price info
              stats.priceInfo.totalRevenue += price;
              stats.priceInfo.prices.push(price);
              
              // Update branding info if branded
              if (isBranded && brandingConfigs) {
                stats.brandingInfo.totalBrandingCost += brandingConfigs.totalCost?.brandingCost || 0;
                stats.brandingInfo.brandedOrderCount += 1;
                
                // Collect branding methods
                brandingConfigs.selectedPositions?.forEach(position => {
                  if (position.selectedMethod) {
                    stats.brandingInfo.brandingMethods.add(position.selectedMethod.brandingName);
                  }
                });
              }
            } else {
              const brandingMethods = new Set<string>();
              let totalBrandingCost = 0;
              let brandedOrderCount = 0;

              if (isBranded && brandingConfigs) {
                totalBrandingCost = brandingConfigs.totalCost?.brandingCost || 0;
                brandedOrderCount = 1;
                
                // Collect branding methods
                brandingConfigs.selectedPositions?.forEach(position => {
                  if (position.selectedMethod) {
                    brandingMethods.add(position.selectedMethod.brandingName);
                  }
                });
              }

              productStats.set(productKey, {
                product: item.product,
                orderCount: 0, // Will be incremented below
                totalQuantity: quantity,
                priceInfo: {
                  totalRevenue: price,
                  prices: [price]
                },
                brandingInfo: {
                  isBranded,
                  brandingMethods,
                  totalBrandingCost,
                  brandedOrderCount
                }
              });
            }
          }
        });

        // Increment order count for each unique product in this order
        productsInThisOrder.forEach(productKey => {
          const stats = productStats.get(productKey);
          if (stats) {
            stats.orderCount += 1;
          }
        });
      }
    });

    // Convert map to array and sort by total revenue (you can change sorting criteria)
    const sortedProducts = Array.from(productStats.values())
      .sort((a, b) => {
        // Primary sort: by total revenue (descending)
        if (b.priceInfo.totalRevenue !== a.priceInfo.totalRevenue) {
          return b.priceInfo.totalRevenue - a.priceInfo.totalRevenue;
        }
        // Secondary sort: by total quantity (descending)
        if (b.totalQuantity !== a.totalQuantity) {
          return b.totalQuantity - a.totalQuantity;
        }
        // Tertiary sort: by order count (descending)
        if (b.orderCount !== a.orderCount) {
          return b.orderCount - a.orderCount;
        }
        // Quaternary sort: prioritize branded products
        if (a.brandingInfo.isBranded !== b.brandingInfo.isBranded) {
          return b.brandingInfo.isBranded ? 1 : -1;
        }
        return 0;
      })
      // .slice(0, 5) // Remove this line to return all products
      .map(stats => ({
        product: stats.product,
        orderCount: stats.orderCount,
        totalQuantity: stats.totalQuantity,
        priceInfo: {
          totalRevenue: parseFloat(stats.priceInfo.totalRevenue.toFixed(2)),
          avgPricePerUnit: parseFloat((stats.priceInfo.totalRevenue / stats.totalQuantity).toFixed(2)),
          minPrice: parseFloat(Math.min(...stats.priceInfo.prices).toFixed(2)),
          maxPrice: parseFloat(Math.max(...stats.priceInfo.prices).toFixed(2))
        },
        brandingInfo: {
          isBranded: stats.brandingInfo.isBranded,
          brandingMethods: stats.brandingInfo.isBranded 
            ? Array.from(stats.brandingInfo.brandingMethods) 
            : undefined,
          avgBrandingCost: stats.brandingInfo.isBranded && stats.brandingInfo.brandedOrderCount > 0
            ? parseFloat((stats.brandingInfo.totalBrandingCost / stats.brandingInfo.brandedOrderCount).toFixed(2))
            : undefined
        }
      }));

    return sortedProducts;

  } catch (error: any) {
    throw new HttpException(409, `Failed to get top products: ${error.message}`);
  }
}
// ...existing

  public async getOrderById(orderId: number): Promise<IOrder | null> {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "user", // make sure this matches your association alias
          attributes: ["id", "fullName", "email", "address"],
        },
        
      ],
    });

    if (!order) {
      return null;
    }

    return order.toJSON() as IOrder;
  } catch (error: any) {
    throw new HttpException(409, `Failed to get order: ${error.message}`);
  }
}

public async deleteAllOrders(): Promise<void> {
  const transaction = await Order.sequelize.transaction();

  try {
    // Delete notifications referencing orders
    await Notification.destroy({
      where: {}, // all notifications
      force: true,
      transaction,
    });

    // Now delete orders
    await Order.destroy({
      where: {},
      force: true,
      transaction,
    });

    await transaction.commit();
  } catch (error: any) {
    await transaction.rollback();
    throw new HttpException(409, `Failed to delete all orders: ${error.message}`);
  }
}


  public async getUserOrders(
    userId: number,
    limit: number = 50,
    offset: number = 0
): Promise<IOrder[]> {
    try {
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email', 'address'] // fetch address
                }
            ]
        });

        return orders.map(order => order.toJSON() as IOrder);
    } catch (error: any) {
        throw new HttpException(409, `Failed to get user orders: ${error.message}`);
    }
}

  public async updateOrderStatus(orderId: number, status: OrderStatus): Promise<IOrder> {
    const transaction = await Order.sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction });

      if (!order) {
        await transaction.rollback();
        throw new HttpException(404, "Order not found");
      }

      await order.update({ status }, { transaction });
      await transaction.commit();

      return order.toJSON() as IOrder;
    } catch (error: any) {
      await transaction.rollback();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(409, `Failed to update order status: ${error.message}`);
    }
  }

  public async updatePaymentStatus(
    orderId: number,
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ): Promise<IOrder> {
    const transaction = await Order.sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction });

      if (!order) {
        await transaction.rollback();
        throw new HttpException(404, "Order not found");
      }

      const updateData: any = { paymentStatus };
      if (paymentReference !== undefined) {
        updateData.paymentReference = paymentReference;
      }

      await order.update(updateData, { transaction });
      await transaction.commit();

      return order.toJSON() as IOrder;
    } catch (error: any) {
      await transaction.rollback();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(409, `Failed to update payment status: ${error.message}`);
    }
  }

  public async getOrderByPaymentReference(paymentReference: string): Promise<IOrder | null> {
    try {
      const order = await Order.findOne({
        where: { paymentReference },
      });

      if (!order) {
        return null;
      }

      return order.toJSON() as IOrder;
    } catch (error: any) {
      throw new HttpException(409, `Failed to get order by payment reference: ${error.message}`);
    }
  }

  public async getOrdersByStatus(
    status: OrderStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<IOrder[]> {
    try {
      const orders = await Order.findAll({
        where: { status },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return orders.map(order => order.toJSON() as IOrder);
    } catch (error: any) {
      throw new HttpException(409, `Failed to get orders by status: ${error.message}`);
    }
  }

  public async getTotalOrdersCount(userId?: number): Promise<number> {
    try {
      const whereClause = userId ? { userId } : {};

      const count = await Order.count({
        where: whereClause,
      });

      return count;
    } catch (error: any) {
      throw new HttpException(409, `Failed to get orders count: ${error.message}`);
    }
  }

  public async cancelOrder(orderId: number): Promise<IOrder> {
    const transaction = await Order.sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction });

      if (!order) {
        await transaction.rollback();
        throw new HttpException(404, "Order not found");
      }

      const currentOrder = order.toJSON() as IOrder;

      // Only allow cancellation of pending orders
      if (currentOrder.status !== OrderStatus.PENDING) {
        await transaction.rollback();
        throw new HttpException(400, "Only pending orders can be cancelled");
      }

      await order.update({
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.CANCELLED
      }, { transaction });

      await transaction.commit();

      return order.toJSON() as IOrder;
    } catch (error: any) {
      await transaction.rollback();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(409, `Failed to cancel order: ${error.message}`);
    }
  }

  public async getUserAnalytics(): Promise<{
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
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Total users count
      const totalUsers = await User.count();

      // Active users (users who have made at least one order)
      const activeUsersResult = await Order.findAll({
        attributes: ['userId'],
        group: ['userId'],
        raw: true
      });
      const activeUsers = activeUsersResult.length;

      // New customers in current month
      const newCustomersThisMonth = await User.count({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lte]: endOfMonth
          }
        }
      });

      // Average order value
      const orderTotals = await Order.findAll({
        attributes: ['total'],
        raw: true
      });
      const averageOrderValue = orderTotals.length > 0 
        ? orderTotals.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) / orderTotals.length
        : 0;

      // Top spenders (users who have spent at least 2000)
      const userSpending = await Order.findAll({
        attributes: ['userId', [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'totalSpent'], [Order.sequelize.fn('COUNT', '*'), 'orderCount']],
        group: ['userId'],
        having: Order.sequelize.where(Order.sequelize.fn('SUM', Order.sequelize.col('total')), Op.gte, 2000),
        order: [[Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'DESC']],
        raw: true
      });

      const topSpendersWithDetails = await Promise.all(
        userSpending.map(async (spending: any) => {
          const user = await User.findByPk(spending.userId, { raw: true });
          return {
            userId: spending.userId,
            fullName: user?.fullName || 'Unknown',
            email: user?.email || 'Unknown',
            totalSpent: parseFloat(spending.totalSpent),
            orderCount: parseInt(spending.orderCount)
          };
        })
      );

      return {
        totalUsers,
        activeUsers,
        newCustomersThisMonth,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        topSpenders: topSpendersWithDetails
      };

    } catch (error: any) {
      throw new HttpException(409, `Failed to get user analytics: ${error.message}`);
    }
  }

  public async getUsersWithOrderDetails(): Promise<Array<{
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: "client" | "admin";
  address?: string[];
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  activityStatus: "active" | "inactive";
  totalOrders: number;
  lastOrderDate: Date | null;
  totalAmountSpent: number;
}>> {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Get all users
    const users = await User.findAll({ raw: true });

    // Get order statistics for each user
    const usersWithOrderDetails = await Promise.all(
      users.map(async (user) => {
        // Get user's order statistics
        const orderStats = await Order.findAll({
          attributes: [
            [Order.sequelize.fn('COUNT', '*'), 'totalOrders'],
            [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'totalAmountSpent'],
            [Order.sequelize.fn('MAX', Order.sequelize.col('createdAt')), 'lastOrderDate']
          ],
          where: { userId: user.id },
          raw: true
        });

        const stats = orderStats[0] as any;
        const totalOrders = parseInt(stats.totalOrders) || 0;
        const totalAmountSpent = parseFloat(stats.totalAmountSpent) || 0;
        const lastOrderDate = stats.lastOrderDate ? new Date(stats.lastOrderDate) : null;

        // Determine activity status based on last order date
        let activityStatus: "active" | "inactive" = "inactive";
        if (lastOrderDate && lastOrderDate > threeMonthsAgo) {
          activityStatus = "active";
        } else if (totalOrders === 0) {
          // Users with no orders are considered inactive
          activityStatus = "inactive";
        }

        // Parse address from user data
        let addresses: string[] | undefined;
        if (user.address) {
          try {
            // Parse the address if it's stored as JSON string
            addresses = typeof user.address === 'string' 
              ? JSON.parse(user.address) 
              : user.address;
            
            // Ensure it's an array
            if (!Array.isArray(addresses)) {
              addresses = [addresses];
            }
          } catch (error) {
            console.error('Failed to parse user address:', error);
            addresses = undefined;
          }
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role as "client" | "admin",
          address: addresses, // Return as string[] array
          businessName: user.businessName,
          businessType: user.businessType,
          vatNumber: user.vatNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          activityStatus,
          totalOrders,
          lastOrderDate,
          totalAmountSpent: parseFloat(totalAmountSpent.toFixed(2))
        };
      })
    );

    return usersWithOrderDetails;

  } catch (error: any) {
    throw new HttpException(409, `Failed to get users with order details: ${error.message}`);
  }
}
}