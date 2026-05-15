import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { OfflineStatusBanner } from "@/components/OfflineStatusBanner";
import { SyncToast } from "@/components/SyncToast";
import { Confetti } from "@/components/ui/Confetti";
import { ClientInit } from "@/components/ClientInit";

export const metadata: Metadata = {
  title: "VidyaQuest — Level Up Your Learning",
  description:
    "A gamified STEM learning platform for students in Grades 6–12. Play quests, earn XP, unlock badges, and master Math, Science & Technology.",
  keywords: [
    "education",
    "gamification",
    "STEM",
    "learning",
    "students",
    "India",
    "quiz",
    "math",
    "science",
  ],
  manifest: "/manifest.json",
  themeColor: "#FF6B35",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>
          <ThemeProvider>
            <ClientInit />
            <OfflineBanner />
            <OfflineStatusBanner />
            <SyncToast />
            <Confetti />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
