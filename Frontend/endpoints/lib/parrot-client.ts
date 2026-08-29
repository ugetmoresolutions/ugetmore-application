import { Diagnostic } from "./logger";

const API_BASE = '/api/parrot';

function getHeaders(excludeContentType?: boolean) {
  const headers: Record<string, string> = {};
  
  if (!excludeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
}

export async function GET(endPoint: string) {
  try {
    let cleanEndpoint = endPoint
      .replace('https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc', '')
      .replace('/api/parrot/', '')
      .replace('/api/parrot', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[PARROT API ERROR: GET ${endPoint}]`, result);
      Diagnostic("ERROR ON PARROT GET, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PARROT GET, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[PARROT API ERROR: GET ${endPoint}]`, error.message);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PARROT GET, returning", errorResult);
    return errorResult;
  }
}

export async function POST(endPoint: string, payload?: object) {
  try {
    let cleanEndpoint = endPoint
      .replace('https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc', '')
      .replace('/api/parrot/', '')
      .replace('/api/parrot', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[PARROT API ERROR: Method: POST; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON PARROT POST, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PARROT POST, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[PARROT API ERROR: Method: POST; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PARROT POST, returning", errorResult);
    return errorResult;
  }
}

export async function POSTFILES(endPoint: string, payload: FormData) {
  try {
    let cleanEndpoint = endPoint
      .replace('https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc', '')
      .replace('/api/parrot/', '')
      .replace('/api/parrot', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'POST',
      body: payload,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[PARROT API ERROR: Method: POSTFILES; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON PARROT POSTFILES, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PARROT POSTFILES, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[PARROT API ERROR: Method: POSTFILES; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PARROT POSTFILES, returning", errorResult);
    return errorResult;
  }
}

export async function DELETE(endPoint: string, payload?: object): Promise<any> {
  try {
    let cleanEndpoint = endPoint
      .replace('https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc', '')
      .replace('/api/parrot/', '')
      .replace('/api/parrot', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[PARROT API ERROR: Method: DELETE; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON PARROT DELETE, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PARROT DELETE, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[PARROT API ERROR: Method: DELETE; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PARROT DELETE, returning", errorResult);
    return errorResult;
  }
}

export async function PUT(endPoint: string, payload?: object): Promise<any> {
  try {
    let cleanEndpoint = endPoint
      .replace('https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc', '')
      .replace('/api/parrot/', '')
      .replace('/api/parrot', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[PARROT API ERROR: Method: PUT; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON PARROT PUT, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PARROT PUT, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[PARROT API ERROR: Method: PUT; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PARROT PUT, returning", errorResult);
    return errorResult;
  }
}

export {
  GET as get,
  POST as post,
  POSTFILES as postFiles,
  DELETE as del,
  PUT as put
};