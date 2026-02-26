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
