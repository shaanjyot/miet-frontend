import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
// In Next.js, NEXT_PUBLIC_* variables are available at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  console.error(
    `❌ Supabase credentials are missing: ${missingVars.join(', ')}\n` +
    `Please set these in your .env.local file and restart the dev server:\n` +
    `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n` +
    `Debug info:\n` +
    `- NEXT_PUBLIC_SUPABASE_URL exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}\n` +
    `- NEXT_PUBLIC_SUPABASE_ANON_KEY exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}\n` +
    `- URL value: ${supabaseUrl || '(empty or undefined)'}\n` +
    `- Key value: ${supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : '(empty or undefined)'}`
  );
}

// Create a single supabase client for interacting with your database
// Note: If env vars are missing, this will fail - user must set them in .env.local
let supabase: SupabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Create a dummy client that will fail gracefully
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    console.warn('⚠️ Using placeholder Supabase client. Authentication will not work.');
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Create a minimal client to prevent app crash
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

// Helper function to get the access token for API calls
export const getSupabaseAccessToken = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    return session.access_token;
  } catch (error) {
    console.error('Error getting Supabase access token:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    return false;
  }
};
