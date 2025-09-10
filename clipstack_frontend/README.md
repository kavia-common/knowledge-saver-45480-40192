# ClipStack Mobile App (Expo React Native)

MVP features:
- Email authentication (Supabase OTP)
- Knowledge capture (add URL from Reddit / X / YouTube / Web)
- AI-powered metadata and summary (client-side placeholder; provide OPENAI key for better results)
- Feed browsing with search/filter/sort
- Item detail with editable summary
- AI chat screen over your saved knowledge (lightweight, client-side)
- Profile and Settings (including light/dark mode toggle)
- Native sharing placeholder (copies to clipboard and instructs workflow)

## Getting Started

1) Install dependencies
   npm install

2) Configure environment
   - Copy .env.example to .env and set:
     EXPO_PUBLIC_SUPABASE_URL=
     EXPO_PUBLIC_SUPABASE_ANON_KEY=
     EXPO_PUBLIC_SITE_URL=clipstack://auth (or your deployed site URL)
     EXPO_PUBLIC_OPENAI_API_KEY= (optional, for better summaries)

3) Database (Supabase)
   Create table `clips` with Row Level Security (RLS) enabled:
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

   -- Enable RLS
   alter table public.clips enable row level security;

   -- Policies
   create policy "Users can view own clips" on public.clips
     for select using (auth.uid() = user_id);

   create policy "Users can insert own clips" on public.clips
     for insert with check (auth.uid() = user_id);

   create policy "Users can update own clips" on public.clips
     for update using (auth.uid() = user_id);

   create policy "Users can delete own clips" on public.clips
     for delete using (auth.uid() = user_id);

   Optional: Enable GraphQL in your Supabase project if you plan to use it from the app.

4) Run (Expo)
   npm run start

5) Preview in a browser (static web export)
   # Create a production web build and serve it (useful for CI/nginx previews)
   npm run preview:web
   # This runs: npx expo export --platform web --output-dir dist
   # then serves ./dist on PORT (default 3000)

Environment
- Copy .env.example to .env and set required variables for Supabase/OpenAI.

## Building Native Apps
- This repo uses the Expo managed workflow. The CI environment attempting to run "./gradlew" without prebuild will fail.
- To build native Android locally:
  npm run prebuild:android
  cd android && ./gradlew assembleDebug
  Note: Ensure you have Android SDK installed. In CI, prefer EAS Build.

## Notes
- The AI summary uses a client-side call to OpenAI if EXPO_PUBLIC_OPENAI_API_KEY is provided. For production, move AI calls to a secure backend function or Supabase Edge Function.
- Native share/extension is a placeholder in MVP. The flow is: share/copy URL -> open ClipStack -> paste into Capture.
- Theme preference is stored securely and applied via react-navigation themes.

