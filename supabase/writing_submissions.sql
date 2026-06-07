create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  task_type text not null default 'osd-schreiben',
  task_title text not null,
  task_situation text,
  task_instructions text,
  task_points jsonb not null default '[]'::jsonb,
  expected_word_count integer not null default 120,
  word_count integer not null default 0,
  content text not null check (length(trim(content)) > 0),
  grade text,
  teacher_feedback text,
  reviewed_at timestamptz,
  status text not null default 'submitted'
    check (
      status in (
        'submitted',
        'reviewing',
        'reviewed',
        'revision_requested',
        'closed'
      )
    ),
  created_at timestamptz not null default now()
);

alter table public.writing_submissions
  drop constraint if exists writing_submissions_status_check;

alter table public.writing_submissions
  add constraint writing_submissions_status_check
  check (
    status in (
      'submitted',
      'reviewing',
      'reviewed',
      'revision_requested',
      'closed'
    )
  );

alter table public.writing_submissions
  add column if not exists grade text;

alter table public.writing_submissions
  add column if not exists teacher_feedback text;

alter table public.writing_submissions
  add column if not exists reviewed_at timestamptz;

alter table public.writing_submissions enable row level security;

create index if not exists writing_submissions_student_idx
  on public.writing_submissions (student_id, created_at desc);

create index if not exists writing_submissions_teacher_status_idx
  on public.writing_submissions (teacher_id, status, created_at desc);

drop policy if exists "Students can create their own writing submissions" on public.writing_submissions;
create policy "Students can create their own writing submissions"
  on public.writing_submissions
  for insert
  with check (auth.uid() = student_id);

drop policy if exists "Students can read their own writing submissions" on public.writing_submissions;
create policy "Students can read their own writing submissions"
  on public.writing_submissions
  for select
  using (auth.uid() = student_id);

drop policy if exists "Teachers can read writing submissions" on public.writing_submissions;
create policy "Teachers can read writing submissions"
  on public.writing_submissions
  for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'teacher'
    )
  );

drop policy if exists "Teachers can update writing submission status" on public.writing_submissions;
create policy "Teachers can update writing submission status"
  on public.writing_submissions
  for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'teacher'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'teacher'
    )
  );
