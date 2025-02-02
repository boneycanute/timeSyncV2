import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "TimeSync",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={"h-full w-full"}>
      <body className={`antialiased w-full h-full lex flex-col`}>
        <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
          <nav
            className={
              "sm:fixed w-full top-0 left-0 grid grid-cols-2 py-4 px-8"
            }
          >
            <div className={"flex"}>
              <Link href={"/"} prefetch={true}>
                <p className={"font-semibold flex items-center gap-1"}>
                  <Calendar
                    size={20}
                    className={"inline-block mr-2 text-black"}
                  />
                  TimeSync
                </p>
              </Link>
            </div>

            <div className={"flex gap-4 justify-end"}>
              <Link
                href="https://github.com/jonatanvm/convai-demo"
                target="_blank"
                rel="noopener noreferrer"
                className={"py-0.5"}
                aria-label="View source on GitHub"
              >
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
