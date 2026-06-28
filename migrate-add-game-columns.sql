-- =============================================
-- MIGRATION: Add missing game columns to events
-- Run this ONLY if you already have the old schema
-- =============================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS game_type TEXT NOT NULL DEFAULT 'other' CHECK (game_type IN ('freefire', 'bgmi', 'pubg', 'cod', 'valorant', 'other'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'squad' CHECK (game_mode IN ('solo', 'duo', 'squad', 'custom'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'mobile' CHECK (platform IN ('mobile', 'pc', 'console', 'cross-platform'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size INTEGER NOT NULL DEFAULT 1;
