-- zico backend: auth-adjacent tables, RLS, and invite gating.
-- Apply via the Supabase SQL editor or `supabase db push`.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  prefs jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Invite allow-list. Only emails listed here may complete signup.
create table allowed_emails (
  email text primary key,
  invited_by uuid references auth.users,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  eve_session_id text,
  eve_continuation_token text,            -- rotates every turn; persist the latest
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index conversations_user_idx on conversations (user_id, updated_at desc);
create index messages_conversation_idx on messages (conversation_id, created_at);

-- RLS: every user sees only their own rows.
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy own_profile on profiles
  using (id = auth.uid()) with check (id = auth.uid());

create policy own_conversations on conversations
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy own_messages on messages
  using (
    exists (select 1 from conversations c
            where c.id = conversation_id and c.user_id = auth.uid())
  )
  with check (
    exists (select 1 from conversations c
            where c.id = conversation_id and c.user_id = auth.uid())
  );

-- Gate signups on the allow-list and seed a profile row.
-- Raising here rolls back the auth.users insert, so OAuth fails for
-- anyone not invited and the callback redirects them to /login?error=not-invited.
create function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from allowed_emails where email = new.email) then
    raise exception 'not invited: %', new.email;
  end if;
  insert into profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Seed the owner so the first sign-in works.
insert into allowed_emails (email) values ('nico@garf.dev')
  on conflict (email) do nothing;
