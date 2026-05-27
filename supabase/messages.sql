create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create index if not exists messages_sender_receiver_idx
  on public.messages (sender_id, receiver_id, created_at);

create index if not exists messages_receiver_unread_idx
  on public.messages (receiver_id, is_read, created_at);

drop policy if exists "Users can read their own messages" on public.messages;
create policy "Users can read their own messages"
  on public.messages
  for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send their own messages" on public.messages;
create policy "Users can send their own messages"
  on public.messages
  for insert
  with check (auth.uid() = sender_id and sender_id <> receiver_id);

drop policy if exists "Receivers can mark messages read" on public.messages;
create policy "Receivers can mark messages read"
  on public.messages
  for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);
