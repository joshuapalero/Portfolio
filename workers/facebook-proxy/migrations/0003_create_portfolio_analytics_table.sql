-- Migration 0003: Portfolio visits and unique visitor analytics
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

