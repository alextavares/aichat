import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/providers/toast-provider";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

export const metadata: Metadata = {
  title: "Inner AI Clone",
  description: "Clone da plataforma Inner AI com múltiplos provedores de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased">
        <SessionProviderWrapper>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
