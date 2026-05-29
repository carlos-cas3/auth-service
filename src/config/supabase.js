const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

/** Supabase client using the anon/public key (RLS-enforced). @type {import('@supabase/supabase-js').SupabaseClient} */
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { transport: ws }
});

/** Supabase client using the service_role key (bypasses RLS). Null when SUPABASE_SERVICE_KEY is not set. @type {import('@supabase/supabase-js').SupabaseClient | null} */
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: { transport: ws }
    })
  : null;

module.exports = { supabase, supabaseAdmin };