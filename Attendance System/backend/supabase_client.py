import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://vccctqsznbtovkqubxyf.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjY2N0cXN6bmJ0b3ZrcXVieHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjcyNjUsImV4cCI6MjA2NzEwMzI2NX0.5xUsyheryOl0ULV91zVGlw-g8c18rVnnvKUkwnTQpC4')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
