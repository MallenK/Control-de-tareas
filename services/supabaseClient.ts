import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// In a real production app, these should be environment variables.
// Using the credentials provided in the prompt.
const SUPABASE_URL = 'https://hauobarxiwfcwygjrwjj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdW9iYXJ4aXdmY3d5Z2pyd2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDAxMTQsImV4cCI6MjA4MTExNjExNH0.He2aHWstR-C3zFnyRJ52WgOE4P_CSMvlYOhjenM1kYU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Guarda la sesión en localStorage
    autoRefreshToken: true, // Renueva el token automáticamente
    detectSessionInUrl: true // Detecta logins por OAuth si se implementan a futuro
  }
});