-- Pega todo esto en Supabase -> SQL Editor -> Run.

create table if not exists public.pitches (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null check (slug ~ '^[a-z0-9-]{4,40}$'),
  client_name      text,
  job_title        text not null,
  job_summary      text not null,
  job_skills       text[] not null default '{}',
  job_budget       text,
  job_url          text,
  upwork_job_id    text,
  card_image_url   text,   -- opcional: una captura auténtica que subas tú
  intro_video_url  text,   -- opcional: sobreescribe el intro por defecto (variantes por nicho)
  main_video_url   text,   -- opcional: sobreescribe el video principal
  views            integer not null default 0,
  plays            integer not null default 0,
  finishes         integer not null default 0,
  first_viewed_at  timestamptz,
  last_viewed_at   timestamptz,
  created_at       timestamptz not null default now()
);

-- RLS activado y SIN políticas: la clave pública (anon) no puede listar ni leer la tabla.
-- Solo puede llamar a las dos funciones de abajo, y solo conociendo el slug.
alter table public.pitches enable row level security;

create or replace function public.get_pitch(p_slug text)
returns table (
  slug text,
  client_name text,
  job_title text,
  job_summary text,
  job_skills text[],
  job_budget text,
  card_image_url text,
  intro_video_url text,
  main_video_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.slug, p.client_name, p.job_title, p.job_summary, p.job_skills,
         p.job_budget, p.card_image_url, p.intro_video_url, p.main_video_url
  from public.pitches p
  where p.slug = p_slug
  limit 1;
$$;

create or replace function public.log_event(p_slug text, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event = 'view' then
    update public.pitches
       set views = views + 1,
           first_viewed_at = coalesce(first_viewed_at, now()),
           last_viewed_at = now()
     where slug = p_slug;
  elsif p_event = 'play' then
    update public.pitches set plays = plays + 1, last_viewed_at = now() where slug = p_slug;
  elsif p_event = 'finish' then
    update public.pitches set finishes = finishes + 1, last_viewed_at = now() where slug = p_slug;
  end if;
end;
$$;

revoke all on function public.get_pitch(text) from public;
revoke all on function public.log_event(text, text) from public;
grant execute on function public.get_pitch(text) to anon, authenticated;
grant execute on function public.log_event(text, text) to anon, authenticated;

-- Bucket público para los videos (los archivos se suben con la service key desde tools/upload_videos.py).
-- Límite de 50 MB por archivo en el plan gratis: comprime con tools/compress_video.py.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pitch-videos', 'pitch-videos', true, 52428800,
        array['video/mp4', 'video/webm', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;
