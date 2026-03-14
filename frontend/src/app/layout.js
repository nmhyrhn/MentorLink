import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "MentorLink",
  description: "멘토와 멘티를 연결하는 매칭형 멘토링 플랫폼입니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className="antialiased min-h-screen flex flex-col bg-[var(--color-background)]"
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
