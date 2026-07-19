-- Additive image-fingerprint support. Existing reports retain a null hash and
-- continue to use the location/category check safely.
alter table public.civic_reports
  add column if not exists image_hash text;

create index if not exists civic_reports_active_image_hash_idx
  on public.civic_reports (image_hash)
  where upper(coalesce(status, 'REPORTED')) in ('REPORTED', 'IN_PROGRESS')
    and image_hash is not null;

-- Maps common AI wording to conservative civic issue families. The fallback is
-- normalized category, so unrelated nearby reports are not merged.
create or replace function public.civic_issue_match_key(p_category text, p_issue text)
returns text
language sql
immutable
as $$
  select case
    when lower(coalesce(p_category, '') || ' ' || coalesce(p_issue, '')) ~ '(garbage|waste|trash|litter|dump)' then 'GARBAGE_WASTE'
    when lower(coalesce(p_category, '') || ' ' || coalesce(p_issue, '')) ~ '(pothole|road[[:space:]]*damage|damaged[[:space:]]*road)' then 'ROAD_DAMAGE'
    when lower(coalesce(p_category, '') || ' ' || coalesce(p_issue, '')) ~ '(street[[:space:]]*light|streetlight|traffic[[:space:]]*light)' then 'STREETLIGHT'
    when lower(coalesce(p_category, '') || ' ' || coalesce(p_issue, '')) ~ '(drain|sewage|drainage)' then 'DRAINAGE'
    when lower(coalesce(p_category, '') || ' ' || coalesce(p_issue, '')) ~ '(water[[:space:]]*(leak|supply|pipe)|leaking[[:space:]]*water)' then 'WATER'
    else lower(regexp_replace(trim(coalesce(p_category, '')), '[^a-z0-9]+', ' ', 'g'))
  end;
$$;

-- New RPC name deliberately leaves the previously deployed RPC intact. The
-- image hash is SHA-256 of the uploaded file bytes, calculated server-side.
create or replace function public.submit_civic_report_with_image_hash(
  p_image_url text, p_image_hash text, p_location text, p_latitude double precision,
  p_longitude double precision, p_description text, p_detected_issue text,
  p_category text, p_severity text, p_safety_risk text, p_department text,
  p_confidence integer, p_ai_reasoning text
)
returns table(
  is_duplicate boolean, report_id bigint, duplicate_detected_issue text,
  duplicate_location text, duplicate_severity text, duplicate_status text,
  duplicate_confirmations integer, duplicate_submitter_id uuid,
  duplicate_match_type text
)
language plpgsql security definer set search_path = public
as $$
declare matching_report public.civic_reports%rowtype; new_report_id bigint; match_type text;
begin
  if auth.uid() is null then raise exception 'Authentication is required'; end if;
  if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then
    raise exception 'Invalid report coordinates';
  end if;
  if p_image_hash is null or p_image_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid image fingerprint';
  end if;

  lock table public.civic_reports in share row exclusive mode;
  select cr.*
    into matching_report
    from public.civic_reports cr
   where upper(coalesce(cr.status, 'REPORTED')) in ('REPORTED', 'IN_PROGRESS')
     and (
       cr.image_hash = p_image_hash
       or (
         cr.latitude is not null and cr.longitude is not null
         and public.civic_issue_match_key(cr.category, cr.detected_issue) = public.civic_issue_match_key(p_category, p_detected_issue)
         and 6371000 * 2 * asin(sqrt(power(sin(radians(cr.latitude - p_latitude) / 2), 2) + cos(radians(p_latitude)) * cos(radians(cr.latitude)) * power(sin(radians(cr.longitude - p_longitude) / 2), 2))) <= 75
       )
     )
   order by case when cr.image_hash = p_image_hash then 0 else 1 end, cr.created_at desc
   limit 1;

  if found then
    match_type := case
      when matching_report.image_hash = p_image_hash then 'EXACT_IMAGE'
      else 'NEARBY_ISSUE'
    end;
    return query select true, matching_report.id, matching_report.detected_issue,
      matching_report.location, matching_report.severity, matching_report.status,
      coalesce(matching_report.confirmations, 0), matching_report.submitter_id, match_type;
    return;
  end if;

  insert into public.civic_reports (submitter_id, image_url, image_hash, location, latitude, longitude, description, detected_issue, category, severity, safety_risk, department, confidence, ai_reasoning, status, confirmations)
  values (auth.uid(), p_image_url, p_image_hash, p_location, p_latitude, p_longitude, p_description, p_detected_issue, p_category, p_severity, p_safety_risk, p_department, p_confidence, p_ai_reasoning, 'REPORTED', 0)
  returning id into new_report_id;

  return query select false, new_report_id, null::text, null::text, null::text,
    null::text, null::integer, null::uuid, null::text;
end;
$$;

revoke all on function public.submit_civic_report_with_image_hash(text, text, text, double precision, double precision, text, text, text, text, text, text, integer, text) from public;
grant execute on function public.submit_civic_report_with_image_hash(text, text, text, double precision, double precision, text, text, text, text, text, text, integer, text) to authenticated;
