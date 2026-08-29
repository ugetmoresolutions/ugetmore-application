import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { IDecodedJWT } from "./interfaces/user/user";

export function middleware(request: NextRequest) {
  const encryptedUserCookie: any = request.cookies.get("userToken")?.value;
  const { pathname } = request.nextUrl;

  // Allow public routes without any authentication checks
  if (
    pathname === "/" ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/client/auth/") ||
    pathname === "/client/cart" // Allow cart access for all users
  ) {
    return NextResponse.next();
  }

  // Protected routes that require authentication (removed /client/cart from here)
  const protectedRoutes = [
    "/client/profile",
    "/client/orders",
    "/admin",
    
  ];

  const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));

  if (requiresAuth && !encryptedUserCookie) {
    console.log("No token found, redirecting to login...");
    return NextResponse.redirect(new URL("/client/auth/login", request.nextUrl.origin));
  }

  if (!encryptedUserCookie) {
    return NextResponse.next();
  }

  let accessToken = encryptedUserCookie;
  
  accessToken = decodeURIComponent(accessToken.slice(4));

  let decodedUserData: IDecodedJWT;
  try {
    decodedUserData = jwtDecode(accessToken);
  } catch (error) {
    console.error("Error decoding token:", error);
    if (requiresAuth) {
      const response = NextResponse.redirect(new URL("/client/auth/login", request.nextUrl.origin));
      response.cookies.delete("access_token");
      return response;
    }
    return NextResponse.next();
  }

  const isTokenValid = decodedUserData.exp && new Date(decodedUserData.exp * 1000) > new Date();

  if (!isTokenValid) {
    console.log("Token expired or invalid");
    if (requiresAuth) {
      const response = NextResponse.redirect(new URL("/client/auth/login", request.nextUrl.origin));
      response.cookies.delete("userToken");
      return response;
    }
    const response = NextResponse.next();
    response.cookies.delete("userToken");
    return response;
  }

  // Role-based access control (removed cart check since it's now public)
  if (pathname.startsWith("/client/profile") || pathname.startsWith("/client/orders")) {
    // Corrected condition: check if role is either "customer" OR "business"
    if (decodedUserData.role !== "customer" && decodedUserData.role !== "business") {
      return NextResponse.redirect(new URL("/client/auth/login", request.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/admin") && decodedUserData.role !== "admin") {
    return NextResponse.redirect(new URL("/client/auth/login", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|assets/|logo.svg|login-bg.jpg).*)",
  ],
};