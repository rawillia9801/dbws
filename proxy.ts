import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const platformHosts = new Set(["dogbreederweb.site", "www.dogbreederweb.site", "localhost", "127.0.0.1"]);

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(":")[0].toLowerCase();
  const path = request.nextUrl.pathname;
  const platformHost = platformHosts.has(host) || host.endsWith(".vercel.app");

  if (!platformHost && host.startsWith("mail.")) {
    return NextResponse.redirect("https://mail.hostinger.com", 307);
  }

  const customDomainRequest = !platformHost && !path.startsWith("/api/");
  if (customDomainRequest) {
    const rewrite = request.nextUrl.clone();
    rewrite.pathname = "/domain-site";
    rewrite.searchParams.set("host", host.replace(/^www\./, ""));
    return NextResponse.rewrite(rewrite);
  }

  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
