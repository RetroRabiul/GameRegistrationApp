-- =============================================
-- ADD NEW COLUMNS TO EVENTS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS game_type TEXT NOT NULL DEFAULT 'freefire' CHECK (game_type IN ('freefire', 'bgmi', 'pubg', 'cod', 'valorant', 'other')),
ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'squad' CHECK (game_mode IN ('solo', 'duo', 'squad', 'custom')),
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'mobile' CHECK (platform IN ('mobile', 'pc', 'console', 'cross-platform')),
ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_size INTEGER NOT NULL DEFAULT 4;
