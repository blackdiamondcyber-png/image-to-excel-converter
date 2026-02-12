import { NextResponse } from "next/server";

/**
 * Middleware — Firebase Auth is client-side, so route protection
 * is handled by the components themselves (useAuth hook).
 * This middleware is kept as a passthrough for future server-side checks.
 */
export async function middleware(req) {
  return NextResponse.next({ request: req });
}

export const config = {
  matcher: ["/login", "/signup", "/history"],
};
