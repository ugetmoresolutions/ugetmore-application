"use client"
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { IDecodedJWT, TokenData } from "@/interfaces/user/user";
const cookies = new Cookies();

export const decryptUser = () => {
  const encryptedUserCookie = cookies.get("userToken");

  if (!encryptedUserCookie) {
    return null;
  }
  
  try {
    console.log("I am token", encryptedUserCookie);
    return encryptedUserCookie;
  } catch (error) {
    console.log("Decryption or parsing failed:", error);
    return null;
  }
};

export const getAccessToken = () => {
  const encryptedUserCookie = cookies.get("userToken");
  
  if (!encryptedUserCookie) {
    return null;
  }
  
  return encryptedUserCookie;
};

export const decodeAccessToken = (): IDecodedJWT | null => {
  const encryptedUserCookie = cookies.get("userToken");
  
  if (!encryptedUserCookie) {
    return null;
  }
  
  try {
    const decodedUserData: IDecodedJWT = jwtDecode(encryptedUserCookie);
    return decodedUserData;
  } catch (error) {
    console.log("Failed to decode token:", error);
    return null;
  }
};

export const getRefreshToken = () => {
  const userData = cookies.get("user_data");
  
  if (!userData) {
    return null;
  }
  
  try {
    const parsedData = typeof userData === 'string' ? JSON.parse(userData) : userData;
    return parsedData.refreshToken || null;
  } catch (error) {
    console.log("Failed to get refresh token:", error);
    return null;
  }
};

export const encryptToken = (token: TokenData) => {
  cookies.remove("userToken", {
    path: '/',
    secure: true,
    sameSite: 'lax'
  });
  
  cookies.set("userToken", token.accessToken, {
    path: "/",
    secure: true,
    sameSite: "lax",
    httpOnly: false,
    maxAge: 259200000
  });
};