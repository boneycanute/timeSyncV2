"use client";

import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Clock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGetStarted = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-4xl font-bold text-center">
            Sync Your Calendar with AI
          </h1>
          <p className="text-xl text-center text-gray-600">
            Let AI help you manage your schedule
          </p>
          <Button onClick={handleGetStarted} size="lg">
            Get Started
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <Calendar className="w-8 h-8" />
            <h2 className="text-lg font-semibold">Smart Scheduling</h2>
            <p className="text-gray-600">
              AI-powered calendar management for optimal time allocation
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <MessageSquare className="w-8 h-8" />
            <h2 className="text-lg font-semibold">Natural Language</h2>
            <p className="text-gray-600">
              Schedule meetings using simple conversational commands
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Clock className="w-8 h-8" />
            <h2 className="text-lg font-semibold">Time Analytics</h2>
            <p className="text-gray-600">
              Get insights into how you spend your time
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
