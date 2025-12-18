// Supabase Configuration
// Replace these values with your actual Supabase project credentials
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key",
}
