import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Board — Борда идей для контента",
  description: "Предлагай темы для контента, голосуй за идеи и следи за их реализацией",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-base text-text-primary font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
