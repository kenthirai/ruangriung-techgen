INSERT OR IGNORE INTO site_settings (key, value) VALUES (
  'event_banner', 
  '{"isActive":false,"title":"","message":"","imageUrl":"","buttonText":"","buttonLink":""}'
);

CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- 'superadmin' | 'admin'
  expires_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO admins (email, role, name) VALUES ('arekgresikid@gmail.com', 'superadmin', 'Superadmin');
