import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY!
const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY! // Expose TMDB API Key

export const supabase = createClient(supabaseUrl, supabaseKey)

// Export the TMDB API key so it can be used in other components
export { tmdbApiKey };
