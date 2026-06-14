create table if not exists public.lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  meet_url text,
  topic text not null default 'Online óra',
  goal text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  shared_notes text not null default '',
  vocabulary_notes text not null default '',
  corrections_notes text not null default '',
  next_steps text not null default '',
  video_started_at timestamptz,
  video_started_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lesson_sessions
  add column if not exists video_started_at timestamptz;

alter table public.lesson_sessions
  add column if not exists video_started_by uuid references public.profiles(id) on delete set null;

alter table public.lesson_sessions enable row level security;

create index if not exists lesson_sessions_teacher_idx
  on public.lesson_sessions (teacher_id, scheduled_at desc);

create index if not exists lesson_sessions_student_idx
  on public.lesson_sessions (student_id, scheduled_at desc);

drop policy if exists "Teachers can create lesson sessions" on public.lesson_sessions;
create policy "Teachers can create lesson sessions"
  on public.lesson_sessions
  for insert
  with check (
    auth.uid() = teacher_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'teacher'
    )
  );

drop policy if exists "Teachers and students can read lesson sessions" on public.lesson_sessions;
create policy "Teachers and students can read lesson sessions"
  on public.lesson_sessions
  for select
  using (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  );

drop policy if exists "Teachers and students can update lesson sessions" on public.lesson_sessions;
create policy "Teachers and students can update lesson sessions"
  on public.lesson_sessions
  for update
  using (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  )
  with check (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  );
