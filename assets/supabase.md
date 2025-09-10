# Supabase Integration for ClipStack

This app uses Supabase for:
- Authentication: Email OTP sign in (magic link compatible)
- Data storage: `clips` table via PostgREST (and optionally GraphQL)

Environment variables (configure in .env):
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_SITE_URL (for emailRedirectTo in OTP)
- EXPO_PUBLIC_OPENAI_API_KEY (optional; client-side demo only)

Client initialization is in: src/services/supabase/client.ts

Schema:
- Table `public.clips`
  Columns: id, user_id, url, title, source, summary, metadata, tags, created_at
  RLS policies enforce per-user access.

Edge/Server functions (future work):
- Move AI summarization to a secure server (Supabase Edge Function).
- Accept URL or text, fetch content, enrich metadata, and store summary directly.

GraphQL:
- Optional usage via /graphql/v1. Enable GraphQL in your project to use example in src/services/api.ts.
