import { Diagnostic } from "./logger";

const API_BASE = '/api/amrod';

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
      .replace('https://vendorapi.amrod.co.za', '')
      .replace('https://api.amrod.co.za', '')
      .replace('/api/amrod/', '')
      .replace('/api/amrod', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[API ERROR: GET ${endPoint}]`, result);
      Diagnostic("ERROR ON GET, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON GET, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[API ERROR: GET ${endPoint}]`, error.message);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON GET, returning", errorResult);
    return errorResult;
  }
}

export async function POST(endPoint: string, payload?: object) {
  try {
    let cleanEndpoint = endPoint
      .replace('https://vendorapi.amrod.co.za', '')
      .replace('https://api.amrod.co.za', '')
      .replace('/api/amrod/', '')
      .replace('/api/amrod', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[API ERROR: Method: POST; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON POST, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON POST, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[API ERROR: Method: POST; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON POST, returning", errorResult);
    return errorResult;
  }
}

export async function POSTFILES(endPoint: string, payload: FormData) {
  try {
    let cleanEndpoint = endPoint
      .replace('https://vendorapi.amrod.co.za', '')
      .replace('https://api.amrod.co.za', '')
      .replace('/api/amrod/', '')
      .replace('/api/amrod', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'POST',
      body: payload,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[API ERROR: Method: POSTFILES; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON POSTFILES, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON POSTFILES, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[API ERROR: Method: POSTFILES; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON POSTFILES, returning", errorResult);
    return errorResult;
  }
}

export async function DELETE(endPoint: string, payload?: object): Promise<any> {
  try {
    let cleanEndpoint = endPoint
      .replace('https://vendorapi.amrod.co.za', '')
      .replace('https://api.amrod.co.za', '')
      .replace('/api/amrod/', '')
      .replace('/api/amrod', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[API ERROR: Method: DELETE; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON DELETE, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON DELETE, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[API ERROR: Method: DELETE; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON DELETE, returning", errorResult);
    return errorResult;
  }
}

export async function PUT(endPoint: string, payload?: object): Promise<any> {
  try {
    let cleanEndpoint = endPoint
      .replace('https://vendorapi.amrod.co.za', '')
      .replace('https://api.amrod.co.za', '')
      .replace('/api/amrod/', '')
      .replace('/api/amrod', '')
      .replace(/^\//, '');
    
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[API ERROR: Method: PUT; Endpoint: ${endPoint}]`, result);
      Diagnostic("ERROR ON PUT, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON PUT, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[API ERROR: Method: PUT; Endpoint: ${endPoint}]`, error);
    const errorResult = { error: "Request failed", details: error.message };
    Diagnostic("ERROR ON PUT, returning", errorResult);
    return errorResult;
  }
}

export async function getTokenStatus() {
  try {
    const response = await fetch('/api/amrod-status');
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to fetch token status:', result);
      return { hasToken: false, isExpired: true };
    }
    
    return result;
  } catch (error) {
    console.error('Failed to get token status:', error);
    return { hasToken: false, isExpired: true };
  }
}

export async function clearTokenCache() {
  try {
    const response = await fetch('/api/amrod-clear-cache', {
      method: 'POST'
    });
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Failed to clear token cache:', result);
      return { error: 'Failed to clear cache' };
    }
    
    return result;
  } catch (error) {
    console.error('Failed to clear token cache:', error);
    return { error: 'Failed to clear cache' };
  }
}

export {
  GET as get,
  POST as post,
  POSTFILES as postFiles,
  DELETE as del,
  PUT as put
};