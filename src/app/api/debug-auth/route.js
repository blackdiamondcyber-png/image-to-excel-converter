import { NextResponse } from "next/server";
import { getAdminAuth, getInitError } from "@/lib/firebase-admin";

export async function GET() {
  const auth = getAdminAuth();
  const initError = getInitError();

  return NextResponse.json({
    adminSdkAvailable: !!auth,
    adminInitError: initError || null,
    envCheck: {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_present: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_length: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      FIREBASE_PRIVATE_KEY_startsWith: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 27) || "N/A",
      CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
    },
  });
}
