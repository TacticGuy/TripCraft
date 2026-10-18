import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or Service Key in environment variables');
}

// Service role client (for server operations, has full DB access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Throwaway client for auth calls (signUp / signInWithPassword / verifyOtp).
// These store the resulting user session on the client, so they must never run on
// the shared service-role client or later queries would execute as that user.
export function createAuthClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Initialize database schema (run once on startup)
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    const { error } = await supabase.rpc('init_schema', {});
    
    if (error) console.log('Schema initialization response:', error.message);
    else console.log('✅ Database schema initialized');
  } catch (error) {
    console.log('Database already initialized or custom setup needed');
  }
}

export default supabase;
