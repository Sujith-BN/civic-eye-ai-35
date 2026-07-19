-- Run this additive migration in the Supabase SQL editor after the existing
-- 20260719_civic_confirmations_and_status.sql migration.
-- Duplicate threshold: 75 metres. RESOLVED reports never block a new report.

create index if not exists civic_reports_active_duplicate_lookup_idx
  on public.civic_reports (status, lower(category));

-- Keep confirmations authoritative even if a stale browser shows a resolved report.
create or replace function public.confirm_civic_report(p_report_id bigint)
returns table(confirmations integer)
language plpgsql security definer set search_path = public
as $$
declare report_owner uuid; report_status text;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  select submitter_id, status into report_owner, report_status from public.civic_reports
    where id = p_report_id for update;
  if not found then raise exception 'Report not found'; end if;
  if upper(coalesce(report_status, 'REPORTED')) = 'RESOLVED' then
    raise exception 'Resolved reports cannot be confirmed';
  end if;
  if report_owner = auth.uid() then raise exception 'You cannot confirm your own report'; end if;
  insert into public.report_confirmations (report_id, user_id) values (p_report_id, auth.uid());
  update public.civic_reports as cr set confirmations = coalesce(cr.confirmations, 0) + 1
    where cr.id = p_report_id returning cr.confirmations into confirmations;
  return next;
end;
$$;

-- Serializes the short match-and-insert transaction to prevent concurrent
-- duplicate submissions without PostGIS or any RLS policy changes.
create or replace function public.submit_civic_report(
  p_image_url text, p_location text, p_latitude double precision,
  p_longitude double precision, p_description text, p_detected_issue text,
  p_category text, p_severity text, p_safety_risk text, p_department text,
  p_confidence integer, p_ai_reasoning text
)
returns table(
  is_duplicate boolean, report_id bigint, duplicate_detected_issue text,
  duplicate_location text, duplicate_severity text, duplicate_status text,
  duplicate_confirmations integer, duplicate_submitter_id uuid
)
language plpgsql security definer set search_path = public
as $$
declare matching_report public.civic_reports%rowtype; new_report_id bigint;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then
    raise exception 'Invalid report coordinates';
  end if;
  lock table public.civic_reports in share row exclusive mode;
  select cr.* into matching_report from public.civic_reports cr
   where upper(coalesce(cr.status, 'REPORTED')) in ('REPORTED', 'IN_PROGRESS')
     and cr.latitude is not null and cr.longitude is not null
     and (
       lower(regexp_replace(trim(coalesce(cr.category, '')), '[^a-z0-9]+', ' ', 'g')) = lower(regexp_replace(trim(p_category), '[^a-z0-9]+', ' ', 'g'))
       or lower(regexp_replace(trim(coalesce(cr.detected_issue, '')), '[^a-z0-9]+', ' ', 'g')) = lower(regexp_replace(trim(p_detected_issue), '[^a-z0-9]+', ' ', 'g'))
     )
     and 6371000 * 2 * asin(sqrt(power(sin(radians(cr.latitude - p_latitude) / 2), 2) + cos(radians(p_latitude)) * cos(radians(cr.latitude)) * power(sin(radians(cr.longitude - p_longitude) / 2), 2))) <= 75
   order by cr.created_at desc limit 1;
  if found then
    return query select true, matching_report.id, matching_report.detected_issue,
      matching_report.location, matching_report.severity, matching_report.status,
      coalesce(matching_report.confirmations, 0), matching_report.submitter_id;
    return;
  end if;
  insert into public.civic_reports (submitter_id, image_url, location, latitude, longitude, description, detected_issue, category, severity, safety_risk, department, confidence, ai_reasoning, status, confirmations)
  values (auth.uid(), p_image_url, p_location, p_latitude, p_longitude, p_description, p_detected_issue, p_category, p_severity, p_safety_risk, p_department, p_confidence, p_ai_reasoning, 'REPORTED', 0)
  returning id into new_report_id;
  return query select false, new_report_id, null::text, null::text, null::text, null::text, null::integer, null::uuid;
end;
$$;

revoke all on function public.submit_civic_report(text, text, double precision, double precision, text, text, text, text, text, text, integer, text) from public;
grant execute on function public.submit_civic_report(text, text, double precision, double precision, text, text, text, text, text, text, integer, text) to authenticated;
