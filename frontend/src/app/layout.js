import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import AgentationDev from "@/components/AgentationDev";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "멘토링 플랫폼 MentorLink",
  description: "열정 있는 멘티와 현업 멘토를 연결하는 1:1 멘토링 플랫폼입니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-background)] min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        {process.env.NODE_ENV === "development" && <AgentationDev />}
      </body>
    </html>
  );
}
