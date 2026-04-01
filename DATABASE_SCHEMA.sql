-- ============================================================
-- TripCraft Database Schema for Supabase
-- ============================================================
-- Run all these SQL queries in your Supabase SQL editor
-- Go to: https://supabase.com/dashboard > Your Project > SQL Editor
-- ============================================================

-- Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  google_id VARCHAR UNIQUE,
  auth_provider VARCHAR NOT NULL DEFAULT 'email',
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_level VARCHAR NOT NULL DEFAULT 'moderate',
  num_travelers INTEGER NOT NULL DEFAULT 1,
  interests TEXT,
  itinerary JSONB,
  status VARCHAR DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Trip Collaborators table
CREATE TABLE trip_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Create Trip Templates table
CREATE TABLE trip_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  destination VARCHAR NOT NULL,
  description TEXT,
  duration_days INTEGER,
  budget_level VARCHAR,
  interests TEXT,
  itinerary_template JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Trip History table
CREATE TABLE trip_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR NOT NULL,
  change_log JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Share Tokens table (for shareable trip links)
CREATE TABLE share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  token VARCHAR UNIQUE NOT NULL,
  can_edit BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own info
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can view their trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own trips
CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- IMPORTANT: Update Authorization
-- ============================================================
-- Due to how authentication works with our JWT token system,
-- you may need to disable RLS during initial development
-- and re-enable it once Supabase Auth is fully integrated.
--
-- For now, you can run this query to disable RLS temporarily:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE trip_collaborators DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE trip_templates DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE trip_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE share_tokens DISABLE ROW LEVEL SECURITY;
-- ============================================================
