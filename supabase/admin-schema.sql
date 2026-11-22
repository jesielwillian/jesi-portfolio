-- Execute no Supabase SQL Editor.
-- Cria as tabelas usadas pelo painel. Nunca use a service_role key no navegador.
create extension if not exists pgcrypto;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'web',
  description text,
  image_url text,
  live_url text,
  github_url text,
  technologies text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_messages enable row level security;

-- Leitura pública somente dos projetos publicados; escrita apenas por usuário autenticado.
drop policy if exists "Public can read published projects" on public.portfolio_projects;
create policy "Public can read published projects" on public.portfolio_projects
for select using (status = 'published');

drop policy if exists "Authenticated admins manage projects" on public.portfolio_projects;
create policy "Authenticated admins manage projects" on public.portfolio_projects
for all to authenticated using (true) with check (true);

-- Mensagens: visitantes podem enviar; somente usuários autenticados leem/gerenciam.
drop policy if exists "Visitors can send contact messages" on public.portfolio_messages;
create policy "Visitors can send contact messages" on public.portfolio_messages
for insert to anon, authenticated with check (true);

drop policy if exists "Authenticated admins read messages" on public.portfolio_messages;
create policy "Authenticated admins read messages" on public.portfolio_messages
for select to authenticated using (true);

drop policy if exists "Authenticated admins delete messages" on public.portfolio_messages;
create policy "Authenticated admins delete messages" on public.portfolio_messages
for delete to authenticated using (true);
