-- Visitas por día a las páginas publicadas de cada usuario (wearemiiles.com/<usuario>[/<pagina>]).
-- site-serve llama a record_site_view cada vez que entrega el index.html de una página publicada.
create table if not exists public.site_view_days (
  path text not null,
  day date not null default (now() at time zone 'utc')::date,
  owner_id uuid not null,
  views integer not null default 0,
  primary key (path, day)
);

create index if not exists site_view_days_owner_day_idx on public.site_view_days (owner_id, day);

alter table public.site_view_days enable row level security;

drop policy if exists "Owners can read their site views" on public.site_view_days;
create policy "Owners can read their site views"
  on public.site_view_days for select
  to authenticated
  using (owner_id = auth.uid());

-- Suma una visita a una página publicada. Ignora rutas que no existen o no están publicadas.
create or replace function public.record_site_view(p_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select owner_id into v_owner
  from public.user_sites
  where path = lower(p_path) and status = 'published'
  limit 1;

  if v_owner is null then
    return;
  end if;

  insert into public.site_view_days (path, day, owner_id, views)
  values (lower(p_path), (now() at time zone 'utc')::date, v_owner, 1)
  on conflict (path, day) do update set views = public.site_view_days.views + 1;
end;
$$;

revoke all on function public.record_site_view(text) from public;
grant execute on function public.record_site_view(text) to anon, authenticated;
