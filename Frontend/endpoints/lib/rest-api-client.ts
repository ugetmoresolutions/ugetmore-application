import { Diagnostic } from "./logger";
import axios from "axios";

export function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}



export async function GET(endPoint: string) {
  try {
    const response = await axios.get(endPoint, {
      headers: getHeaders(),
      withCredentials: true, // Essential for cookies
      decompress: true,
      responseType: 'json'
    });
    return response.data;
  } catch (error: any) {
    console.error(`[API ERROR: GET ${endPoint}]`, error.message);
    return error.response?.data || { error: "Request failed" };
  }
}

export async function POST(endPoint: string, payload: object) {
  try {
    const result = await axios.post(endPoint, payload, {
      headers: getHeaders(),
      withCredentials: true // Essential for cookies
    });
    Diagnostic("SUCCESS ON POST, returning", result);
    return result.data;
  } catch (error: any) {
    console.log(`[API ERROR: Method: POST; Endpoint: ${endPoint}]`, error);
    Diagnostic("ERROR ON POST, returning", error);
    return error.response;
  }
}

export async function POSTFILES (endPoint: string, payload: object) {
  try {
    const result = await axios.post(endPoint, payload, {
      headers:{
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true // Essential for cookies
    });
    Diagnostic("SUCCESS ON POST, returning", result);
    return result.data;
  } catch (error: any) {
    console.log(`[API ERROR: Method: POST; Endpoint: ${endPoint}]`, error);
    Diagnostic("ERROR ON POST, returning", error);
    return error.response;
  }
}

export function DELETE(endPoint: string,payload?: object): Promise<any> {
  return axios
    .delete(endPoint, { 
      headers: getHeaders(),
      withCredentials: true // Essential for cookies
    })
    .then((result: any) => result.data)
    .catch((error: any) => error);
}

export function PUT(endPoint: string, payload?: object): Promise<any> {
  return axios
    .put(endPoint, payload, { 
      headers: getHeaders(),
      withCredentials: true // Essential for cookies
    })
    .then((result: any) => result.data)
    .catch((error: any) => error);
}