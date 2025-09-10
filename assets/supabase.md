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

Database schema configuration (run in Supabase SQL editor):
1) Create table and indexes
   create extension if not exists "pgcrypto";
   create table if not exists public.clips (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null references auth.users(id) on delete cascade,
     url text not null,
     title text,
     source text check (source in ('reddit','x','youtube','web')),
     summary text,
     metadata jsonb,
     tags text[],
     created_at timestamp with time zone default now()
   );
   create index if not exists clips_user_created_at_idx on public.clips(user_id, created_at desc);
   create index if not exists clips_source_idx on public.clips(source);
   create index if not exists clips_title_trgm_idx on public.clips using gin (title gin_trgm_ops);
   create index if not exists clips_summary_trgm_idx on public.clips using gin (summary gin_trgm_ops);

2) Enable Row Level Security and policies
   alter table public.clips enable row level security;

   create policy if not exists "Users can view own clips"
     on public.clips for select
     using (auth.uid() = user_id);

   create policy if not exists "Users can insert own clips"
     on public.clips for insert
     with check (auth.uid() = user_id);

   create policy if not exists "Users can update own clips"
     on public.clips for update
     using (auth.uid() = user_id);

   create policy if not exists "Users can delete own clips"
     on public.clips for delete
     using (auth.uid() = user_id);

3) Optional GraphQL
   - In the Supabase Dashboard, enable GraphQL for your project if you plan to use src/services/api.ts graphQLSearch.

Authentication configuration (Supabase Dashboard):
- Go to Authentication > Providers > Email:
  • Enable "Email OTP" sign in.
- Go to Authentication > URL Configuration:
  • Site URL: set to your app scheme or deployed web URL.
    - For local testing with Expo: clipstack://auth
  • Redirect URLs allowlist:
    - clipstack://**
    - https://** (if you plan to support universal links/web)
- Optional: Customize Email Templates; ensure the redirect placeholders are used.

Required environment variables (.env in clipstack_frontend):
- EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
- EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
- EXPO_PUBLIC_SITE_URL=clipstack://auth
- EXPO_PUBLIC_OPENAI_API_KEY=<optional>

Notes on client behaviors:
- LoginScreen uses email OTP and passes emailRedirectTo from EXPO_PUBLIC_SITE_URL.
- The app uses expo-linking with scheme "clipstack" as configured in app.json.
- API calls rely on RLS policies to scope data to the current user.

Edge/Server functions (future work):
- Move AI summarization to a secure server (Supabase Edge Function).
- Accept URL or text, fetch content, enrich metadata, and store summary directly.

GraphQL:
- Optional usage via /graphql/v1. Enable GraphQL in your project to use example in src/services/api.ts.
