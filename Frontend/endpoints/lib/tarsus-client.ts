import { Diagnostic } from "./logger";

const TARSUS_API_BASE = '/api/tarsus';

function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function TARSUS_GET(endPoint: string) {
  try {
    console.log('🔧 TARSUS_GET called:', endPoint);
    
    // Clean the endpoint to remove any base URL parts
    let cleanEndpoint = endPoint
      .replace('https://feedgen.tarsusonline.co.za/api/DataFeed', '')
      .replace('/api/tarsus/', '')
      .replace('/api/tarsus', '')
      .replace(/^\//, '');
    
    const fullUrl = `${TARSUS_API_BASE}/${cleanEndpoint}`;
    console.log('🔧 TARSUS_GET fetching:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store' // Disable caching for debugging
    });
    
    console.log('🔧 TARSUS_GET response status:', response.status);
    
    const result = await response.json();
    console.log('🔧 TARSUS_GET response data:', {
      hasError: !!result.error,
      dataKeys: Object.keys(result),
      productsCount: result.Products?.length
    });
    
    if (!response.ok) {
      console.error(`[TARSUS API ERROR: GET ${endPoint}]`, result);
      Diagnostic("ERROR ON TARSUS GET, returning", result);
      return result;
    }
    
    Diagnostic("SUCCESS ON TARSUS GET, returning", result);
    return result;
  } catch (error: any) {
    console.error(`[TARSUS API ERROR: GET ${endPoint}]`, error.message);
    const errorResult = { 
      error: "Tarsus request failed", 
      details: error.message 
    };
    Diagnostic("ERROR ON TARSUS GET, returning", errorResult);
    return errorResult;
  }
}