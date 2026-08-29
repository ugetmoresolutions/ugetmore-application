import { NextRequest, NextResponse } from "next/server";

const TARSUS_API_BASE = "https://feedgen.tarsusonline.co.za/api/DataFeed";
const TARSUS_API_KEY = process.env.TARSUS_API_KEY; // Store your key in .env.local

async function makeTarsusRequest(endpoint: string) {
  if (!TARSUS_API_KEY) {
    throw new Error("TARSUS_API_KEY is not configured");
  }

  const response = await fetch(`${TARSUS_API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TARSUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tarsus API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const endpoint = `/${path.join("/")}`;

  try {
    const data = await makeTarsusRequest(endpoint);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Tarsus API route error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}