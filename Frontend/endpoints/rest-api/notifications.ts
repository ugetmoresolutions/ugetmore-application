import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";
import { INotification } from "@/interfaces/notifications/notifications";

const NotificationsbaseURL = `${baseUrl}/notifications`;


export const NOTIFICATIONS_API = {
    GET_USER_NOTIFICATIONS: async (userId: number): Promise<CustomResponse<INotification[]>> => {
        try {
            const response = await GET(`${NotificationsbaseURL}/user/${userId}`);
            return response
        } catch (error) {
            throw error;
        }
    },

};