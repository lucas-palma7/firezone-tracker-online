/**
 * Supabase client configuration
 * @module services/supabase/client
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase project URL from environment variables
 * @constant {string}
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase anonymous key from environment variables
 * @constant {string}
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Configured Supabase client instance
 * Used throughout the application for database operations and real-time subscriptions
 * @constant {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
