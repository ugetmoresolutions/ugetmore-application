"use client";
import { decodeAccessToken } from "@/endpoints/lib/ecryptUser";
import { NOTIFICATIONS_API } from "@/endpoints/rest-api/notifications";
import { INotification } from "@/interfaces/notifications/notifications";
import { useEffect, useState } from "react";
import { NotificationsComponent } from "./NotificationsComponent";

const Notifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const loggedInUser = decodeAccessToken();

  const handleMarkAsRead = (notificationId: number) => {
    console.log("Marking as read:", notificationId);
    // Implement API call here
  };

  const handleMarkAllAsRead = () => {
    console.log("Marking all as read");
    // Implement API call here
  };

  const handleDismiss = (notificationId: number) => {
    console.log("Dismissing notification:", notificationId);
    // Implement API call here
  };

  const getUserNotifications = async () => {
    try {
      if (!loggedInUser?.id) return;
      const response = await NOTIFICATIONS_API.GET_USER_NOTIFICATIONS(loggedInUser.id);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    getUserNotifications();
  }, [loggedInUser?.id]); 

  return (
    <div className="p-8  min-h-screen">
        <NotificationsComponent
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDismiss={handleDismiss}
          loading={false}
        />
    </div>
  );
};

export default Notifications;
