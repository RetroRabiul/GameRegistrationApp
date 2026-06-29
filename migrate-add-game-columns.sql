-- =============================================
-- MIGRATION: Add missing columns to events and registrations
-- Run this ONLY if you already have the old schema
-- =============================================

-- Add game columns to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS game_type TEXT NOT NULL DEFAULT 'other' CHECK (game_type IN ('freefire', 'bgmi', 'pubg', 'cod', 'valorant', 'other'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'squad' CHECK (game_mode IN ('solo', 'duo', 'squad', 'custom'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'mobile' CHECK (platform IN ('mobile', 'pc', 'console', 'cross-platform'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS prize_pool DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size INTEGER NOT NULL DEFAULT 1;

-- Add slot_number to registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS slot_number INTEGER;

-- =============================================
-- ATOMIC REGISTRATION WITH AUTO SLOT ASSIGNMENT
-- Replaces the old trigger-based approach.
-- =============================================

CREATE OR REPLACE FUNCTION register_for_event(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event RECORD;
  v_user_id UUID;
  v_existing_registration UUID;
  v_slot_number INTEGER;
  v_registration JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_event FROM events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;

  IF v_event.status != 'upcoming' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event is not accepting registrations');
  END IF;

  SELECT id INTO v_existing_registration
  FROM registrations
  WHERE event_id = p_event_id AND user_id = v_user_id AND status != 'cancelled';

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already registered for this event');
  END IF;

  IF v_event.filled_slots >= v_event.max_slots THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event is full. No slots available.');
  END IF;

  v_slot_number := v_event.filled_slots + 1;

  INSERT INTO registrations (event_id, user_id, slot_number, status, payment_status)
  VALUES (p_event_id, v_user_id, v_slot_number, 'pending', 'pending')
  RETURNING jsonb_build_object(
    'id', id,
    'event_id', event_id,
    'user_id', user_id,
    'slot_number', slot_number,
    'status', status,
    'payment_status', payment_status,
    'created_at', created_at
  ) INTO v_registration;

  UPDATE events SET filled_slots = filled_slots + 1 WHERE id = p_event_id;

  RETURN jsonb_build_object('success', true, 'registration', v_registration);
END;
$$;

GRANT EXECUTE ON FUNCTION register_for_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(UUID) TO anon;
