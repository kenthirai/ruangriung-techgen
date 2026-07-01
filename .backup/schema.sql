-- Users table (optional, if you want to track users beyond session)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_username TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions (for anonymous usage tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER DEFAULT (unixepoch()),
  last_active INTEGER DEFAULT (unixepoch())
);

-- Generations history
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,  -- nullable if using sessions only
  type TEXT NOT NULL, -- 'text' | 'image' | 'video' | 'audio' | 'embedding'
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  result_url TEXT,
  result_data TEXT, -- JSON blob for structured responses (chat, embeddings)
  params TEXT, -- JSON of all generation params
  cost REAL, -- pollen cost
  is_favorite INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Favorites (alternative to is_favorite flag)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (generation_id) REFERENCES generations(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Models cache (sync from API periodically)
CREATE TABLE IF NOT EXISTS models_cache (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'text' | 'image' | 'video' | 'audio' | 'embedding'
  name TEXT NOT NULL,
  capabilities TEXT, -- JSON
  pricing TEXT, -- JSON
  metadata TEXT, -- JSON (context_window, modalities, voices, etc.)
  updated_at INTEGER DEFAULT (unixepoch())
);

-- User API keys (if you're managing keys on behalf of users)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- 'sk_' or 'pk_'
  key_hash TEXT NOT NULL, -- hashed for security
  name TEXT,
  redirect_uris TEXT, -- JSON array
  earnings_enabled INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_generations_session ON generations(session_id);
CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_generations_type ON generations(type);
CREATE INDEX idx_generations_created ON generations(created_at DESC);
CREATE INDEX idx_favorites_session ON favorites(session_id);

-- Site settings (e.g. maintenance mode)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES (
  'maintenance', 
  '{"isActive":false,"startTime":"","endTime":"","contactEmail":"","contactPhone":"","facebookGroup":"","message":""}'
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES (
  'event_banner', 
  '{"isActive":false,"title":"","message":"","imageUrl":"","buttonText":"","buttonLink":""}'
);

-- Admin users for RBAC
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- 'superadmin' | 'admin'
  expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO admins (email, role, name) VALUES ('arekgresikid@gmail.com', 'superadmin', 'Superadmin');
