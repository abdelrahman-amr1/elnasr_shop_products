// Supabase Configuration for Hawawshi El Nasr
// Replace the values below with your own Supabase project URL and Anon Key to enable remote database sync.

const supabaseUrl = 'https://vbrqkkqtweyzabftmomo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicnFra3F0d2V5emFiZnRtb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTY4MDYsImV4cCI6MjA5ODA3MjgwNn0.yy0Kaq0GXmRrSUQdLQzdcdnHkyHCbIu7cwg_WLhNAug';

// Initialize Supabase Client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
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
