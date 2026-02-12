import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(req) {
  let res = NextResponse.next({ request: req });

  // Skip auth check if Supabase is not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return res;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // Redirect logged-in users away from auth pages
    if (session && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protected routes — redirect to login if not authenticated
    const protectedRoutes = ["/history"];
    if (!session && protectedRoutes.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch {
    // If middleware auth check fails, allow through
  }

  return res;
}

export const config = {
  matcher: ["/login", "/signup", "/history"],
};
