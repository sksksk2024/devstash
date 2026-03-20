import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  // Protected routes: /dashboard/*
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    // Check if user is authenticated
    if (!req.auth) {
      const redirectUrl = new URL("/api/auth/signin", req.url);
      redirectUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  return NextResponse.next();
});
