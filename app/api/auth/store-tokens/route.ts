import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = `req_${Date.now()}`; // Add request ID for tracking
  console.log(`🚀 [${requestId}] Store tokens API route started`);

  try {
    const cookieStore = await cookies();
    console.log(`📍 [${requestId}] Cookie store initialized`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore,
      }
    );
    console.log(`📍 [${requestId}] Supabase client created`);

    const data = await request.json();
    console.log(`📌 [${requestId}] Received tokens:`, {
      hasAccessToken: !!data.access_token,
      hasProviderToken: !!data.provider_token,
      hasRefreshToken: !!data.provider_refresh_token,
      expiresIn: data.expires_in,
      tokenExpiryDate: new Date(
        Date.now() + Number(data.expires_in) * 1000
      ).toISOString(),
    });

    const { access_token, provider_token, provider_refresh_token, expires_in } =
      data;

    console.log(`🔍 [${requestId}] Fetching user session`);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`❌ [${requestId}] Failed to get session:`, {
        error: sessionError.message,
        code: sessionError.code,
        status: sessionError.status,
      });
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    console.log(`📌 [${requestId}] Session status:`, {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      lastSignIn: session?.user?.last_sign_in_at,
    });

    if (session?.user?.id) {
      try {
        console.log(
          `💾 [${requestId}] Attempting to update tokens for user:`,
          session.user.id
        );
        const { error: updateError } = await supabase
          .from("users")
          .update({
            google_access_token: provider_token,
            google_refresh_token: provider_refresh_token,
            google_token_expires_at: new Date(
              Date.now() + Number(expires_in) * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id);

        if (updateError) {
          console.error(`❌ [${requestId}] Failed to update user:`, {
            error: updateError.message,
            code: updateError.code,
            userId: session.user.id,
          });
          throw updateError;
        }

        console.log(`✅ [${requestId}] Successfully stored tokens for user:`, {
          userId: session.user.id,
          tokenExpiryDate: new Date(
            Date.now() + Number(expires_in) * 1000
          ).toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error(`❌ [${requestId}] Database error:`, {
          error: error instanceof Error ? error.message : String(error),
          userId: session.user.id,
        });
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    } else {
      console.error(`❌ [${requestId}] No user session found`, {
        sessionExists: !!session,
        hasUser: !!session?.user,
      });
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Store tokens error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
