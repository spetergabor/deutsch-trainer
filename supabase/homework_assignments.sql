create table if not exists public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'writing'
    check (type in ('writing', 'practice')),
  practice_type text,
  title text not null,
  instructions text not null,
  topic text,
  expected_word_count integer,
  target_count integer,
  due_at timestamptz,
  status text not null default 'assigned'
    check (status in ('assigned', 'opened', 'submitted', 'reviewed')),
  created_at timestamptz not null default now()
);

alter table public.homework_assignments enable row level security;

create index if not exists homework_assignments_teacher_idx
  on public.homework_assignments (teacher_id, created_at desc);

create index if not exists homework_assignments_student_idx
  on public.homework_assignments (student_id, status, created_at desc);

drop policy if exists "Teachers can create homework assignments" on public.homework_assignments;
create policy "Teachers can create homework assignments"
  on public.homework_assignments
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

drop policy if exists "Teachers can read their homework assignments" on public.homework_assignments;
create policy "Teachers can read their homework assignments"
  on public.homework_assignments
  for select
  using (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  );

drop policy if exists "Teachers and students can update homework assignments" on public.homework_assignments;
create policy "Teachers and students can update homework assignments"
  on public.homework_assignments
  for update
  using (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  )
  with check (
    auth.uid() = teacher_id
    or auth.uid() = student_id
  );

alter table public.writing_submissions
  add column if not exists assignment_id uuid references public.homework_assignments(id) on delete set null;
