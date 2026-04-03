-- Run in Supabase SQL Editor (Dashboard → SQL) once per project.
-- Backend uses the service role key; tables must exist with these names/columns.

create extension if not exists "pgcrypto";

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled form',
  created_at timestamptz default now()
);

create table if not exists public.form_fields (
  id text primary key,
  form_id uuid not null references public.forms (id) on delete cascade,
  type text not null,
  label text not null,
  placeholder text,
  required boolean default false,
  order_index int default 0,
  options jsonb,
  show_if jsonb
);

create index if not exists form_fields_form_id_idx on public.form_fields (form_id);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  submitted_at timestamptz default now()
);

create index if not exists responses_form_id_idx on public.responses (form_id);

create table if not exists public.response_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses (id) on delete cascade,
  field_id text not null,
  value text
);

create index if not exists response_answers_response_id_idx
  on public.response_answers (response_id);
