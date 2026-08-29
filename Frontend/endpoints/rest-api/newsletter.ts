// endpoints/rest-api/newsletter.ts
import { CustomResponse } from "@/interfaces/product/response";
import { GET, POST } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { INewsletterSubscriber, ICreateSubscriber } from "@/interfaces/newsletter/newsletter";

const NewsletterBaseURL = `${baseUrl}/newsletter`;

export const NEWSLETTER_API = {
  // SUBSCRIBE to newsletter
  SUBSCRIBE: async (subscriberData: ICreateSubscriber): Promise<CustomResponse<INewsletterSubscriber>> => {
    try {
      const response = await POST(`${NewsletterBaseURL}/subscribe`, subscriberData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UNSUBSCRIBE from newsletter
  UNSUBSCRIBE: async (email: string): Promise<CustomResponse<null>> => {
    try {
      const response = await POST(`${NewsletterBaseURL}/unsubscribe`, { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET subscriber by email (Admin)
  GET_SUBSCRIBER_BY_EMAIL: async (email: string): Promise<CustomResponse<INewsletterSubscriber>> => {
    try {
      const response = await GET(`${NewsletterBaseURL}/subscribers/${email}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET all subscribers (Admin)
  GET_ALL_SUBSCRIBERS: async (): Promise<CustomResponse<INewsletterSubscriber[]>> => {
    try {
      const response = await GET(`${NewsletterBaseURL}/subscribers`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET subscriber statistics (Admin)
  GET_SUBSCRIBER_STATS: async (): Promise<CustomResponse<{ total: number; active: number }>> => {
    try {
      const response = await GET(`${NewsletterBaseURL}/subscribers/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};