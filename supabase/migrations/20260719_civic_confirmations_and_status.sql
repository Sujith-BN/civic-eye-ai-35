-- Run this migration in the Supabase SQL editor. It is additive and does not
-- delete or rewrite existing civic_reports rows.

create table if not exists public.report_confirmations (
  report_id bigint not null references public.civic_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create index if not exists report_confirmations_user_id_idx
  on public.report_confirmations (user_id);

alter table public.report_confirmations enable row level security;

drop policy if exists "Users can read their confirmations" on public.report_confirmations;
create policy "Users can read their confirmations"
  on public.report_confirmations for select to authenticated
  using (user_id = auth.uid());

-- The RPC derives the user from the validated Supabase JWT, rejects the
-- original reporter, and makes the unique key the source of truth for one vote.
create or replace function public.confirm_civic_report(p_report_id bigint)
returns table(confirmations integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  report_owner uuid;
begin
  select submitter_id into report_owner from public.civic_reports where id = p_report_id;
  if not found then raise exception 'Report not found'; end if;
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if report_owner = auth.uid() then raise exception 'You cannot confirm your own report'; end if;

  insert into public.report_confirmations (report_id, user_id)
  values (p_report_id, auth.uid());

  update public.civic_reports as cr
  set confirmations = coalesce(cr.confirmations, 0) + 1
  where cr.id = p_report_id
  returning cr.confirmations into confirmations;
  return next;
end;
$$;

revoke all on function public.confirm_civic_report(bigint) from public;
grant execute on function public.confirm_civic_report(bigint) to authenticated;

-- Minimal, safe status transition for users explicitly marked as civic admins
-- in Supabase Auth app_metadata: { "civic_admin": true }.
create or replace function public.update_civic_report_status(
  p_report_id bigint,
  p_status text
)
returns table(id bigint, status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'civic_admin')::boolean, false) is not true then
    raise exception 'Only civic administrators can update report status';
  end if;
  if p_status not in ('REPORTED', 'IN_PROGRESS', 'RESOLVED') then
    raise exception 'Invalid report status';
  end if;
  update public.civic_reports set status = p_status where civic_reports.id = p_report_id
  returning civic_reports.id, civic_reports.status into id, status;
  if not found then raise exception 'Report not found'; end if;
  return next;
end;
$$;

revoke all on function public.update_civic_report_status(bigint, text) from public;
grant execute on function public.update_civic_report_status(bigint, text) to authenticated;
