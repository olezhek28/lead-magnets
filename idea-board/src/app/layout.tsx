import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Idea Board — Борда идей для контента | olezhek28",
  description: "Предлагай темы для контента, голосуй за идеи и следи за их реализацией",
  openGraph: {
    title: "Idea Board — Борда идей для контента",
    description: "Предлагай темы для контента, голосуй за идеи и следи за их реализацией",
    url: "https://ideas.olezhek28.courses",
    siteName: "Idea Board",
    type: "website",
  },
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
      <body className="bg-bg-base text-text-primary font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-border-light py-10">
            <div className="max-w-[1200px] mx-auto px-5 flex flex-col gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-sm text-[#707070]">&copy; 2026 Олег Козырев</span>
                <div className="flex items-center gap-4">
                  <a
                    href="https://olezhek28.courses/microservices"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#909090] hover:text-accent transition-colors"
                  >
                    Курс «Микросервисы, как в BigTech 2.0»
                  </a>
                  <a
                    href="https://olezhek28.courses/gothrough"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#909090] hover:text-accent transition-colors"
                  >
                    Курс «Go, прорвёмся!»
                  </a>
                </div>
              </div>
              <div className="text-[13px] text-[#505050] leading-relaxed">
                ИП Козырев Олег Вячеславович<br />
                ИНН 440315249608<br />
                ОГРНИП 324440000010534<br />
                Дата регистрации&nbsp;&mdash; 25.04.2024<br />
                Email&nbsp;&mdash; olezhek28.courses@gmail.com
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
