-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Chats table
create table if not exists chats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Messages table
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references chats(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Optional: Config table
create table if not exists config (
  key text primary key,
  value text
);

-- Insert your Supabase credentials (optional, only if app reads from DB)
insert into config (key, value) values 
  ('SUPABASE_URL', 'https://wctcguchnpahsuthwfxx.supabase.co'),
  ('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdGNndWNobnBhaHN1dGh3Znh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTA0MzksImV4cCI6MjA3MDA2NjQzOX0.58uyT9RGZnKqZEnPuY_89JUM5Z41yGyU1otwUc0NheM'),
  ('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdGNndWNobnBhaHN1dGh3Znh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5MDQzOSwiZXhwIjoyMDcwMDY2NDM5fQ.sI7bf3LuPgK8_W-ySvubadezkCaIVaQISgCM_grsWcw');

-- Enable Row-Level Security
alter table users enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;

-- RLS Policies
create policy "Allow user access to their data" on users
  for select using (true);

create policy "Allow insert for authenticated users" on users
  for insert with check (true);

create policy "Allow user access to their own chats" on chats
  for all using (auth.uid() = user_id);

create policy "Allow user access to their own messages" on messages
  for all using (
    chat_id in (
      select id from chats where user_id = auth.uid()
    )
  );