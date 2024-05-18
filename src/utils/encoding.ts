import CryptoJS from "crypto-js";
import { secretKey } from "../config/config";
import {v4 as uuidv4} from "uuid";

// Function to encode a string
export function encodeString(text: string): string | null {
  try {
    const encoded = CryptoJS.AES.encrypt(text, secretKey).toString();
    return encodeURIComponent(encoded);
  } catch (error) {
    return null;
  }
}

// Function to decode a string
export function decodeString(encodedText: string): string | null {
  try {
    const decoded = decodeURIComponent(encodedText);
    const bytes = CryptoJS.AES.decrypt(decoded, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
}

export function generateOTP(int:number):string {
  return uuidv4().split("-").join("").slice(0,int);
}