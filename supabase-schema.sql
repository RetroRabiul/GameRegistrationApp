-- =============================================
-- GAME REGISTRATION APP - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- HELPER FUNCTION (prevents RLS recursion)
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL DEFAULT 'other' CHECK (game_type IN ('freefire', 'bgmi', 'pubg', 'cod', 'valorant', 'other')),
  game_mode TEXT NOT NULL DEFAULT 'squad' CHECK (game_mode IN ('solo', 'duo', 'squad', 'custom')),
  platform TEXT NOT NULL DEFAULT 'mobile' CHECK (platform IN ('mobile', 'pc', 'console', 'cross-platform')),
  prize_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  team_size INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  max_slots INTEGER NOT NULL DEFAULT 50,
  filled_slots INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (is_admin());

-- =============================================
-- REGISTRATIONS TABLE
-- =============================================
CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  slot_number INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON registrations FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all registrations"
  ON registrations FOR UPDATE
  USING (is_admin());

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bkash_payment_id TEXT,
  bkash_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = payments.registration_id
      AND registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = payments.registration_id
      AND registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all payments"
  ON payments FOR UPDATE
  USING (is_admin());

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-create profile on signup (robust version)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'player');
  
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, user_full_name, user_role)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ATOMIC REGISTRATION WITH AUTO SLOT ASSIGNMENT
-- Players call this RPC function to register.
-- It atomically: checks slots, assigns slot_number, inserts registration.
-- Prevents race conditions when multiple users register simultaneously.
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
  -- Get the current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Lock the event row to prevent race conditions
  SELECT * INTO v_event FROM events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;

  IF v_event.status != 'upcoming' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event is not accepting registrations');
  END IF;

  -- Check if user already registered (excluding cancelled)
  SELECT id INTO v_existing_registration
  FROM registrations
  WHERE event_id = p_event_id AND user_id = v_user_id AND status != 'cancelled';

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are already registered for this event');
  END IF;

  -- Check if slots are available
  IF v_event.filled_slots >= v_event.max_slots THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event is full. No slots available.');
  END IF;

  -- Assign the next slot number
  v_slot_number := v_event.filled_slots + 1;

  -- Insert the registration with the assigned slot
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

  -- Increment filled_slots
  UPDATE events SET filled_slots = filled_slots + 1 WHERE id = p_event_id;

  RETURN jsonb_build_object('success', true, 'registration', v_registration);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION register_for_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(UUID) TO anon;

-- Decrement filled_slots on registration cancellation
CREATE OR REPLACE FUNCTION decrement_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE events
    SET filled_slots = GREATEST(filled_slots - 1, 0)
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_registration_cancelled ON registrations;
CREATE TRIGGER on_registration_cancelled
  AFTER UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION decrement_filled_slots();

-- =============================================
-- INSERT FIRST ADMIN (replace with your email)
-- Run this AFTER signing up with your email
-- =============================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
