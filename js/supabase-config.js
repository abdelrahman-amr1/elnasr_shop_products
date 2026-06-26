// Supabase Configuration for Hawawshi El Nasr
// Replace the values below with your own Supabase project URL and Anon Key to enable remote database sync.

const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
    // Only attempt client creation if user has set actual credentials (not placeholder)
    if (supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL')) {
      supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
      window.supabaseDb = supabaseClient;
      console.log("Supabase Client successfully initialized.");
    } else {
      console.warn("Supabase is using placeholder credentials. Falling back to local storage database.");
    }
  } catch (e) {
    console.error("Error initializing Supabase client:", e);
  }
} else {
  console.warn("Supabase SDK was not loaded. Static offline fallback enabled.");
}
