-- Migration 0002: Community Chat messages and visitor identity tables
CREATE TABLE IF NOT EXISTS community_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT DEFAULT '',
  device TEXT DEFAULT '',
  verified INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_id ON community_chat_messages(id DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON community_chat_messages(client_id);

CREATE TABLE IF NOT EXISTS community_chat_identities (
  client_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
