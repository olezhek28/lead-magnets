# Idea Board MVP — План реализации

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Создать веб-приложение Idea Board (борда идей) — MVP с авторизацией через Telegram-бота, списком идей с голосованием, созданием идей с модерацией и базовой админ-панелью.

**Architecture:** Next.js 15 (App Router, Server Components) + SQLite (better-sqlite3) + Tailwind CSS v4. Авторизация через deep link в Telegram-бота + JWT. Единственный инстанс на VPS, деплой через Kamal (Docker). Без i18n в MVP — все строки на русском.

**Tech Stack:** Next.js 15, TypeScript, better-sqlite3, jose (JWT), Tailwind CSS v4, Docker, Kamal

**MVP Scope (включено):**
- US-001: Просмотр списка идей (фильтры, сортировка, поиск, пагинация)
- US-002: Авторизация через Telegram-бота
- US-003: Голосование за идеи
- US-004: Бюджет голосов
- US-005: Создание идеи (лимит 3/мес, модерация)
- US-006: Пре-модерация (админ)
- US-007: Управление статусами (админ)

**НЕ входит в MVP (Phase 2):**
- US-008: Мерж дубликатов
- US-009: Telegram-уведомления (кроме приветствия при авторизации)
- US-010: Автоархивация
- US-011: i18n (RU/EN)
- Fuzzy search похожих идей при создании
- Страница профиля пользователя

---

## Task 1: Инициализация проекта Next.js 15

**Files:**
- Create: `idea-board/package.json`
- Create: `idea-board/tsconfig.json`
- Create: `idea-board/next.config.ts`
- Create: `idea-board/tailwind.config.ts`
- Create: `idea-board/postcss.config.mjs`
- Create: `idea-board/.env.example`
- Create: `idea-board/.gitignore`
- Create: `idea-board/src/app/layout.tsx` (минимальный)
- Create: `idea-board/src/app/page.tsx` (заглушка)
- Create: `idea-board/src/app/globals.css`

**Step 1: Создать директорию и инициализировать Next.js**

```bash
cd /Users/olezhek28/Documents/repos/olezhek28.courses/lead-magnets
npx create-next-app@latest idea-board --typescript --tailwind --app --src-dir --no-eslint --no-import-alias --turbopack
```

**Step 2: Установить зависимости**

```bash
cd idea-board
npm install better-sqlite3 jose uuid
npm install -D @types/better-sqlite3 @types/uuid
```

**Step 3: Создать `.env.example`**

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
ADMIN_TELEGRAM_ID=123456789

# Auth
JWT_SECRET=random_secret_string_min_32_chars

# App
NEXT_PUBLIC_APP_URL=https://ideas.olezhek28.courses
DATABASE_PATH=./data/ideas.db
```

**Step 4: Обновить `.gitignore` — добавить**

```
data/
.env
.env.local
```

**Step 5: Настроить `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

**Step 6: Настроить `src/app/globals.css` с дизайн-токенами**

```css
@import "tailwindcss";

@theme {
  --color-bg-base: #182023;
  --color-bg-card: #22282D;
  --color-bg-card-hover: #2A3136;
  --color-accent: #DFDF41;
  --color-accent-hover: #E8E84A;
  --color-text-primary: #D1D2D3;
  --color-text-secondary: #A7A9AB;
  --color-border: #374246;
  --color-border-light: rgba(255, 255, 255, 0.05);

  --color-status-new: #6B7280;
  --color-status-planned: #3B82F6;
  --color-status-in-progress: #F59E0B;
  --color-status-done: #10B981;
  --color-status-moderation: #8B5CF6;

  --font-family-sans: "Manrope", sans-serif;

  --radius-card: 20px;
  --radius-pill: 1000px;
}
```

**Step 7: Создать минимальный layout**

```tsx
// src/app/layout.tsx
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
```

**Step 8: Заглушка главной страницы**

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Idea Board</h1>
    </main>
  );
}
```

**Step 9: Проверить запуск**

```bash
cd idea-board && npm run dev
# Открыть http://localhost:3000 — должна отобразиться страница с "Idea Board"
```

**Step 10: Коммит**

```bash
git add idea-board/
git commit -m "feat: инициализация проекта idea-board (Next.js 15 + Tailwind)"
```

---

## Task 2: База данных — схема и инициализация

**Files:**
- Create: `idea-board/migrations/001_initial.sql`
- Create: `idea-board/src/lib/db.ts`

**Step 1: Создать миграцию**

```sql
-- migrations/001_initial.sql

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    chat_id INTEGER NOT NULL,
    username TEXT,
    first_name TEXT NOT NULL,
    photo_url TEXT,
    votes_balance INTEGER NOT NULL DEFAULT 5,
    last_vote_regen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ideas_this_month INTEGER NOT NULL DEFAULT 0,
    ideas_month_reset TEXT NOT NULL DEFAULT (strftime('%Y-%m', 'now')),
    bot_started BOOLEAN NOT NULL DEFAULT 1,
    notifications_enabled BOOLEAN NOT NULL DEFAULT 1,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Идеи
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) <= 100),
    description TEXT NOT NULL CHECK(length(description) >= 30 AND length(description) <= 500),
    category TEXT NOT NULL CHECK(category IN ('youtube', 'telegram', 'course', 'tool')),
    status TEXT NOT NULL DEFAULT 'moderation' CHECK(status IN ('moderation', 'new', 'planned', 'in_progress', 'done', 'archived')),
    result_url TEXT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    merged_into_id INTEGER REFERENCES ideas(id),
    votes_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Голоса
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    idea_id INTEGER NOT NULL REFERENCES ideas(id),
    voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, idea_id)
);

-- Токены авторизации
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    telegram_id INTEGER,
    chat_id INTEGER,
    confirmed BOOLEAN NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Уведомления (лог)
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    idea_id INTEGER REFERENCES ideas(id),
    type TEXT NOT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_votes_count ON ideas(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);
CREATE INDEX IF NOT EXISTS idx_votes_user_idea ON votes(user_id, idea_id);
```

**Step 2: Создать модуль инициализации БД**

```typescript
// src/lib/db.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH || "./data/ideas.db";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runMigrations(db);

  return db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = new Set(
    db
      .prepare("SELECT name FROM _migrations")
      .all()
      .map((row: any) => row.name)
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
  }
}
```

**Step 3: Проверить — запустить dev, убедиться что `data/ideas.db` создаётся**

Добавить временный вызов в `page.tsx`:
```tsx
import { getDb } from "@/lib/db";
export default function Home() {
  const db = getDb();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return <pre>{JSON.stringify(tables, null, 2)}</pre>;
}
```

```bash
npm run dev
# Открыть http://localhost:3000 — должен показать список таблиц
```

**Step 4: Убрать временный код, коммит**

```bash
git add idea-board/migrations/ idea-board/src/lib/db.ts
git commit -m "feat: добавить SQLite схему и автоматические миграции"
```

---

## Task 3: Библиотека авторизации (JWT + middleware)

**Files:**
- Create: `idea-board/src/lib/auth.ts`
- Create: `idea-board/src/middleware.ts`

**Step 1: Создать auth.ts**

```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-32ch"
);

const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || "0");

export interface JwtPayload {
  userId: number;
  telegramId: number;
  isAdmin: boolean;
}

export async function createJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<(JwtPayload & { user: any }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload) return null;

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.userId);
  if (!user) return null;

  return { ...payload, user };
}

export function isAdminTelegramId(telegramId: number): boolean {
  return telegramId === ADMIN_TELEGRAM_ID;
}
```

**Step 2: Создать middleware (защита /admin)**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита админ-маршрутов
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyJwt(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Защита API-маршрутов, требующих авторизации
  if (
    pathname.startsWith("/api/ideas") && request.method === "POST" ||
    pathname.includes("/vote") ||
    pathname.startsWith("/api/admin")
  ) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Невалидный токен" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/ideas/:path*", "/api/admin/:path*"],
};
```

**Step 3: Коммит**

```bash
git add idea-board/src/lib/auth.ts idea-board/src/middleware.ts
git commit -m "feat: добавить JWT авторизацию и middleware"
```

---

## Task 4: Telegram-бот webhook

**Files:**
- Create: `idea-board/src/lib/telegram.ts`
- Create: `idea-board/src/app/api/bot/webhook/route.ts`

**Step 1: Хелпер для Telegram Bot API**

```typescript
// src/lib/telegram.ts
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Telegram API error:", error);
    return false;
  }
  return true;
}

export async function setWebhook(url: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }
  );
  return response.json();
}
```

**Step 2: Webhook endpoint**

```typescript
// src/app/api/bot/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { isAdminTelegramId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = body.message;

  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const telegramId = message.from.id;
  const chatId = message.chat.id;
  const username = message.from.username || null;
  const firstName = message.from.first_name || "User";
  const photoUrl = null; // Фото нельзя получить из webhook, только из getChat

  const text = message.text.trim();

  // Обработка /start auth_<token>
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const payload = parts[1] || "";

    if (payload.startsWith("auth_")) {
      const token = payload.replace("auth_", "");
      const db = getDb();

      // Проверить токен
      const authToken = db.prepare(
        "SELECT * FROM auth_tokens WHERE token = ? AND confirmed = 0 AND expires_at > datetime('now')"
      ).get(token) as any;

      if (!authToken) {
        await sendTelegramMessage(chatId, "Ссылка для авторизации устарела или уже использована. Попробуй ещё раз на сайте.");
        return NextResponse.json({ ok: true });
      }

      // Создать/обновить пользователя
      let user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId) as any;

      if (!user) {
        const isAdmin = isAdminTelegramId(telegramId);
        db.prepare(`
          INSERT INTO users (telegram_id, chat_id, username, first_name, photo_url, bot_started, is_admin)
          VALUES (?, ?, ?, ?, ?, 1, ?)
        `).run(telegramId, chatId, username, firstName, photoUrl, isAdmin ? 1 : 0);
        user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId);
      } else {
        db.prepare(
          "UPDATE users SET chat_id = ?, username = ?, first_name = ?, bot_started = 1 WHERE telegram_id = ?"
        ).run(chatId, username, firstName, telegramId);
      }

      // Подтвердить токен
      db.prepare(
        "UPDATE auth_tokens SET confirmed = 1, telegram_id = ?, chat_id = ? WHERE token = ?"
      ).run(telegramId, chatId, token);

      await sendTelegramMessage(
        chatId,
        `Авторизация прошла! Возвращайся на сайт.\n\nЯ буду присылать уведомления о твоих идеях и голосах.\n/mute — отключить уведомления`
      );

      return NextResponse.json({ ok: true });
    }

    // Обычный /start без токена
    await sendTelegramMessage(
      chatId,
      `Привет, ${firstName}! Я бот Idea Board.\n\nАвторизуйся на сайте, чтобы предлагать идеи и голосовать:\n${process.env.NEXT_PUBLIC_APP_URL || "https://ideas.olezhek28.courses"}`
    );
    return NextResponse.json({ ok: true });
  }

  // Команда /mute
  if (text === "/mute") {
    const db = getDb();
    db.prepare("UPDATE users SET notifications_enabled = 0 WHERE telegram_id = ?").run(telegramId);
    await sendTelegramMessage(chatId, "Уведомления отключены. /unmute — включить обратно.");
    return NextResponse.json({ ok: true });
  }

  // Команда /unmute
  if (text === "/unmute") {
    const db = getDb();
    db.prepare("UPDATE users SET notifications_enabled = 1 WHERE telegram_id = ?").run(telegramId);
    await sendTelegramMessage(chatId, "Уведомления включены!");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
```

**Step 3: Коммит**

```bash
git add idea-board/src/lib/telegram.ts idea-board/src/app/api/bot/
git commit -m "feat: добавить Telegram бот webhook и хелперы"
```

---

## Task 5: Auth API — init, check, logout

**Files:**
- Create: `idea-board/src/app/api/auth/init/route.ts`
- Create: `idea-board/src/app/api/auth/check/route.ts`
- Create: `idea-board/src/app/api/auth/logout/route.ts`

**Step 1: POST /api/auth/init — создать auth_token**

```typescript
// src/app/api/auth/init/route.ts
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";

export async function POST() {
  const db = getDb();
  const token = uuidv4();
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "idea_board_bot";

  // Токен живёт 5 минут
  db.prepare(
    "INSERT INTO auth_tokens (token, expires_at) VALUES (?, datetime('now', '+5 minutes'))"
  ).run(token);

  // Очистить устаревшие токены
  db.prepare("DELETE FROM auth_tokens WHERE expires_at < datetime('now')").run();

  const deepLink = `https://t.me/${botUsername}?start=auth_${token}`;

  return NextResponse.json({ token, deepLink });
}
```

**Step 2: GET /api/auth/check — polling для проверки токена**

```typescript
// src/app/api/auth/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createJwt, isAdminTelegramId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Токен не указан" }, { status: 400 });
  }

  const db = getDb();
  const authToken = db.prepare(
    "SELECT * FROM auth_tokens WHERE token = ? AND expires_at > datetime('now')"
  ).get(token) as any;

  if (!authToken) {
    return NextResponse.json({ error: "Токен не найден или истёк" }, { status: 404 });
  }

  if (!authToken.confirmed) {
    return NextResponse.json({ confirmed: false });
  }

  // Токен подтверждён — найти пользователя и выдать JWT
  const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(authToken.telegram_id) as any;
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 500 });
  }

  const jwt = await createJwt({
    userId: user.id,
    telegramId: user.telegram_id,
    isAdmin: user.is_admin === 1,
  });

  // Удалить использованный токен
  db.prepare("DELETE FROM auth_tokens WHERE token = ?").run(token);

  const response = NextResponse.json({
    confirmed: true,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      photoUrl: user.photo_url,
      votesBalance: user.votes_balance,
      isAdmin: user.is_admin === 1,
    },
  });

  response.cookies.set("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    path: "/",
  });

  return response;
}
```

**Step 3: POST /api/auth/logout**

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("auth_token");
  return response;
}
```

**Step 4: Коммит**

```bash
git add idea-board/src/app/api/auth/
git commit -m "feat: добавить API авторизации (init, check, logout)"
```

---

## Task 6: Логика бюджета голосов

**Files:**
- Create: `idea-board/src/lib/votes.ts`

**Step 1: Создать модуль**

```typescript
// src/lib/votes.ts
import { getDb } from "./db";

const INITIAL_VOTES = 5;
const MAX_VOTES = 10;
const REGEN_INTERVAL_HOURS = 24;

/**
 * Ленивая регенерация голосов.
 * Вызывается при каждом обращении к данным пользователя.
 * Если прошло >= 24ч с последней регенерации — начислить голоса.
 */
export function regenerateVotes(userId: number): void {
  const db = getDb();
  const user = db.prepare("SELECT votes_balance, last_vote_regen_at FROM users WHERE id = ?").get(userId) as any;
  if (!user) return;

  const lastRegen = new Date(user.last_vote_regen_at + "Z").getTime();
  const now = Date.now();
  const hoursPassed = (now - lastRegen) / (1000 * 60 * 60);
  const periodsElapsed = Math.floor(hoursPassed / REGEN_INTERVAL_HOURS);

  if (periodsElapsed <= 0) return;

  const newBalance = Math.min(user.votes_balance + periodsElapsed, MAX_VOTES);
  const newRegenTime = new Date(lastRegen + periodsElapsed * REGEN_INTERVAL_HOURS * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .replace("Z", "");

  db.prepare(
    "UPDATE users SET votes_balance = ?, last_vote_regen_at = ? WHERE id = ?"
  ).run(newBalance, newRegenTime, userId);
}

/**
 * Проверить и сбросить месячный лимит идей, если нужно.
 */
export function resetMonthlyIdeaLimit(userId: number): void {
  const db = getDb();
  const user = db.prepare("SELECT ideas_this_month, ideas_month_reset FROM users WHERE id = ?").get(userId) as any;
  if (!user) return;

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (user.ideas_month_reset !== currentMonth) {
    db.prepare(
      "UPDATE users SET ideas_this_month = 0, ideas_month_reset = ? WHERE id = ?"
    ).run(currentMonth, userId);
  }
}

/**
 * Получить данные пользователя с актуальным балансом.
 */
export function getUserWithBalance(userId: number) {
  regenerateVotes(userId);
  resetMonthlyIdeaLimit(userId);

  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/lib/votes.ts
git commit -m "feat: добавить логику бюджета голосов и месячного лимита идей"
```

---

## Task 7: Ideas API — GET список с фильтрами

**Files:**
- Create: `idea-board/src/app/api/ideas/route.ts`

**Step 1: GET /api/ideas — список идей**

```typescript
// src/app/api/ideas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sort = searchParams.get("sort") || "popular"; // popular | trending | new
  const category = searchParams.get("category"); // youtube | telegram | course | tool
  const status = searchParams.get("status"); // new | planned | in_progress | done
  const search = searchParams.get("q") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const db = getDb();

  // Получить текущего пользователя (если авторизован) для отметки голосов
  let currentUserId: number | null = null;
  const token = request.cookies.get("auth_token")?.value;
  if (token) {
    const payload = await verifyJwt(token);
    if (payload) currentUserId = payload.userId;
  }

  // Строим запрос
  const conditions: string[] = ["i.status NOT IN ('moderation', 'archived')", "i.merged_into_id IS NULL"];
  const params: any[] = [];

  if (category) {
    conditions.push("i.category = ?");
    params.push(category);
  }

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(i.title LIKE ? OR i.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Сортировка
  let orderBy = "i.votes_count DESC, i.created_at DESC";
  let joinClause = "";

  if (sort === "trending") {
    joinClause = `
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as recent_votes
        FROM votes
        WHERE voted_at > datetime('now', '-7 days')
        GROUP BY idea_id
      ) rv ON rv.idea_id = i.id
    `;
    orderBy = "COALESCE(rv.recent_votes, 0) DESC, i.votes_count DESC";
  } else if (sort === "new") {
    orderBy = "i.created_at DESC";
  }

  // Подзапрос для голоса текущего пользователя
  const voteSelect = currentUserId
    ? `, (SELECT 1 FROM votes WHERE user_id = ? AND idea_id = i.id) as user_voted`
    : `, 0 as user_voted`;
  const voteParams = currentUserId ? [currentUserId] : [];

  // Основной запрос
  const countSql = `SELECT COUNT(*) as total FROM ideas i ${where}`;
  const total = (db.prepare(countSql).get(...params) as any).total;

  const sql = `
    SELECT i.*, u.username as author_username, u.first_name as author_name
    ${voteSelect}
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    ${joinClause}
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const ideas = db.prepare(sql).all(...voteParams, ...params, limit, offset);

  return NextResponse.json({
    ideas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/app/api/ideas/route.ts
git commit -m "feat: добавить API списка идей с фильтрами и сортировкой"
```

---

## Task 8: Ideas API — POST создание + PATCH обновление

**Files:**
- Modify: `idea-board/src/app/api/ideas/route.ts` (добавить POST)
- Create: `idea-board/src/app/api/ideas/[id]/route.ts`

**Step 1: POST /api/ideas — создание идеи**

Добавить в `src/app/api/ideas/route.ts`:

```typescript
import { getCurrentUser } from "@/lib/auth";
import { getUserWithBalance } from "@/lib/votes";

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const user = getUserWithBalance(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  // Проверить месячный лимит
  if (user.ideas_this_month >= 3) {
    return NextResponse.json({
      error: "Вы исчерпали лимит идей в этом месяце (3/3). Новые идеи можно предлагать с 1-го числа следующего месяца",
    }, { status: 429 });
  }

  const body = await request.json();
  const { title, description, category } = body;

  // Валидация
  if (!title || title.length > 100) {
    return NextResponse.json({ error: "Заголовок обязателен (макс. 100 символов)" }, { status: 400 });
  }
  if (!description || description.length < 30 || description.length > 500) {
    return NextResponse.json({ error: "Описание обязательно (30-500 символов)" }, { status: 400 });
  }
  const validCategories = ["youtube", "telegram", "course", "tool"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Невалидная категория" }, { status: 400 });
  }

  const db = getDb();

  const result = db.prepare(`
    INSERT INTO ideas (title, description, category, author_id, status)
    VALUES (?, ?, ?, ?, 'moderation')
  `).run(title.trim(), description.trim(), category, session.userId);

  // Увеличить счётчик идей за месяц
  db.prepare(
    "UPDATE users SET ideas_this_month = ideas_this_month + 1 WHERE id = ?"
  ).run(session.userId);

  const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(result.lastInsertRowid);

  return NextResponse.json({ idea }, { status: 201 });
}
```

**Step 2: PATCH/DELETE /api/ideas/[id] — обновление и удаление (админ)**

```typescript
// src/app/api/ideas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const db = getDb();

  const idea = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id) as any;
  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
  }

  const { status, title, description, result_url } = body;

  // Если переводим в "done" — обязателен result_url
  if (status === "done" && !result_url && !idea.result_url) {
    return NextResponse.json({ error: "Для статуса 'Сделано' обязательна ссылка на результат" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (status) { updates.push("status = ?"); values.push(status); }
  if (title) { updates.push("title = ?"); values.push(title); }
  if (description) { updates.push("description = ?"); values.push(description); }
  if (result_url !== undefined) { updates.push("result_url = ?"); values.push(result_url); }

  updates.push("updated_at = datetime('now')");

  db.prepare(`UPDATE ideas SET ${updates.join(", ")} WHERE id = ?`).run(...values, id);

  const updated = db.prepare("SELECT * FROM ideas WHERE id = ?").get(id);
  return NextResponse.json({ idea: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();

  // Удалить голоса, затем идею
  db.prepare("DELETE FROM votes WHERE idea_id = ?").run(id);
  db.prepare("DELETE FROM ideas WHERE id = ?").run(id);

  return NextResponse.json({ ok: true });
}
```

**Step 3: Коммит**

```bash
git add idea-board/src/app/api/ideas/
git commit -m "feat: добавить создание, обновление и удаление идей"
```

---

## Task 9: Vote API — голосование

**Files:**
- Create: `idea-board/src/app/api/ideas/[id]/vote/route.ts`

**Step 1: POST /api/ideas/[id]/vote — проголосовать, DELETE — снять голос**

```typescript
// src/app/api/ideas/[id]/vote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUserWithBalance } from "@/lib/votes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const user = getUserWithBalance(session.userId);

  // Проверить что идея существует и доступна для голосования
  const idea = db.prepare(
    "SELECT * FROM ideas WHERE id = ? AND status NOT IN ('moderation', 'archived') AND merged_into_id IS NULL"
  ).get(id) as any;

  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена" }, { status: 404 });
  }

  // Проверить что пользователь ещё не голосовал
  const existingVote = db.prepare(
    "SELECT * FROM votes WHERE user_id = ? AND idea_id = ?"
  ).get(session.userId, id);

  if (existingVote) {
    return NextResponse.json({ error: "Вы уже голосовали за эту идею" }, { status: 409 });
  }

  // Проверить баланс голосов
  if (user.votes_balance <= 0) {
    return NextResponse.json({ error: "У вас закончились голоса. Голоса восстанавливаются каждые 24 часа" }, { status: 429 });
  }

  // Транзакция: создать голос + обновить счётчики
  const transaction = db.transaction(() => {
    db.prepare("INSERT INTO votes (user_id, idea_id) VALUES (?, ?)").run(session.userId, id);
    db.prepare("UPDATE ideas SET votes_count = votes_count + 1 WHERE id = ?").run(id);
    db.prepare("UPDATE users SET votes_balance = votes_balance - 1 WHERE id = ?").run(session.userId);
  });

  transaction();

  const updatedUser = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;
  const updatedIdea = db.prepare("SELECT votes_count FROM ideas WHERE id = ?").get(id) as any;

  return NextResponse.json({
    votesCount: updatedIdea.votes_count,
    votesBalance: updatedUser.votes_balance,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const existingVote = db.prepare(
    "SELECT * FROM votes WHERE user_id = ? AND idea_id = ?"
  ).get(session.userId, id);

  if (!existingVote) {
    return NextResponse.json({ error: "Вы не голосовали за эту идею" }, { status: 404 });
  }

  const MAX_VOTES = 10;
  const user = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;

  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM votes WHERE user_id = ? AND idea_id = ?").run(session.userId, id);
    db.prepare("UPDATE ideas SET votes_count = votes_count - 1 WHERE id = ?").run(id);
    if (user.votes_balance < MAX_VOTES) {
      db.prepare("UPDATE users SET votes_balance = MIN(votes_balance + 1, ?) WHERE id = ?").run(MAX_VOTES, session.userId);
    }
  });

  transaction();

  const updatedUser = db.prepare("SELECT votes_balance FROM users WHERE id = ?").get(session.userId) as any;
  const updatedIdea = db.prepare("SELECT votes_count FROM ideas WHERE id = ?").get(id) as any;

  return NextResponse.json({
    votesCount: updatedIdea.votes_count,
    votesBalance: updatedUser.votes_balance,
  });
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/app/api/ideas/[id]/vote/
git commit -m "feat: добавить API голосования с бюджетом"
```

---

## Task 10: Admin API — модерация

**Files:**
- Create: `idea-board/src/app/api/admin/moderate/route.ts`
- Create: `idea-board/src/app/api/admin/ideas/route.ts`

**Step 1: POST /api/admin/moderate — одобрить/отклонить идею**

```typescript
// src/app/api/admin/moderate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const { ideaId, action, title, description } = await request.json();
  // action: "approve" | "reject" | "edit_approve"

  const db = getDb();
  const idea = db.prepare("SELECT * FROM ideas WHERE id = ? AND status = 'moderation'").get(ideaId) as any;

  if (!idea) {
    return NextResponse.json({ error: "Идея не найдена или уже обработана" }, { status: 404 });
  }

  if (action === "approve") {
    db.prepare("UPDATE ideas SET status = 'new', updated_at = datetime('now') WHERE id = ?").run(ideaId);
  } else if (action === "reject") {
    db.prepare("DELETE FROM ideas WHERE id = ?").run(ideaId);
    // Вернуть лимит идей автору
    db.prepare("UPDATE users SET ideas_this_month = MAX(0, ideas_this_month - 1) WHERE id = ?").run(idea.author_id);
  } else if (action === "edit_approve") {
    if (!title || !description) {
      return NextResponse.json({ error: "Укажите заголовок и описание" }, { status: 400 });
    }
    db.prepare(
      "UPDATE ideas SET status = 'new', title = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(title, description, ideaId);
  } else {
    return NextResponse.json({ error: "Невалидное действие" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
```

**Step 2: GET /api/admin/ideas — все идеи для админки (включая модерацию)**

```typescript
// src/app/api/admin/ideas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") || "moderation";
  const db = getDb();

  const ideas = db.prepare(`
    SELECT i.*, u.username as author_username, u.first_name as author_name
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    WHERE i.status = ?
    ORDER BY i.created_at DESC
  `).all(status);

  // Статистика для дашборда
  const stats = {
    totalIdeas: (db.prepare("SELECT COUNT(*) as c FROM ideas WHERE status != 'moderation'").get() as any).c,
    totalUsers: (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c,
    totalVotes: (db.prepare("SELECT COUNT(*) as c FROM votes").get() as any).c,
    pendingModeration: (db.prepare("SELECT COUNT(*) as c FROM ideas WHERE status = 'moderation'").get() as any).c,
  };

  return NextResponse.json({ ideas, stats });
}
```

**Step 3: Коммит**

```bash
git add idea-board/src/app/api/admin/
git commit -m "feat: добавить API админ-панели (модерация, статистика)"
```

---

## Task 11: API пользователя — данные сессии

**Files:**
- Create: `idea-board/src/app/api/auth/me/route.ts`

**Step 1: GET /api/auth/me — текущий пользователь**

```typescript
// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserWithBalance } from "@/lib/votes";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = getUserWithBalance(session.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Получить количество отданных голосов
  const { getDb } = await import("@/lib/db");
  const db = getDb();
  const votesGiven = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE user_id = ?").get(session.userId) as any).c;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      photoUrl: user.photo_url,
      votesBalance: user.votes_balance,
      votesGiven,
      ideasThisMonth: user.ideas_this_month,
      isAdmin: user.is_admin === 1,
      lastVoteRegenAt: user.last_vote_regen_at,
    },
  });
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/app/api/auth/me/
git commit -m "feat: добавить endpoint данных текущего пользователя"
```

---

## Task 12: UI — Header и общий Layout

**Files:**
- Create: `idea-board/src/components/header.tsx`
- Create: `idea-board/src/components/telegram-auth.tsx`
- Modify: `idea-board/src/app/layout.tsx`

**Step 1: Создать контекст авторизации**

```typescript
// src/components/auth-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  id: number;
  username: string | null;
  firstName: string;
  photoUrl: string | null;
  votesBalance: number;
  votesGiven: number;
  ideasThisMonth: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Step 2: Компонент авторизации через Telegram**

```tsx
// src/components/telegram-auth.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";

export function TelegramAuth() {
  const { refreshUser } = useAuth();
  const [state, setState] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [deepLink, setDeepLink] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAuth = async () => {
    try {
      const res = await fetch("/api/auth/init", { method: "POST" });
      const data = await res.json();
      setDeepLink(data.deepLink);
      setState("waiting");

      // Открыть Telegram
      window.open(data.deepLink, "_blank");

      // Polling каждые 2 секунды
      pollingRef.current = setInterval(async () => {
        try {
          const checkRes = await fetch(`/api/auth/check?token=${data.token}`);
          const checkData = await checkRes.json();

          if (checkData.confirmed) {
            clearInterval(pollingRef.current!);
            clearTimeout(timeoutRef.current!);
            setState("success");
            await refreshUser();
          }
        } catch {}
      }, 2000);

      // Таймаут 2 минуты
      timeoutRef.current = setTimeout(() => {
        clearInterval(pollingRef.current!);
        setState("error");
      }, 120000);
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (state === "waiting") {
    return (
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-text-secondary">
          <p>Перейди в Telegram и нажми "Start"</p>
          <a href={deepLink} target="_blank" rel="noopener" className="text-accent hover:underline text-xs">
            Открыть бота повторно
          </a>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-red-400">Время истекло</p>
        <button
          onClick={() => { setState("idle"); startAuth(); }}
          className="text-accent text-sm hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startAuth}
      className="flex items-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white px-4 py-2 rounded-[1000px] text-sm font-semibold transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      Войти через Telegram
    </button>
  );
}
```

**Step 3: Компонент Header**

```tsx
// src/components/header.tsx
"use client";

import { useAuth } from "./auth-provider";
import { TelegramAuth } from "./telegram-auth";

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-base/80 border-b border-border-light">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
        {/* Логотип */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-accent font-bold text-xl">IB</span>
          <span className="font-semibold text-lg hidden sm:inline">Idea Board</span>
        </a>

        {/* Правая часть */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-32 h-9 bg-bg-card rounded-[1000px] animate-pulse" />
          ) : user ? (
            <>
              {/* Баланс голосов */}
              <div className="flex items-center gap-1.5 bg-bg-card px-3 py-1.5 rounded-[1000px] text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span className="text-text-secondary">{user.votesBalance}/10</span>
              </div>

              {/* Профиль */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary hidden sm:inline">
                  {user.firstName}
                </span>
                {user.isAdmin && (
                  <a
                    href="/admin"
                    className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-[1000px]"
                  >
                    Админ
                  </a>
                )}
                <button
                  onClick={logout}
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <TelegramAuth />
          )}
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Обновить layout.tsx**

```tsx
// src/app/layout.tsx
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
      <body className="bg-bg-base text-text-primary font-sans min-h-screen">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Step 5: Коммит**

```bash
git add idea-board/src/components/ idea-board/src/app/layout.tsx
git commit -m "feat: добавить header, авторизацию через Telegram и AuthProvider"
```

---

## Task 13: UI — Компоненты карточки идеи и голосования

**Files:**
- Create: `idea-board/src/components/vote-button.tsx`
- Create: `idea-board/src/components/idea-card.tsx`
- Create: `idea-board/src/components/status-badge.tsx`
- Create: `idea-board/src/components/category-badge.tsx`

**Step 1: Бейджи статусов и категорий**

```tsx
// src/components/status-badge.tsx
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-status-new" },
  planned: { label: "В планах", color: "bg-status-planned" },
  in_progress: { label: "В работе", color: "bg-status-in-progress" },
  done: { label: "Сделано", color: "bg-status-done" },
  moderation: { label: "На модерации", color: "bg-status-moderation" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-500" };
  return (
    <span className={`${s.color} text-white text-xs font-semibold px-2.5 py-0.5 rounded-[1000px]`}>
      {s.label}
    </span>
  );
}
```

```tsx
// src/components/category-badge.tsx
const CATEGORY_MAP: Record<string, string> = {
  youtube: "YouTube",
  telegram: "Telegram",
  course: "Курс",
  tool: "Инструмент",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-text-secondary text-xs border border-border px-2 py-0.5 rounded-[1000px]">
      {CATEGORY_MAP[category] || category}
    </span>
  );
}
```

**Step 2: Кнопка голосования**

```tsx
// src/components/vote-button.tsx
"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

interface Props {
  ideaId: number;
  votesCount: number;
  userVoted: boolean;
  onVoteChange?: (newCount: number, newBalance: number) => void;
}

export function VoteButton({ ideaId, votesCount: initialCount, userVoted: initialVoted, onVoteChange }: Props) {
  const { user, refreshUser } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleVote = async () => {
    if (!user || loading) return;

    setLoading(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const method = voted ? "DELETE" : "POST";
      const res = await fetch(`/api/ideas/${ideaId}/vote`, { method });

      if (res.ok) {
        const data = await res.json();
        setCount(data.votesCount);
        setVoted(!voted);
        refreshUser();
        onVoteChange?.(data.votesCount, data.votesBalance);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const disabled = !user || (user.votesBalance <= 0 && !voted);

  return (
    <button
      onClick={handleVote}
      disabled={disabled || loading}
      title={!user ? "Войдите, чтобы голосовать" : disabled ? "У вас закончились голоса" : voted ? "Снять голос" : "Проголосовать"}
      className={`
        flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all
        ${voted
          ? "bg-accent/20 text-accent border border-accent/30"
          : "bg-bg-card border border-border hover:border-accent/30"
        }
        ${disabled && !voted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${animating ? "scale-110" : "scale-100"}
      `}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={voted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="transition-transform"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      <span className="text-sm font-bold">{count}</span>
    </button>
  );
}
```

**Step 3: Карточка идеи**

```tsx
// src/components/idea-card.tsx
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { VoteButton } from "./vote-button";

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  user_voted: number | null;
  author_username: string | null;
  author_name: string;
  created_at: string;
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const date = new Date(idea.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex gap-4 bg-bg-card border border-border rounded-[20px] p-5 hover:border-border/80 transition-colors">
      {/* Голосование */}
      <VoteButton
        ideaId={idea.id}
        votesCount={idea.votes_count}
        userVoted={!!idea.user_voted}
      />

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <StatusBadge status={idea.status} />
          <CategoryBadge category={idea.category} />
        </div>

        <h3 className="text-lg font-bold mb-1 text-white">{idea.title}</h3>
        <p className="text-text-secondary text-sm mb-3 line-clamp-2">{idea.description}</p>

        {/* Ссылка на результат */}
        {idea.status === "done" && idea.result_url && (
          <a
            href={idea.result_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent text-sm hover:underline mb-3"
          >
            Смотреть результат &rarr;
          </a>
        )}

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>@{idea.author_username || idea.author_name}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Коммит**

```bash
git add idea-board/src/components/
git commit -m "feat: добавить компоненты карточки идеи, голосования и бейджей"
```

---

## Task 14: UI — Фильтры и поиск

**Files:**
- Create: `idea-board/src/components/filters.tsx`

**Step 1: Компонент фильтров**

```tsx
// src/components/filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const SORTS = [
  { value: "popular", label: "Популярное" },
  { value: "trending", label: "Трендовое" },
  { value: "new", label: "Новое" },
];

const CATEGORIES = [
  { value: "", label: "Все" },
  { value: "youtube", label: "YouTube" },
  { value: "telegram", label: "Telegram" },
  { value: "course", label: "Курс" },
  { value: "tool", label: "Инструмент" },
];

const STATUSES = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "planned", label: "В планах" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Сделано" },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const currentSort = searchParams.get("sort") || "popular";
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Сбросить страницу при смене фильтра
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("q", search);
  };

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск идей..."
          className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 pl-10 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </form>

      {/* Сортировка */}
      <div className="flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => updateParams("sort", s.value === "popular" ? "" : s.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-sm font-medium transition-colors ${
              currentSort === s.value
                ? "bg-accent text-bg-base"
                : "bg-bg-card text-text-secondary border border-border hover:border-accent/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Категория + Статус */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => updateParams("category", c.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-xs font-medium transition-colors ${
              currentCategory === c.value
                ? "bg-white/10 text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="text-border mx-1">|</span>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => updateParams("status", s.value)}
            className={`px-3 py-1.5 rounded-[1000px] text-xs font-medium transition-colors ${
              currentStatus === s.value
                ? "bg-white/10 text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/components/filters.tsx
git commit -m "feat: добавить компонент фильтров и поиска"
```

---

## Task 15: UI — Форма создания идеи

**Files:**
- Create: `idea-board/src/components/idea-form.tsx`

**Step 1: Форма создания идеи**

```tsx
// src/components/idea-form.tsx
"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

const CATEGORIES = [
  { value: "youtube", label: "YouTube" },
  { value: "telegram", label: "Telegram" },
  { value: "course", label: "Курс" },
  { value: "tool", label: "Инструмент" },
];

export function IdeaForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("youtube");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const ideasLeft = 3 - (user.ideasThisMonth || 0);
  const canCreate = ideasLeft > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        onCreated?.();
      }, 2000);
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={!canCreate}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-[1000px] font-semibold text-sm transition-colors ${
          canCreate
            ? "bg-accent text-bg-base hover:bg-accent-hover"
            : "bg-bg-card text-text-secondary cursor-not-allowed"
        }`}
        title={!canCreate ? `Лимит идей исчерпан (3/3). Новые идеи с 1-го числа` : undefined}
      >
        + Предложить идею
        <span className="text-xs opacity-70">({ideasLeft}/3)</span>
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-bg-card border border-status-done/30 rounded-[20px] p-6 text-center">
        <p className="text-status-done font-semibold">Идея отправлена на модерацию!</p>
        <p className="text-text-secondary text-sm mt-1">Ты получишь уведомление, когда она будет опубликована</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-[20px] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Предложить идею</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary">
          &times;
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-1">Заголовок</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="Тема для видео, поста или курса"
          className="w-full bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50"
        />
        <span className="text-xs text-text-secondary mt-1 block text-right">{title.length}/100</span>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Почему это важно?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={30}
          maxLength={500}
          required
          rows={3}
          placeholder="Опиши, почему тебе это интересно и чему ты хочешь научиться (мин. 30 символов)"
          className="w-full bg-bg-base border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 resize-none"
        />
        <span className={`text-xs mt-1 block text-right ${description.length < 30 ? "text-red-400" : "text-text-secondary"}`}>
          {description.length}/500 {description.length < 30 && `(мин. ${30 - description.length})`}
        </span>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1">Категория</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-[1000px] text-sm transition-colors ${
                category === c.value
                  ? "bg-accent text-bg-base font-semibold"
                  : "bg-bg-base border border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || title.length === 0 || description.length < 30}
        className="w-full bg-accent text-bg-base font-semibold py-3 rounded-[1000px] hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Отправляю..." : "Отправить на модерацию"}
      </button>
    </form>
  );
}
```

**Step 2: Коммит**

```bash
git add idea-board/src/components/idea-form.tsx
git commit -m "feat: добавить форму создания идеи с валидацией и лимитами"
```

---

## Task 16: UI — Главная страница (список идей)

**Files:**
- Modify: `idea-board/src/app/page.tsx`

**Step 1: Главная страница — собрать все компоненты**

```tsx
// src/app/page.tsx
import { Suspense } from "react";
import { IdeasList } from "@/components/ideas-list";
import { Filters } from "@/components/filters";
import { IdeaFormWrapper } from "@/components/idea-form-wrapper";

export default function Home() {
  return (
    <main className="max-w-[1200px] mx-auto px-5 py-8">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Борда идей</h1>
          <p className="text-text-secondary mt-1">
            Предлагай темы для контента и голосуй за то, что хочешь видеть
          </p>
        </div>
        <IdeaFormWrapper />
      </div>

      {/* Фильтры */}
      <Suspense fallback={null}>
        <Filters />
      </Suspense>

      {/* Список идей */}
      <div className="mt-6">
        <Suspense fallback={<IdeasSkeleton />}>
          <IdeasList />
        </Suspense>
      </div>
    </main>
  );
}

function IdeasSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-bg-card border border-border rounded-[20px] p-5 h-32 animate-pulse" />
      ))}
    </div>
  );
}
```

**Step 2: Создать IdeasList (клиентский компонент с загрузкой данных)**

```tsx
// src/components/ideas-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IdeaCard } from "./idea-card";

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  user_voted: number | null;
  author_username: string | null;
  author_name: string;
  created_at: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export function IdeasList() {
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/ideas?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data.ideas);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-card border border-border rounded-[20px] p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-lg">Идей пока нет</p>
        <p className="text-text-secondary text-sm mt-1">Будь первым — предложи тему!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`/?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page) }).toString()}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                page === pagination.page
                  ? "bg-accent text-bg-base"
                  : "bg-bg-card text-text-secondary border border-border hover:border-accent/30"
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
```

**Step 3: Обёртка для формы создания (client component)**

```tsx
// src/components/idea-form-wrapper.tsx
"use client";

import { IdeaForm } from "./idea-form";
import { useRouter } from "next/navigation";

export function IdeaFormWrapper() {
  const router = useRouter();
  return <IdeaForm onCreated={() => router.refresh()} />;
}
```

**Step 4: Коммит**

```bash
git add idea-board/src/app/page.tsx idea-board/src/components/ideas-list.tsx idea-board/src/components/idea-form-wrapper.tsx
git commit -m "feat: добавить главную страницу со списком идей и пагинацией"
```

---

## Task 17: UI — Админ-панель

**Files:**
- Create: `idea-board/src/app/admin/page.tsx`
- Create: `idea-board/src/components/admin/moderation-queue.tsx`
- Create: `idea-board/src/components/admin/idea-manager.tsx`
- Create: `idea-board/src/components/admin/dashboard-stats.tsx`

**Step 1: Страница админки**

```tsx
// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { IdeaManager } from "@/components/admin/idea-manager";
import { DashboardStats } from "@/components/admin/dashboard-stats";

const TABS = [
  { id: "moderation", label: "Модерация" },
  { id: "ideas", label: "Все идеи" },
  { id: "stats", label: "Статистика" },
];

export default function AdminPage() {
  const [tab, setTab] = useState("moderation");

  return (
    <main className="max-w-[1200px] mx-auto px-5 py-8">
      <h1 className="text-3xl font-extrabold text-white mb-6">Админ-панель</h1>

      {/* Табы */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-[1000px] text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-accent text-bg-base"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "moderation" && <ModerationQueue />}
      {tab === "ideas" && <IdeaManager />}
      {tab === "stats" && <DashboardStats />}
    </main>
  );
}
```

**Step 2: Очередь модерации**

```tsx
// src/components/admin/moderation-queue.tsx
"use client";

import { useState, useEffect } from "react";
import { CategoryBadge } from "../category-badge";

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  author_username: string | null;
  author_name: string;
  created_at: string;
}

export function ModerationQueue() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchIdeas = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ideas?status=moderation");
    const data = await res.json();
    setIdeas(data.ideas);
    setLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, []);

  const moderate = async (ideaId: number, action: string, title?: string, description?: string) => {
    await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId, action, title, description }),
    });
    setEditingId(null);
    fetchIdeas();
  };

  if (loading) return <div className="text-text-secondary">Загрузка...</div>;

  if (ideas.length === 0) {
    return <div className="text-text-secondary text-center py-10">Нет идей на модерации</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm mb-2">Идей в очереди: {ideas.length}</p>
      {ideas.map((idea) => (
        <div key={idea.id} className="bg-bg-card border border-border rounded-[20px] p-5">
          {editingId === idea.id ? (
            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent/50"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-bg-base border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => moderate(idea.id, "edit_approve", editTitle, editDescription)}
                  className="bg-status-done text-white px-4 py-2 rounded-[1000px] text-sm font-medium"
                >
                  Сохранить и одобрить
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-text-secondary text-sm hover:text-text-primary"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryBadge category={idea.category} />
                    <span className="text-xs text-text-secondary">
                      @{idea.author_username || idea.author_name}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {new Date(idea.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{idea.title}</h3>
                  <p className="text-text-secondary text-sm">{idea.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => moderate(idea.id, "approve")}
                  className="bg-status-done text-white px-4 py-2 rounded-[1000px] text-sm font-medium"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => {
                    setEditingId(idea.id);
                    setEditTitle(idea.title);
                    setEditDescription(idea.description);
                  }}
                  className="bg-status-planned text-white px-4 py-2 rounded-[1000px] text-sm font-medium"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => moderate(idea.id, "reject")}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-[1000px] text-sm font-medium"
                >
                  Отклонить
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Менеджер идей (управление статусами)**

```tsx
// src/components/admin/idea-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "../status-badge";
import { CategoryBadge } from "../category-badge";

const STATUSES = ["new", "planned", "in_progress", "done"];

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  author_username: string | null;
  author_name: string;
}

export function IdeaManager() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("new");
  const [resultUrl, setResultUrl] = useState("");
  const [changingId, setChangingId] = useState<number | null>(null);

  const fetchIdeas = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/ideas?status=${filterStatus}`);
    const data = await res.json();
    setIdeas(data.ideas);
    setLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, [filterStatus]);

  const changeStatus = async (ideaId: number, newStatus: string, url?: string) => {
    await fetch(`/api/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, result_url: url }),
    });
    setChangingId(null);
    setResultUrl("");
    fetchIdeas();
  };

  const deleteIdea = async (ideaId: number) => {
    if (!confirm("Удалить идею безвозвратно?")) return;
    await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
    fetchIdeas();
  };

  return (
    <div>
      {/* Фильтр по статусу */}
      <div className="flex gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-[1000px] text-xs font-medium transition-colors ${
              filterStatus === s ? "bg-white/10 text-white" : "text-text-secondary"
            }`}
          >
            <StatusBadge status={s} />
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-text-secondary">Загрузка...</div>
      ) : ideas.length === 0 ? (
        <div className="text-text-secondary text-center py-10">Нет идей с таким статусом</div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-bg-card border border-border rounded-[20px] p-4 flex items-center gap-4">
              <div className="text-center min-w-[50px]">
                <div className="text-accent font-bold text-lg">{idea.votes_count}</div>
                <div className="text-text-secondary text-xs">голосов</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <StatusBadge status={idea.status} />
                  <CategoryBadge category={idea.category} />
                </div>
                <h4 className="font-semibold text-white truncate">{idea.title}</h4>
                <span className="text-xs text-text-secondary">@{idea.author_username || idea.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Кнопки смены статуса */}
                {idea.status !== "done" && (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "done") {
                        setChangingId(idea.id);
                      } else {
                        changeStatus(idea.id, val);
                      }
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="bg-bg-base border border-border rounded-xl px-2 py-1.5 text-sm text-text-secondary"
                  >
                    <option value="" disabled>Статус →</option>
                    {STATUSES.filter((s) => s !== idea.status).map((s) => (
                      <option key={s} value={s}>{s === "new" ? "Новая" : s === "planned" ? "В планах" : s === "in_progress" ? "В работе" : "Сделано"}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Удалить
                </button>
              </div>

              {/* Поле URL при переводе в "Сделано" */}
              {changingId === idea.id && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={resultUrl}
                    onChange={(e) => setResultUrl(e.target.value)}
                    placeholder="Ссылка на результат (обязательно)"
                    className="flex-1 bg-bg-base border border-border rounded-xl px-3 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => changeStatus(idea.id, "done", resultUrl)}
                    disabled={!resultUrl}
                    className="bg-status-done text-white px-3 py-1.5 rounded-[1000px] text-sm disabled:opacity-50"
                  >
                    Готово
                  </button>
                  <button
                    onClick={() => { setChangingId(null); setResultUrl(""); }}
                    className="text-text-secondary text-sm"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Дашборд статистики**

```tsx
// src/components/admin/dashboard-stats.tsx
"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalIdeas: number;
  totalUsers: number;
  totalVotes: number;
  pendingModeration: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/ideas?status=new")
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  if (!stats) return <div className="text-text-secondary">Загрузка...</div>;

  const items = [
    { label: "Идей", value: stats.totalIdeas, color: "text-accent" },
    { label: "Пользователей", value: stats.totalUsers, color: "text-status-planned" },
    { label: "Голосов", value: stats.totalVotes, color: "text-status-done" },
    { label: "На модерации", value: stats.pendingModeration, color: "text-status-moderation" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-bg-card border border-border rounded-[20px] p-5 text-center">
          <div className={`text-3xl font-extrabold ${item.color}`}>{item.value}</div>
          <div className="text-text-secondary text-sm mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
```

**Step 5: Коммит**

```bash
git add idea-board/src/app/admin/ idea-board/src/components/admin/
git commit -m "feat: добавить админ-панель (модерация, управление статусами, статистика)"
```

---

## Task 18: Deployment — Dockerfile и Kamal

**Files:**
- Create: `idea-board/Dockerfile`
- Create: `idea-board/config/deploy.yml`
- Create: `idea-board/.dockerignore`

**Step 1: Dockerfile**

```dockerfile
# idea-board/Dockerfile
FROM node:20-alpine AS base

# --- Deps ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/migrations ./migrations

RUN mkdir -p data && chown nextjs:nodejs data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Обновить next.config.ts для standalone**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

**Step 3: .dockerignore**

```
node_modules
.next
data
.env
.env.local
.git
```

**Step 4: Kamal deploy config**

```yaml
# config/deploy.yml
service: idea-board

image: olezhek28/idea-board

servers:
  web:
    hosts:
      - YOUR_VPS_IP
    labels:
      traefik.http.routers.idea-board.rule: Host(`ideas.olezhek28.courses`)
      traefik.http.routers.idea-board.tls: true
      traefik.http.routers.idea-board.tls.certresolver: letsencrypt

volumes:
  - "idea-board-data:/app/data"

registry:
  server: ghcr.io
  username: olezhek28
  password:
    - KAMAL_REGISTRY_PASSWORD

env:
  secret:
    - TELEGRAM_BOT_TOKEN
    - JWT_SECRET
    - ADMIN_TELEGRAM_ID
  clear:
    TELEGRAM_BOT_USERNAME: idea_board_olezhek28_bot
    NEXT_PUBLIC_APP_URL: https://ideas.olezhek28.courses
    DATABASE_PATH: /app/data/ideas.db

builder:
  arch: amd64

traefik:
  options:
    publish:
      - "443:443"
    volume:
      - "letsencrypt:/letsencrypt"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    certificatesResolvers.letsencrypt.acme.email: "olezhek28@gmail.com"
    certificatesResolvers.letsencrypt.acme.storage: "/letsencrypt/acme.json"
    certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint: "web"
```

**Step 5: Коммит**

```bash
git add idea-board/Dockerfile idea-board/.dockerignore idea-board/config/ idea-board/next.config.ts
git commit -m "feat: добавить Dockerfile и Kamal deploy конфигурацию"
```

---

## Порядок выполнения и зависимости

```
Task 1  (проект) ─── блокирует всё остальное
  ├── Task 2  (БД) ─── блокирует Task 3-11
  │     ├── Task 3  (auth lib) ─── блокирует Task 4, 5, 8-10
  │     │     ├── Task 4  (bot webhook)
  │     │     ├── Task 5  (auth API)
  │     │     ├── Task 8  (ideas create/update)
  │     │     ├── Task 9  (vote API)
  │     │     └── Task 10 (admin API)
  │     ├── Task 6  (votes lib) ─── блокирует Task 9, 11
  │     ├── Task 7  (ideas GET)
  │     └── Task 11 (user API)
  │
  ├── Task 12 (header/layout) ─── блокирует Task 13-17
  │     ├── Task 13 (карточки) ─── блокирует Task 16
  │     ├── Task 14 (фильтры) ─── блокирует Task 16
  │     ├── Task 15 (форма) ─── блокирует Task 16
  │     ├── Task 16 (главная страница)
  │     └── Task 17 (админка)
  │
  └── Task 18 (деплой) — независимый, можно параллельно
```

**Параллельные группы для subagent-driven:**
- **Группа A (Backend):** Task 1 → 2 → 3 → [4, 5, 6] → [7, 8, 9, 10, 11]
- **Группа B (Frontend):** Task 12 → [13, 14, 15] → 16 → 17
- **Группа C (Deploy):** Task 18

---

## Проверки после реализации

1. **Авторизация:** Открыть сайт → "Войти через Telegram" → перейти в бота → /start → вернуться на сайт → видно имя + баланс голосов
2. **Создание идеи:** Нажать "Предложить идею" → заполнить форму → отправить → видно "На модерации"
3. **Модерация:** Зайти в /admin → вкладка "Модерация" → одобрить идею → она появляется в общем списке
4. **Голосование:** Нажать стрелку вверх → счётчик +1, баланс -1 → нажать снова → счётчик -1, баланс +1
5. **Фильтры:** Переключить сортировку, категорию, статус → список обновляется
6. **Поиск:** Ввести текст → показываются только совпадения
7. **Управление статусами:** В админке сменить статус → на карточке обновился бейдж
8. **Адаптив:** Проверить на 960px и 640px ширине
