import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COUNTRY_MAP: Record<string, string> = {
  KR: "/kr",
  JP: "/jp",
  CN: "/cn",
  // Europe
  GB: "/uk",
  IE: "/uk",
  DE: "/de",
  AT: "/de",
  CH: "/de",
  FR: "/fr",
  BE: "/fr",
  NL: "/nl",
  ES: "/es",
  IT: "/it",
  SE: "/se",
  NO: "/se",
  DK: "/se",
  FI: "/se",
  PL: "/pl",
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname !== "/") return NextResponse.next();

  // ?country=us — user explicitly chose US version; persist preference and strip param
  if (searchParams.get("country") === "us") {
    const url = new URL("/", request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set("preferred-country", "us", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return response;
  }

  // Respect saved preference
  const saved = request.cookies.get("preferred-country")?.value;
  if (saved === "us") return NextResponse.next();

  // Detect country via Vercel geo header
  const country = request.headers.get("x-vercel-ip-country") ?? "";

  const destination = COUNTRY_MAP[country.toUpperCase()];
  if (!destination) return NextResponse.next();

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set("preferred-country", country.toLowerCase(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: "/",
};
