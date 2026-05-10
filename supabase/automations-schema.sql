-- AUTOMATIONS TABLE
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ig_account_id uuid references public.instagram_accounts(id) on delete cascade not null,
  name text not null default 'Untitled Automation',
  status text not null default 'draft' check (status in ('active', 'paused', 'draft')),

  -- TRIGGER CONFIG
  trigger_type text not null default 'comment_to_dm',
  trigger_post_id text default null,
  trigger_post_url text default null,
  trigger_post_thumbnail text default null,
  trigger_keywords text[] default array[]::text[],
  trigger_any_word boolean default false,
  reply_to_comment_publicly boolean default false,

  -- OPTIONAL STEPS
  opening_dm_enabled boolean default false,
  opening_dm_text text default null,
  follow_gate_enabled boolean default false,

  -- MAIN DM
  main_dm_text text not null default '',
  main_dm_link_text text default null,
  main_dm_link_url text default null,

  -- TEST MODE
  test_mode boolean default true,
  test_instagram_username text default 'dhruvv.bhaii',

  -- STATS
  total_dms_sent integer default 0,
  total_comments_triggered integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUTOMATION LOGS TABLE
create table if not exists public.automation_logs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  commenter_username text,
  commenter_ig_id text,
  comment_text text,
  comment_id text,
  post_id text,
  dm_sent boolean default false,
  dm_sent_at timestamptz,
  error_message text,
  test_mode boolean default true,
  created_at timestamptz default now()
);

-- CONTACTS TABLE
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ig_user_id text not null,
  username text,
  profile_pic text,
  first_seen_at timestamptz default now(),
  last_interaction_at timestamptz default now(),
  total_dms_received integer default 1,
  source_automation_id uuid references public.automations(id) on delete set null,
  unique(user_id, ig_user_id)
);

-- ROW LEVEL SECURITY
alter table public.automations enable row level security;
alter table public.automation_logs enable row level security;
alter table public.contacts enable row level security;

create policy "Users can manage their own automations"
  on public.automations for all
  using (auth.uid() = user_id);

create policy "Users can view their own logs"
  on public.automation_logs for all
  using (auth.uid() = user_id);

create policy "Users can manage their own contacts"
  on public.contacts for all
  using (auth.uid() = user_id);

-- AUTO UPDATE updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_automations_updated_at
  before update on public.automations
  for each row execute function update_updated_at_column();
