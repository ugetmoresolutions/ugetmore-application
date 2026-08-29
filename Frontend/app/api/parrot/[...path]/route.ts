import { NextRequest, NextResponse } from "next/server";

const PARROT_API_BASE = "https://accounts.parrotproducts.biz/PublicWebServices/Customers.svc";
const cache: Record<string, { data: any; expiry: number }> = {};

async function makeParrotRequest(method: string, endpoint: string, body?: any) {
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...(body && typeof body === 'object' && !(body instanceof FormData) && {
        'Content-Type': 'application/json'
      })
    },
    next: { revalidate: 0 },
  };

  if (body) {
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${PARROT_API_BASE}${endpoint}`, requestOptions);

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `Parrot API error for ${method} ${endpoint}: ${res.status} - ${errBody}`
    );
  }

  return res.json();
}

async function getCached(endpoint: string, ttlSeconds: number) {
  const now = Date.now();
  if (cache[endpoint] && cache[endpoint].expiry > now) {
    return cache[endpoint].data;
  }

  const data = await makeParrotRequest("GET", endpoint);
  cache[endpoint] = {
    data,
    expiry: now + ttlSeconds * 1000,
  };

  return data;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;
  const { searchParams } = new URL(req.url);

  try {
    let data;
    let actualEndpoint;
    
    if (endpoint === "/customerProductFeed") {
      actualEndpoint = "/GetCustomerProductFeed/1/TtvG1JXe/json";
      data = await getCached(actualEndpoint, 3600);
    } else {
      const queryString = searchParams.toString();
      actualEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
      data = await makeParrotRequest("GET", actualEndpoint);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Parrot API route error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;

  try {
    const contentType = req.headers.get('content-type');
    let body;

    if (contentType?.includes('multipart/form-data')) {
      body = await req.formData();
    } else if (contentType?.includes('application/json')) {
      body = await req.json();
    } else {
      body = await req.text();
    }

    const data = await makeParrotRequest("POST", endpoint, body);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Parrot API route error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;

  try {
    const body = await req.json();
    const data = await makeParrotRequest("PUT", endpoint, body);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Parrot API route error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;

  try {
    let body;
    const contentLength = req.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > 0) {
      body = await req.json();
    }

    const data = await makeParrotRequest("DELETE", endpoint, body);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Parrot API route error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}