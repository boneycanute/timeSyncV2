import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            });
          },
        },
      }
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth error:", error.message);
        return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
      }

      // Successful authentication, redirect to the next page
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
    }
  }

  // No code provided
  return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
}
