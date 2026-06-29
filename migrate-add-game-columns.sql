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

-- Add bKash transaction tracking columns
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS bkash_transaction_id TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS bkash_submitted_at TIMESTAMPTZ;

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

-- =============================================
-- MANUAL PAYMENT FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION submit_payment_transaction(
  p_registration_id UUID,
  p_transaction_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_registration FROM registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration not found');
  END IF;

  IF v_registration.user_id != v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  IF v_registration.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment already completed');
  END IF;

  IF v_registration.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration is cancelled');
  END IF;

  IF length(p_transaction_id) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid transaction ID format');
  END IF;

  UPDATE registrations
  SET bkash_transaction_id = p_transaction_id,
      bkash_submitted_at = NOW(),
      payment_status = 'pending'
  WHERE id = p_registration_id;

  RETURN jsonb_build_object('success', true, 'message', 'Transaction ID submitted. Awaiting admin verification.');
END;
$$;

GRANT EXECUTE ON FUNCTION submit_payment_transaction(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION admin_verify_payment(
  p_registration_id UUID,
  p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_registration RECORD;
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin access required');
  END IF;

  SELECT * INTO v_registration FROM registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration not found');
  END IF;

  IF v_registration.payment_status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is not pending');
  END IF;

  IF p_action = 'approve' THEN
    UPDATE registrations
    SET payment_status = 'paid',
        status = 'confirmed'
    WHERE id = p_registration_id;

    RETURN jsonb_build_object('success', true, 'message', 'Payment approved');
  ELSIF p_action = 'reject' THEN
    UPDATE registrations
    SET payment_status = 'failed'
    WHERE id = p_registration_id;

    RETURN jsonb_build_object('success', true, 'message', 'Payment rejected');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action. Use approve or reject');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_verify_payment(UUID, TEXT) TO authenticated;
