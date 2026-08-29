import { clearTokenCache } from '@/endpoints/lib/client';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    clearTokenCache();
    return NextResponse.json({ 
      success: true, 
      message: "Token cache cleared successfully" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}