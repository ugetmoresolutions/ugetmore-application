import { baseUrl } from "../url";
import {  POST} from "../lib/rest-api-client";
import { IEmailData } from "@/interfaces/email/email";

const EmailbaseURL = `${baseUrl}/email`;


export const AUTH_API = {
    SEND_EMAIL: async (emailData:IEmailData) => {
        try {
            const response = await POST(`${EmailbaseURL}/sendEmail`, emailData);
            return response
        } catch (error) {
            throw error;
        }
    },
};