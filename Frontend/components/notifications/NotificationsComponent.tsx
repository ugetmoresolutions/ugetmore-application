"use client";
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, Clock, Eye, EyeOff } from 'lucide-react';

// Types based on your API response
export interface NotificationData {
  orderId?: number;
  paymentReference?: string;
  amount?: number;
  timestamp?: string;
  [key: string]: any;
}

export interface Notification {
  data: NotificationData;
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  paymentReference?: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  data: {
    notifications: Notification[];
    total: number;
  };
  message: string;
  error: boolean;
}

interface NotificationsComponentProps {
  notifications: Notification[] | { notifications: Notification[]; total: number };
  onMarkAsRead?: (notificationId: number) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (notificationId: number) => void;
  loading?: boolean;
}

export const NotificationsComponent: React.FC<NotificationsComponentProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  loading = false
}) => {
  // Extract notifications array from prop (handles both array and object formats)
  const extractNotifications = (notifications: any): Notification[] => {
    if (Array.isArray(notifications)) {
      return notifications;
    } else if (notifications && typeof notifications === 'object' && Array.isArray(notifications.notifications)) {
      return notifications.notifications;
    }
    return [];
  };

  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>(extractNotifications(notifications));
  const [showAll, setShowAll] = useState(false);
  
  console.log('NotificationsComponent mounted with notifications:', notifications);
  console.log('Extracted notifications:', extractNotifications(notifications));

  useEffect(() => {
    setVisibleNotifications(extractNotifications(notifications));
  }, [notifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'payment_failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'order_update':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format timestamp to relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Handle notification dismiss
  const handleDismiss = (notificationId: number) => {
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    onDismiss?.(notificationId);
  };

  // Handle mark as read
  const handleMarkAsRead = (notificationId: number) => {
    setVisibleNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    onMarkAsRead?.(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setVisibleNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    onMarkAllAsRead?.();
  };

  // Filter notifications for display - ensure visibleNotifications is always an array
  const safeNotifications = Array.isArray(visibleNotifications) ? visibleNotifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;
  const displayedNotifications = showAll ? safeNotifications : safeNotifications.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-7xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full 
      max-w-6xl
      mx-auto sm:mx-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Mark all</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-64 sm:max-h-80 md:max-h-96 lg:max-h-[28rem] xl:max-h-[32rem] overflow-y-auto">
        {safeNotifications.length === 0 ? (
          <div className="p-4 sm:p-6 text-center">
            <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
            <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between space-x-2 sm:space-x-3">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="scale-75 sm:scale-100">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-none">
                        {notification.message}
                      </p>

                      {/* Additional Details */}
                      {notification.data.paymentReference && (
                        <div className="text-xs text-gray-500 mb-1 truncate">
                          <span className="hidden sm:inline">Reference: </span>
                          <span className="sm:hidden">Ref: </span>
                          {notification.data.paymentReference}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-400">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="text-xs">{getRelativeTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {safeNotifications.length > 5 && (
        <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? (
              <span>
                <span className="hidden sm:inline">Show Less</span>
                <span className="sm:hidden">Less</span>
              </span>
            ) : (
              <span>
                <span className="hidden sm:inline">View All {safeNotifications.length} Notifications</span>
                <span className="sm:hidden">All ({safeNotifications.length})</span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};