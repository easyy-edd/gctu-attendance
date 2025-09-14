import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vccctqsznbtovkqubxyf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY2N0cXN6bmJ0b3ZrcXVieHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjcyNjUsImV4cCI6MjA2NzEwMzI2NX0.5xUsyheryOl0ULV91zVGlw-g8c18rVnnvKUkwnTQpC4'

export const supabase = createClient(supabaseUrl, supabaseKey)
