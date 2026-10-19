-- Migration 0001: Recommendations table for permanent peer endorsements
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON recommendations(created_at DESC);
