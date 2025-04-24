--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$begin
  -- Ensure the table name 'users' matches your public table name
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO postgres;

--
-- Name: trigger_set_timestamp_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_date = current_timestamp;
  return new;
end;
$$;


ALTER FUNCTION public.trigger_set_timestamp_users() OWNER TO postgres;

--
-- Name: FUNCTION trigger_set_timestamp_users(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.trigger_set_timestamp_users() IS 'Updates the updated_date column to current timestamp on record update';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp without time zone,
    openai_thread_id text,
    answer_accepted boolean DEFAULT false NOT NULL,
    messages jsonb
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: shopping_list_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_list_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shopping_list_id uuid NOT NULL,
    item_name text NOT NULL,
    purchased boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shopping_list_items OWNER TO postgres;

--
-- Name: shopping_lists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shopping_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shopping_lists OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(128) NOT NULL,
    updated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores user accounts including regular users and administrators';


--
-- Name: COLUMN users.admin; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.admin IS 'Identifies users with administrative privileges. Default is false for regular users.';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
c90bd50c-a7c7-4a97-99c8-3261065386ee	postgres_cdc_rls	{"region": "us-east-1", "db_host": "3Sv1FlhkYz2Gl+0iVcc9v/pfGSu8fKUR0Ku84N06Iy0=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-04-24 06:48:53	2025-04-24 06:48:53
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-04-16 11:43:12
20220329161857	2025-04-16 11:43:12
20220410212326	2025-04-16 11:43:12
20220506102948	2025-04-16 11:43:12
20220527210857	2025-04-16 11:43:12
20220815211129	2025-04-16 11:43:12
20220815215024	2025-04-16 11:43:12
20220818141501	2025-04-16 11:43:12
20221018173709	2025-04-16 11:43:12
20221102172703	2025-04-16 11:43:12
20221223010058	2025-04-16 11:43:12
20230110180046	2025-04-16 11:43:12
20230810220907	2025-04-16 11:43:12
20230810220924	2025-04-16 11:43:12
20231024094642	2025-04-16 11:43:12
20240306114423	2025-04-16 11:43:12
20240418082835	2025-04-16 11:43:12
20240625211759	2025-04-16 11:43:12
20240704172020	2025-04-16 11:43:12
20240902173232	2025-04-16 11:43:12
20241106103258	2025-04-16 11:43:12
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only) FROM stdin;
dc660b66-4524-4a4c-bdee-d3376f075bad	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-04-24 06:48:53	2025-04-24 06:48:53	100	postgres_cdc_rls	100000	100	100	f	{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}	f	f
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	bf721fc7-e627-4734-8c0d-1328229d51d6	{"action":"user_signedup","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-17 11:10:53.978137+00	
00000000-0000-0000-0000-000000000000	09404de2-2a79-4be5-9557-93d2154da934	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:10:53.984326+00	
00000000-0000-0000-0000-000000000000	6315e837-137d-4b75-bb43-8cd4eec3a069	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:11:20.177111+00	
00000000-0000-0000-0000-000000000000	52a14e93-c0c5-4b86-9af9-236fc0d35044	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:11:49.491527+00	
00000000-0000-0000-0000-000000000000	5b8407bb-e48a-44c7-b2f2-37ba555d82b5	{"action":"user_signedup","actor_id":"8a5b3fd7-c692-4d4a-8433-58315cb3301a","actor_username":"pawel.admin@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-17 11:17:05.022365+00	
00000000-0000-0000-0000-000000000000	c2378e22-4447-4145-956d-792761172311	{"action":"login","actor_id":"8a5b3fd7-c692-4d4a-8433-58315cb3301a","actor_username":"pawel.admin@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:17:05.028806+00	
00000000-0000-0000-0000-000000000000	14dc8a6f-1b1b-4961-8675-be0780882dda	{"action":"login","actor_id":"8a5b3fd7-c692-4d4a-8433-58315cb3301a","actor_username":"pawel.admin@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:18:12.301569+00	
00000000-0000-0000-0000-000000000000	bd984594-1e44-4f4e-8c96-3ce73fc6f399	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-17 11:18:32.774105+00	
00000000-0000-0000-0000-000000000000	79105dff-e4ed-4b61-b7b0-055374c4ae0a	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 03:12:41.992369+00	
00000000-0000-0000-0000-000000000000	c0601c31-4e37-456f-a60a-4c19729955e8	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 03:35:21.976378+00	
00000000-0000-0000-0000-000000000000	17b3a597-4197-4a2b-9f9a-3eead5eaa309	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 03:40:35.37831+00	
00000000-0000-0000-0000-000000000000	e38384bc-afdb-43b4-8992-5fdbe01d7388	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 03:42:31.784151+00	
00000000-0000-0000-0000-000000000000	2174661a-af6f-4a67-810e-3a71059e836a	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:06:41.909751+00	
00000000-0000-0000-0000-000000000000	f56ef206-ef63-49ad-b2b3-4d66a36e2db3	{"action":"user_signedup","actor_id":"75d6b32d-e6aa-455d-89f4-52dac1915e96","actor_username":"pawel.jurek@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-18 04:07:43.986171+00	
00000000-0000-0000-0000-000000000000	b284329e-4307-4188-867e-a02873eb70ab	{"action":"login","actor_id":"75d6b32d-e6aa-455d-89f4-52dac1915e96","actor_username":"pawel.jurek@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:07:43.996531+00	
00000000-0000-0000-0000-000000000000	5bd51932-27e8-4f47-9be8-94ee88d793d1	{"action":"login","actor_id":"75d6b32d-e6aa-455d-89f4-52dac1915e96","actor_username":"pawel.jurek@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:08:10.459533+00	
00000000-0000-0000-0000-000000000000	21df1a08-cc12-4bf2-97ae-0c5dc5fb5f87	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:12:36.452842+00	
00000000-0000-0000-0000-000000000000	e059a374-3354-4633-a391-006cd81a27f2	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:17:06.416636+00	
00000000-0000-0000-0000-000000000000	0eb93c06-612f-46d6-aec7-a706485048c9	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:40:59.724658+00	
00000000-0000-0000-0000-000000000000	8966e85a-188d-449b-a39f-5d6dafd5dc0a	{"action":"user_signedup","actor_id":"529ef185-ccec-4f37-957c-74d97294d127","actor_username":"pawel.stefan@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-18 04:43:26.456401+00	
00000000-0000-0000-0000-000000000000	31a7e1d6-cb86-47eb-a2c4-8069973b72f6	{"action":"login","actor_id":"529ef185-ccec-4f37-957c-74d97294d127","actor_username":"pawel.stefan@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:43:26.460719+00	
00000000-0000-0000-0000-000000000000	678ae010-7b73-4d7e-8539-df38240f7212	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 04:49:52.285937+00	
00000000-0000-0000-0000-000000000000	569ab6c2-4db5-4ea9-8fa3-a6146b57615f	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 05:22:49.28722+00	
00000000-0000-0000-0000-000000000000	eab308fa-e55a-4cac-811d-494b9b00fba8	{"action":"login","actor_id":"529ef185-ccec-4f37-957c-74d97294d127","actor_username":"pawel.stefan@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 05:23:31.32713+00	
00000000-0000-0000-0000-000000000000	dc30ac2c-a5e1-48e7-b6d4-bff45606d0b7	{"action":"user_signedup","actor_id":"d966d39e-ba0a-4aa9-af86-ecceca2cf6e8","actor_username":"pawel.test1@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-18 05:23:58.442653+00	
00000000-0000-0000-0000-000000000000	ab2a7e7c-2f3b-4ca2-a0c9-a178116eb01a	{"action":"login","actor_id":"d966d39e-ba0a-4aa9-af86-ecceca2cf6e8","actor_username":"pawel.test1@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 05:23:58.446059+00	
00000000-0000-0000-0000-000000000000	701581dd-b8e3-47ed-9f9c-5e0a3fd9c21a	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 05:55:03.003256+00	
00000000-0000-0000-0000-000000000000	77553663-35f2-48a5-8135-a97b0a0b04fb	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 05:58:17.047295+00	
00000000-0000-0000-0000-000000000000	d3cb487a-f7a3-4d35-a310-50197fa8c663	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:00:42.603053+00	
00000000-0000-0000-0000-000000000000	63854e03-9428-468b-93a3-0753465f35de	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:02:01.078896+00	
00000000-0000-0000-0000-000000000000	9aaa541c-8647-4845-a5d8-318b6302c073	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:05:34.631962+00	
00000000-0000-0000-0000-000000000000	07a12b13-456e-4540-829e-023e2cda0a4f	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:14:40.56152+00	
00000000-0000-0000-0000-000000000000	348ec432-6e81-4771-8617-89c142888b67	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:18:19.938109+00	
00000000-0000-0000-0000-000000000000	a165122c-5f09-470d-bd7b-30c134cd623c	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:20:38.721763+00	
00000000-0000-0000-0000-000000000000	392506bc-d71d-48f9-9292-175cf9060507	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:23:43.204391+00	
00000000-0000-0000-0000-000000000000	90407125-9fa8-41d9-9919-c0726ef5579e	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:23:57.534786+00	
00000000-0000-0000-0000-000000000000	38ade552-ad53-4e24-acc5-57840296d336	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:26:37.445687+00	
00000000-0000-0000-0000-000000000000	1c2658f2-7a52-4c03-a613-f96003f7f27b	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:26:43.783366+00	
00000000-0000-0000-0000-000000000000	bd942a11-6f2d-485c-bae2-7e5838678483	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:27:02.497043+00	
00000000-0000-0000-0000-000000000000	6dacee1f-75c7-4836-811d-0aab629152a3	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:27:05.662518+00	
00000000-0000-0000-0000-000000000000	9e95c1cc-e703-4a13-84a8-4cbcdc86a760	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:28:23.321174+00	
00000000-0000-0000-0000-000000000000	0b067f86-4f61-4eb7-a025-5ccf242a9a17	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:32:11.19153+00	
00000000-0000-0000-0000-000000000000	9afb6f70-70ba-49e4-b95a-0f35cb605daa	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 06:35:10.709023+00	
00000000-0000-0000-0000-000000000000	2c26b05b-fd36-4200-afd4-6a50781c1398	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-18 07:19:24.434449+00	
00000000-0000-0000-0000-000000000000	db37522a-91e2-4c5b-99a9-35dda44156c3	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 14:39:39.568868+00	
00000000-0000-0000-0000-000000000000	283f9cd3-b3b1-4cb5-8564-25b0966fe313	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 15:39:20.648325+00	
00000000-0000-0000-0000-000000000000	2ea06265-81d1-4ac7-91b7-18cf23b54ff4	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 15:39:20.653855+00	
00000000-0000-0000-0000-000000000000	8f463876-ff5e-4603-9c2b-639db5b32513	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 15:55:41.115474+00	
00000000-0000-0000-0000-000000000000	354412ee-264f-4b5e-a4c2-51c6684fa8fd	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 16:24:42.857194+00	
00000000-0000-0000-0000-000000000000	2ddbb523-70d5-4816-bb1f-567e5e111393	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 16:24:42.865159+00	
00000000-0000-0000-0000-000000000000	b448dca2-cb5d-485c-8eb3-618ad70ed2c9	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 16:24:56.859668+00	
00000000-0000-0000-0000-000000000000	15b2149d-7064-419b-b6e5-13f7afa9a479	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 16:37:59.339146+00	
00000000-0000-0000-0000-000000000000	1fbb0aea-0de1-4a67-95c9-c21068d5cae2	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 16:37:59.340013+00	
00000000-0000-0000-0000-000000000000	21dd755d-bba9-4c5c-b12c-d3eb12f61e82	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jan.owsik@wojtyczka.com","user_id":"2d02cc84-294c-41ca-a141-ff128b91c271","user_phone":""}}	2025-04-22 16:45:59.932628+00	
00000000-0000-0000-0000-000000000000	acdeff58-8d50-4022-8904-af3b93053b67	{"action":"login","actor_id":"2d02cc84-294c-41ca-a141-ff128b91c271","actor_username":"jan.owsik@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 16:46:24.545126+00	
00000000-0000-0000-0000-000000000000	35cd06b8-cc6b-411e-93aa-69365f63d540	{"action":"login","actor_id":"2d02cc84-294c-41ca-a141-ff128b91c271","actor_username":"jan.owsik@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 16:55:26.367884+00	
00000000-0000-0000-0000-000000000000	c723c944-c232-45ab-a4ce-c6337b38737d	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:04:06.170802+00	
00000000-0000-0000-0000-000000000000	2833e7ad-b779-4bfc-9d97-e69aae46b0ca	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo1@gmail.com","user_id":"2e3ea592-e573-4e43-9688-a590c92b39c1"}}	2025-04-22 17:06:09.841407+00	
00000000-0000-0000-0000-000000000000	79b2d59f-70f9-4aba-b529-8bad9f48c2ce	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo2@gmail.com","user_id":"a788ebea-ec97-470f-b4af-7560187235f8","user_phone":""}}	2025-04-22 17:06:23.42546+00	
00000000-0000-0000-0000-000000000000	6c1eb724-a22d-457e-9943-b92b5544de14	{"action":"login","actor_id":"a788ebea-ec97-470f-b4af-7560187235f8","actor_username":"pierdololo2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:06:30.142343+00	
00000000-0000-0000-0000-000000000000	fb9cd0d2-6c59-4552-bf6d-a5f22a9641d2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.test1@wojtyczka.com","user_id":"d966d39e-ba0a-4aa9-af86-ecceca2cf6e8","user_phone":""}}	2025-04-22 17:13:32.531716+00	
00000000-0000-0000-0000-000000000000	96f707d0-a324-4a67-b311-d265fa9c22ff	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.stefan@wojtyczka.com","user_id":"529ef185-ccec-4f37-957c-74d97294d127","user_phone":""}}	2025-04-22 17:13:32.564145+00	
00000000-0000-0000-0000-000000000000	98215a4a-db91-46d4-ad86-a4c961c374a8	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.jurek@wojtyczka.com","user_id":"75d6b32d-e6aa-455d-89f4-52dac1915e96","user_phone":""}}	2025-04-22 17:13:32.564591+00	
00000000-0000-0000-0000-000000000000	41677f5b-3bab-438e-ba21-f8c5a66700eb	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo1@gmail.com","user_id":"2e3ea592-e573-4e43-9688-a590c92b39c1","user_phone":""}}	2025-04-22 17:13:32.565201+00	
00000000-0000-0000-0000-000000000000	83b698f9-d5bc-4c69-867e-cce589398e07	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.admin@wojtyczka.com","user_id":"8a5b3fd7-c692-4d4a-8433-58315cb3301a","user_phone":""}}	2025-04-22 17:13:32.568259+00	
00000000-0000-0000-0000-000000000000	9c6c01a2-706c-49a3-8092-5745a3acce85	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo2@gmail.com","user_id":"a788ebea-ec97-470f-b4af-7560187235f8","user_phone":""}}	2025-04-22 17:13:32.581202+00	
00000000-0000-0000-0000-000000000000	00dafd4e-a5fd-4ac8-9751-bee894e7d185	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jan.owsik@wojtyczka.com","user_id":"2d02cc84-294c-41ca-a141-ff128b91c271","user_phone":""}}	2025-04-22 17:13:32.598095+00	
00000000-0000-0000-0000-000000000000	30527ea5-7d7a-432e-ab82-b6165301453f	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:13:53.52362+00	
00000000-0000-0000-0000-000000000000	d1403156-9f82-4a45-a3cc-8c7fff16c810	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:20:15.99359+00	
00000000-0000-0000-0000-000000000000	0ca19d37-3229-4442-bede-46424d8b97bc	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:21:55.576626+00	
00000000-0000-0000-0000-000000000000	9c705018-d34c-4abb-bac0-49461430f0e0	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 17:39:17.593555+00	
00000000-0000-0000-0000-000000000000	85edecdb-1c2a-4075-bf91-fa40a54d7c2d	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 19:18:09.960634+00	
00000000-0000-0000-0000-000000000000	56ec31e2-caa8-4b8b-ba2f-68fcaa435e6c	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 19:20:06.077686+00	
00000000-0000-0000-0000-000000000000	ccb3ae50-dc5a-4006-b422-36f1d74c6fd5	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 19:20:06.079494+00	
00000000-0000-0000-0000-000000000000	c39cdd5b-cc43-461f-a16a-ef5e83c6002c	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 19:20:06.127138+00	
00000000-0000-0000-0000-000000000000	b0edb4e7-9c92-48f2-98d3-0ebeafdac63b	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 19:20:06.21056+00	
00000000-0000-0000-0000-000000000000	b56d7e3d-c100-4337-a2ff-1b5ec480e709	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 19:49:05.077774+00	
00000000-0000-0000-0000-000000000000	9224b4b4-666c-4e3a-95ca-6f8ed9f66a97	{"action":"user_signedup","actor_id":"68f52d2b-56e5-4e82-b715-2efc83fc6199","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 20:02:58.203389+00	
00000000-0000-0000-0000-000000000000	855a7b1e-3d71-45eb-924d-ddace85f7826	{"action":"login","actor_id":"68f52d2b-56e5-4e82-b715-2efc83fc6199","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:02:58.211696+00	
00000000-0000-0000-0000-000000000000	22c6cb53-0a99-4b44-ab51-4e21e3eb0fbc	{"action":"login","actor_id":"68f52d2b-56e5-4e82-b715-2efc83fc6199","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:02:58.308643+00	
00000000-0000-0000-0000-000000000000	12ed9d97-1ab3-433d-9baa-b657614ff883	{"action":"login","actor_id":"68f52d2b-56e5-4e82-b715-2efc83fc6199","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:03:53.644854+00	
00000000-0000-0000-0000-000000000000	422ed0a1-4e0a-412b-8ccc-c064edf84153	{"action":"user_signedup","actor_id":"6ee63d9c-0345-4a81-adba-34b4a06a1b91","actor_username":"pawel.test3@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 20:05:34.807264+00	
00000000-0000-0000-0000-000000000000	2b9e815f-9bad-4a2b-b223-1110f87509e2	{"action":"login","actor_id":"6ee63d9c-0345-4a81-adba-34b4a06a1b91","actor_username":"pawel.test3@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:05:34.810678+00	
00000000-0000-0000-0000-000000000000	a09845d5-3b63-4ef2-860d-4043226eac0f	{"action":"login","actor_id":"6ee63d9c-0345-4a81-adba-34b4a06a1b91","actor_username":"pawel.test3@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:05:34.877741+00	
00000000-0000-0000-0000-000000000000	80d32e06-922b-48fa-b8b1-05d9664a46b0	{"action":"login","actor_id":"6ee63d9c-0345-4a81-adba-34b4a06a1b91","actor_username":"pawel.test3@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:09:34.452176+00	
00000000-0000-0000-0000-000000000000	6aab639c-c1aa-4a8f-ad8d-acc35723a605	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:14:00.563567+00	
00000000-0000-0000-0000-000000000000	8cd2ecbf-ec41-400a-8e98-27da2b036e7f	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:20:20.939474+00	
00000000-0000-0000-0000-000000000000	f70e9425-19f8-46ea-9f19-3a85b0a11217	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:21:51.095556+00	
00000000-0000-0000-0000-000000000000	38c61623-a6c4-4f0c-9df6-ef44145e98b6	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 20:22:46.019318+00	
00000000-0000-0000-0000-000000000000	e3ec6ecb-fa58-4de3-8e45-fe9e1a507709	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 20:22:46.01999+00	
00000000-0000-0000-0000-000000000000	184624fc-57f2-4c46-a06d-d536c2727797	{"action":"user_signedup","actor_id":"ed952962-a269-41e1-a5d7-7b501bdcb70e","actor_username":"pawel.test4@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 20:26:09.735306+00	
00000000-0000-0000-0000-000000000000	3a4a67fd-91e6-48bc-be88-792be8a61e4a	{"action":"login","actor_id":"ed952962-a269-41e1-a5d7-7b501bdcb70e","actor_username":"pawel.test4@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:26:09.740549+00	
00000000-0000-0000-0000-000000000000	607747ff-14f3-4e32-b5c6-e4485ddeaef3	{"action":"login","actor_id":"ed952962-a269-41e1-a5d7-7b501bdcb70e","actor_username":"pawel.test4@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:26:09.813444+00	
00000000-0000-0000-0000-000000000000	90881f0d-d717-4b3a-bcb4-3657438738e5	{"action":"login","actor_id":"ed952962-a269-41e1-a5d7-7b501bdcb70e","actor_username":"pawel.test4@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:27:49.669313+00	
00000000-0000-0000-0000-000000000000	8828a0c1-4159-4f2d-8573-1686ca902cae	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:31:51.071568+00	
00000000-0000-0000-0000-000000000000	06678828-84ea-4a71-8230-ff9f05c7e541	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:33:39.230375+00	
00000000-0000-0000-0000-000000000000	b7b283c2-6799-4148-b6a0-0e27bdee9000	{"action":"user_signedup","actor_id":"d77bdd82-dc53-4b50-80e6-1cc3c88e4c52","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 20:35:44.009567+00	
00000000-0000-0000-0000-000000000000	58155ff9-3416-4598-9d52-30b6400401d3	{"action":"login","actor_id":"d77bdd82-dc53-4b50-80e6-1cc3c88e4c52","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:35:44.017369+00	
00000000-0000-0000-0000-000000000000	500cb1f6-92f7-48c8-94c7-68e257d2f359	{"action":"login","actor_id":"d77bdd82-dc53-4b50-80e6-1cc3c88e4c52","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:35:44.084868+00	
00000000-0000-0000-0000-000000000000	9f23e0d4-e7fe-4912-843b-204223ad00f7	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.11234@wojtyczka.com","user_id":"ce89a53d-d420-4cdd-a2ca-02e5f2a1c74c"}}	2025-04-22 20:36:10.236693+00	
00000000-0000-0000-0000-000000000000	c359439c-dcfe-42a7-9926-885c6fb314a3	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:37:44.671846+00	
00000000-0000-0000-0000-000000000000	394ffce6-f700-4636-a28b-9b7851396c26	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 20:52:41.606059+00	
00000000-0000-0000-0000-000000000000	458859ba-11e4-405d-a5d9-360f412feaeb	{"action":"user_signedup","actor_id":"e2612c0b-5599-4718-b891-591a34766e8f","actor_username":"pierdololo2@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 21:06:14.220427+00	
00000000-0000-0000-0000-000000000000	2e3a371d-63f9-4f8b-bb2f-27e8f7c85408	{"action":"login","actor_id":"e2612c0b-5599-4718-b891-591a34766e8f","actor_username":"pierdololo2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:06:14.224422+00	
00000000-0000-0000-0000-000000000000	57d7d40b-7b80-4450-b76b-d0ef355317f1	{"action":"login","actor_id":"e2612c0b-5599-4718-b891-591a34766e8f","actor_username":"pierdololo2@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:06:14.289353+00	
00000000-0000-0000-0000-000000000000	d9745166-0b71-4d0d-ba81-5538e7050c05	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:13:08.638483+00	
00000000-0000-0000-0000-000000000000	39be0062-dd36-481e-b23a-11e21a6e3a9b	{"action":"user_signedup","actor_id":"3f4ce65f-b628-4a5c-8a99-009d51f65950","actor_username":"pierdololo3@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 21:17:18.876144+00	
00000000-0000-0000-0000-000000000000	3a45a536-fd93-4521-8753-f2f889faebff	{"action":"login","actor_id":"3f4ce65f-b628-4a5c-8a99-009d51f65950","actor_username":"pierdololo3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:17:18.882465+00	
00000000-0000-0000-0000-000000000000	492b74d0-ae35-44b0-84e9-68c05f0ef9ce	{"action":"login","actor_id":"3f4ce65f-b628-4a5c-8a99-009d51f65950","actor_username":"pierdololo3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:17:18.964838+00	
00000000-0000-0000-0000-000000000000	34095a76-7c0a-4772-8bae-b06ed169b40c	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:20:30.640703+00	
00000000-0000-0000-0000-000000000000	b0472976-e51f-4d8d-9956-9579135dc4ff	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:20:48.894299+00	
00000000-0000-0000-0000-000000000000	f484b049-1253-4355-a81b-66ca09dd40ea	{"action":"user_repeated_signup","actor_id":"3f4ce65f-b628-4a5c-8a99-009d51f65950","actor_username":"pierdololo3@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-04-22 21:46:28.315244+00	
00000000-0000-0000-0000-000000000000	44212c0a-334e-4ce8-839a-2130134adbee	{"action":"user_signedup","actor_id":"e1e548e3-2b5f-4c3a-8dec-d547fc27e924","actor_username":"pierdololo4@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 21:46:32.973378+00	
00000000-0000-0000-0000-000000000000	9a105f63-704a-4b59-bdf7-d5b884ad86ff	{"action":"login","actor_id":"e1e548e3-2b5f-4c3a-8dec-d547fc27e924","actor_username":"pierdololo4@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:46:32.976622+00	
00000000-0000-0000-0000-000000000000	e69faead-3333-4444-9f33-1af35d7f0a94	{"action":"login","actor_id":"e1e548e3-2b5f-4c3a-8dec-d547fc27e924","actor_username":"pierdololo4@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:46:33.053496+00	
00000000-0000-0000-0000-000000000000	3e797dba-579d-4001-9fe6-7e51f7aff692	{"action":"token_refreshed","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 21:49:11.848372+00	
00000000-0000-0000-0000-000000000000	ffa4b002-1037-4d5c-a43c-24f3e8cd8dac	{"action":"token_revoked","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"token"}	2025-04-22 21:49:11.849969+00	
00000000-0000-0000-0000-000000000000	cf46bb29-36f0-474e-bc77-680f815ed346	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:51:55.760887+00	
00000000-0000-0000-0000-000000000000	a7d1eb2a-b8c2-4ded-8d4f-4b47ed824501	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:54:19.007291+00	
00000000-0000-0000-0000-000000000000	960238a4-e3b5-4179-9cb1-42a18dd79177	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:55:39.728762+00	
00000000-0000-0000-0000-000000000000	8ae79bd8-a42d-4cc8-b864-2b7fa956d077	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:56:50.025628+00	
00000000-0000-0000-0000-000000000000	0503fcd8-276c-435e-854f-828e4cd6f131	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:58:34.437636+00	
00000000-0000-0000-0000-000000000000	139ee8fb-9216-414c-bfe2-7844bb8c3ba1	{"action":"login","actor_id":"64790d27-7751-45d5-a439-acd531e9fb33","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 21:59:43.934766+00	
00000000-0000-0000-0000-000000000000	eb78edea-e253-4721-863e-8cb9834bd522	{"action":"login","actor_id":"e1e548e3-2b5f-4c3a-8dec-d547fc27e924","actor_username":"pierdololo4@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:01:03.177022+00	
00000000-0000-0000-0000-000000000000	e857fc70-8834-48a5-a76c-71e0d9211ede	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo4@gmail.com","user_id":"e1e548e3-2b5f-4c3a-8dec-d547fc27e924","user_phone":""}}	2025-04-22 22:24:21.334075+00	
00000000-0000-0000-0000-000000000000	80ae2401-ad8e-47e5-8f86-5e71a43a37a1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.test3@wojtyczka.com","user_id":"6ee63d9c-0345-4a81-adba-34b4a06a1b91","user_phone":""}}	2025-04-22 22:24:21.368942+00	
00000000-0000-0000-0000-000000000000	0ba8a794-e07a-4a9a-b651-7233c09e4e49	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo1@gmail.com","user_id":"d77bdd82-dc53-4b50-80e6-1cc3c88e4c52","user_phone":""}}	2025-04-22 22:24:21.369225+00	
00000000-0000-0000-0000-000000000000	d160e8ad-26d0-4e67-91f7-fcbdc4d47869	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.test4@wojtyczka.com","user_id":"ed952962-a269-41e1-a5d7-7b501bdcb70e","user_phone":""}}	2025-04-22 22:24:21.370903+00	
00000000-0000-0000-0000-000000000000	51060646-71a9-463e-bec9-72ba680bf91a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo2@gmail.com","user_id":"e2612c0b-5599-4718-b891-591a34766e8f","user_phone":""}}	2025-04-22 22:24:21.371097+00	
00000000-0000-0000-0000-000000000000	6c513fd0-653e-466f-b2a3-04e28bb16309	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.11234@wojtyczka.com","user_id":"ce89a53d-d420-4cdd-a2ca-02e5f2a1c74c","user_phone":""}}	2025-04-22 22:24:21.370951+00	
00000000-0000-0000-0000-000000000000	712ac1dc-2206-4350-8869-90671e19917c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pierdololo3@gmail.com","user_id":"3f4ce65f-b628-4a5c-8a99-009d51f65950","user_phone":""}}	2025-04-22 22:24:21.38644+00	
00000000-0000-0000-0000-000000000000	7d634b01-e629-41b7-9a17-4927914041a0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.test2@wojtyczka.com","user_id":"68f52d2b-56e5-4e82-b715-2efc83fc6199","user_phone":""}}	2025-04-22 22:24:21.403088+00	
00000000-0000-0000-0000-000000000000	c8485db3-a367-44fc-a4e6-abf09681d467	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel@wojtyczka.com","user_id":"64790d27-7751-45d5-a439-acd531e9fb33","user_phone":""}}	2025-04-22 22:24:21.403593+00	
00000000-0000-0000-0000-000000000000	408b1419-03a2-4a4a-a25d-c73f232733c2	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel@wojtyczka.com","user_id":"8c733d3c-0b4f-4966-b252-497fdaa0992f"}}	2025-04-22 22:29:28.21991+00	
00000000-0000-0000-0000-000000000000	b731284b-7bd6-4c61-aa29-b845110229e0	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel.test1@wojtyczka.com","user_id":"136e942b-96f6-4180-bad7-a9a768e09e9a","user_phone":""}}	2025-04-22 22:29:44.934778+00	
00000000-0000-0000-0000-000000000000	d197cb95-1c4b-4bd5-8164-56dee00f7a9f	{"action":"user_signedup","actor_id":"98f8b807-8353-441f-a427-7ff41cb83010","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 22:30:00.576765+00	
00000000-0000-0000-0000-000000000000	abfd5551-7ce3-46f0-905f-e3e087a24843	{"action":"login","actor_id":"98f8b807-8353-441f-a427-7ff41cb83010","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:30:00.579967+00	
00000000-0000-0000-0000-000000000000	5eb71471-36f1-4d04-b15f-c1428e76a4ba	{"action":"login","actor_id":"98f8b807-8353-441f-a427-7ff41cb83010","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:30:00.670197+00	
00000000-0000-0000-0000-000000000000	c165e73b-d4ef-48c0-aa8d-682dca37ae1e	{"action":"login","actor_id":"98f8b807-8353-441f-a427-7ff41cb83010","actor_username":"pawel.test2@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:32:34.0668+00	
00000000-0000-0000-0000-000000000000	ba8bb4c4-d5d4-4544-b61f-97c50ee3d203	{"action":"user_signedup","actor_id":"6ef841e6-7821-4b0b-9dd1-4fca83a08264","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 22:35:22.345874+00	
00000000-0000-0000-0000-000000000000	07444a05-8d10-469b-8ce0-fcdc243c5296	{"action":"login","actor_id":"6ef841e6-7821-4b0b-9dd1-4fca83a08264","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:35:22.350118+00	
00000000-0000-0000-0000-000000000000	f00428a1-7c62-49ca-8f84-98c97219d897	{"action":"login","actor_id":"6ef841e6-7821-4b0b-9dd1-4fca83a08264","actor_username":"pierdololo1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:35:22.413908+00	
00000000-0000-0000-0000-000000000000	2f179022-946a-4a1a-9d92-555186a16b78	{"action":"user_signedup","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 22:37:23.771242+00	
00000000-0000-0000-0000-000000000000	073a4d7d-b108-452c-8eea-1e51ed5553ea	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:37:23.774708+00	
00000000-0000-0000-0000-000000000000	296d3f95-2030-4066-85fc-9662ac3d867e	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:37:23.836678+00	
00000000-0000-0000-0000-000000000000	3c8ae919-60c2-4d95-af9b-5986db432c84	{"action":"user_recovery_requested","actor_id":"8c733d3c-0b4f-4966-b252-497fdaa0992f","actor_username":"pawel@wojtyczka.com","actor_via_sso":false,"log_type":"user"}	2025-04-22 22:40:31.695932+00	
00000000-0000-0000-0000-000000000000	8622a86a-b1c7-4dad-a6ce-762a6958875f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"pawel@wojtyczka.com","user_id":"8c733d3c-0b4f-4966-b252-497fdaa0992f","user_phone":""}}	2025-04-22 22:40:37.461499+00	
00000000-0000-0000-0000-000000000000	78c46949-fc61-4584-8c8e-869c7a36cb57	{"action":"user_signedup","actor_id":"e0470a72-d65f-4b08-9989-212d76720a7d","actor_username":"pawel.1@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 22:40:57.307576+00	
00000000-0000-0000-0000-000000000000	02573d2d-25d3-4ed4-bde6-664c1b5bda06	{"action":"login","actor_id":"e0470a72-d65f-4b08-9989-212d76720a7d","actor_username":"pawel.1@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:40:57.310545+00	
00000000-0000-0000-0000-000000000000	6687240b-ba7f-420f-b22a-9e539b6eb259	{"action":"login","actor_id":"e0470a72-d65f-4b08-9989-212d76720a7d","actor_username":"pawel.1@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:40:57.373879+00	
00000000-0000-0000-0000-000000000000	c95f1829-97fe-4e09-bd12-02e83ce5b554	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:42:42.140886+00	
00000000-0000-0000-0000-000000000000	d4cd673d-45dd-42e2-97c6-084c0c99fad9	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:48:24.135751+00	
00000000-0000-0000-0000-000000000000	ef9149f2-1b8d-46ce-863f-c7c451f994fd	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 22:59:22.219735+00	
00000000-0000-0000-0000-000000000000	2628a7dc-0d47-4c74-95a6-9869791cbd8d	{"action":"user_repeated_signup","actor_id":"136e942b-96f6-4180-bad7-a9a768e09e9a","actor_username":"pawel.test1@wojtyczka.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-04-22 23:23:04.008838+00	
00000000-0000-0000-0000-000000000000	b5c496fe-9eee-4352-8849-2b64c5444f62	{"action":"user_signedup","actor_id":"d5ffb06c-010a-41a0-8527-673d498ed225","actor_username":"test1@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-22 23:23:16.222769+00	
00000000-0000-0000-0000-000000000000	b8907e58-1e36-4c61-a9c1-18dfe03bf7a0	{"action":"login","actor_id":"d5ffb06c-010a-41a0-8527-673d498ed225","actor_username":"test1@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 23:23:16.22694+00	
00000000-0000-0000-0000-000000000000	c8f7f4f8-8291-44ca-b2c4-60168ac402e9	{"action":"login","actor_id":"d5ffb06c-010a-41a0-8527-673d498ed225","actor_username":"test1@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-22 23:23:16.303037+00	
00000000-0000-0000-0000-000000000000	2ed83bc0-f938-41fa-9f2a-618770afb282	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-23 00:06:06.373235+00	
00000000-0000-0000-0000-000000000000	4a75e546-bf4f-47e8-8303-9458c5e605f2	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-23 00:13:05.15803+00	
00000000-0000-0000-0000-000000000000	2d517be0-3c61-4a4b-8842-e2e4691357e5	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-23 01:00:17.662366+00	
00000000-0000-0000-0000-000000000000	4d79c5f4-e5ee-4058-b960-e45e614aac01	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 07:32:54.668334+00	
00000000-0000-0000-0000-000000000000	5ec2141a-a712-4876-a14f-ae98c8d0d5be	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 07:32:54.689802+00	
00000000-0000-0000-0000-000000000000	95551603-38f5-4812-ad5b-2cb5179cb025	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 07:32:55.107785+00	
00000000-0000-0000-0000-000000000000	82c3580b-9d84-4d56-85a0-c28f0b448d69	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 07:32:55.109499+00	
00000000-0000-0000-0000-000000000000	b1bd339e-3b5d-4a89-891c-d97be4299397	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-23 07:45:01.698699+00	
00000000-0000-0000-0000-000000000000	513e780e-d453-4582-880b-06b1e8dbd1d6	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 08:43:44.985808+00	
00000000-0000-0000-0000-000000000000	0bd6cc7a-db51-4677-a40f-ada1e2877c50	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-23 08:43:44.989499+00	
00000000-0000-0000-0000-000000000000	11df70f7-168b-4e76-8cb2-d3600186a7dc	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-23 12:13:46.276298+00	
00000000-0000-0000-0000-000000000000	30476a0f-5bd4-47f9-bedc-13eb94f24547	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 09:08:20.623663+00	
00000000-0000-0000-0000-000000000000	d81738cd-39be-487c-af3b-8f4398d27954	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 09:08:20.630543+00	
00000000-0000-0000-0000-000000000000	8dd29ce0-453d-4587-af82-f63c5f4f223d	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 09:08:58.997722+00	
00000000-0000-0000-0000-000000000000	7774d83e-f2d2-445b-80da-df6d57b5daa2	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 09:08:58.998528+00	
00000000-0000-0000-0000-000000000000	4551827d-7750-49a5-9d6c-2fb79396021f	{"action":"token_refreshed","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 10:46:16.731386+00	
00000000-0000-0000-0000-000000000000	699e61d4-a09f-4f5d-9d23-add739f87dba	{"action":"token_revoked","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"token"}	2025-04-24 10:46:16.740567+00	
00000000-0000-0000-0000-000000000000	1df6a498-34cc-44f9-98c2-c5b668975b72	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:14:43.130813+00	
00000000-0000-0000-0000-000000000000	be41a2ed-01fc-4229-b05f-d3e76aefcea9	{"action":"user_repeated_signup","actor_id":"136e942b-96f6-4180-bad7-a9a768e09e9a","actor_username":"pawel.test1@wojtyczka.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-04-24 11:20:28.337215+00	
00000000-0000-0000-0000-000000000000	5c123be6-d92a-4715-85ff-9f18c00b05e7	{"action":"user_signedup","actor_id":"1746fc93-97d9-454a-aa64-a44ff934172b","actor_username":"pawel.test100@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-24 11:20:33.917105+00	
00000000-0000-0000-0000-000000000000	5ccf64d4-eb62-4009-bdbe-754f1671a50e	{"action":"login","actor_id":"1746fc93-97d9-454a-aa64-a44ff934172b","actor_username":"pawel.test100@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:20:33.928544+00	
00000000-0000-0000-0000-000000000000	5c2e0dd8-581f-4f8d-a5e3-bcd08dbd2806	{"action":"login","actor_id":"1746fc93-97d9-454a-aa64-a44ff934172b","actor_username":"pawel.test100@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:20:34.011239+00	
00000000-0000-0000-0000-000000000000	74c1628b-5766-4566-b965-c10a19ff682a	{"action":"user_signedup","actor_id":"05cd3956-d893-46cd-b626-985bd3d3df32","actor_username":"pawel.test101@wojtyczka.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-04-24 11:22:52.281313+00	
00000000-0000-0000-0000-000000000000	53149cfb-2b5d-47df-8ee6-48749ae1cf41	{"action":"login","actor_id":"05cd3956-d893-46cd-b626-985bd3d3df32","actor_username":"pawel.test101@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:22:52.284006+00	
00000000-0000-0000-0000-000000000000	b657690e-afbd-40f2-bf23-b5600deff755	{"action":"login","actor_id":"05cd3956-d893-46cd-b626-985bd3d3df32","actor_username":"pawel.test101@wojtyczka.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:22:52.345911+00	
00000000-0000-0000-0000-000000000000	64006eb6-c3cd-48ee-8757-bd7d814340dc	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:24:27.716884+00	
00000000-0000-0000-0000-000000000000	0c1f3bee-d933-4e57-b772-bbd0ac933a25	{"action":"login","actor_id":"19cae141-9672-4e8e-847c-203b31ae5991","actor_username":"pawel.wojtyczka@asperit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-04-24 11:35:56.269825+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
136e942b-96f6-4180-bad7-a9a768e09e9a	136e942b-96f6-4180-bad7-a9a768e09e9a	{"sub": "136e942b-96f6-4180-bad7-a9a768e09e9a", "email": "pawel.test1@wojtyczka.com", "email_verified": false, "phone_verified": false}	email	2025-04-22 22:29:44.933752+00	2025-04-22 22:29:44.933804+00	2025-04-22 22:29:44.933804+00	9af805ab-d64e-4351-829a-2d6e10b3b929
98f8b807-8353-441f-a427-7ff41cb83010	98f8b807-8353-441f-a427-7ff41cb83010	{"sub": "98f8b807-8353-441f-a427-7ff41cb83010", "email": "pawel.test2@wojtyczka.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:30:00.504Z"}	email	2025-04-22 22:30:00.573406+00	2025-04-22 22:30:00.573432+00	2025-04-22 22:30:00.573432+00	615d80f1-e9e8-4e23-95eb-6bd9406f861f
6ef841e6-7821-4b0b-9dd1-4fca83a08264	6ef841e6-7821-4b0b-9dd1-4fca83a08264	{"sub": "6ef841e6-7821-4b0b-9dd1-4fca83a08264", "email": "pierdololo1@gmail.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:35:22.276Z"}	email	2025-04-22 22:35:22.343239+00	2025-04-22 22:35:22.343266+00	2025-04-22 22:35:22.343266+00	26265991-2f1f-404e-a015-c30b13b926b9
19cae141-9672-4e8e-847c-203b31ae5991	19cae141-9672-4e8e-847c-203b31ae5991	{"sub": "19cae141-9672-4e8e-847c-203b31ae5991", "email": "pawel.wojtyczka@asperit.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:37:23.707Z"}	email	2025-04-22 22:37:23.769611+00	2025-04-22 22:37:23.769636+00	2025-04-22 22:37:23.769636+00	3337a704-3655-4a37-b605-353ea906eabc
e0470a72-d65f-4b08-9989-212d76720a7d	e0470a72-d65f-4b08-9989-212d76720a7d	{"sub": "e0470a72-d65f-4b08-9989-212d76720a7d", "email": "pawel.1@wojtyczka.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:40:57.245Z"}	email	2025-04-22 22:40:57.305771+00	2025-04-22 22:40:57.305806+00	2025-04-22 22:40:57.305806+00	8e787488-233c-471a-a8c0-02979b2189d1
d5ffb06c-010a-41a0-8527-673d498ed225	d5ffb06c-010a-41a0-8527-673d498ed225	{"sub": "d5ffb06c-010a-41a0-8527-673d498ed225", "email": "test1@wojtyczka.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T23:23:16.145Z"}	email	2025-04-22 23:23:16.216344+00	2025-04-22 23:23:16.216401+00	2025-04-22 23:23:16.216401+00	a734d47f-d10b-4aa6-9cd9-44d383783963
1746fc93-97d9-454a-aa64-a44ff934172b	1746fc93-97d9-454a-aa64-a44ff934172b	{"sub": "1746fc93-97d9-454a-aa64-a44ff934172b", "email": "pawel.test100@wojtyczka.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-24T11:20:33.823Z"}	email	2025-04-24 11:20:33.91282+00	2025-04-24 11:20:33.91288+00	2025-04-24 11:20:33.91288+00	f929700d-1e5b-4590-baf0-911b3bced628
05cd3956-d893-46cd-b626-985bd3d3df32	05cd3956-d893-46cd-b626-985bd3d3df32	{"sub": "05cd3956-d893-46cd-b626-985bd3d3df32", "email": "pawel.test101@wojtyczka.com", "email_verified": false, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-24T11:22:52.213Z"}	email	2025-04-24 11:22:52.279655+00	2025-04-24 11:22:52.279685+00	2025-04-24 11:22:52.279685+00	52203fdb-0b66-4aa6-8f90-582569adfcf8
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
0406b811-63dd-421b-9290-e32d9ae5f17e	2025-04-22 22:30:00.590891+00	2025-04-22 22:30:00.590891+00	password	a8e4ed44-069e-4d8a-b6f5-3c83b05a4bac
c054afbf-25ac-42a5-bf5d-18c327d71b67	2025-04-22 22:30:00.674488+00	2025-04-22 22:30:00.674488+00	password	fa101b9a-eeb7-4744-80bf-17d9225042ec
12a30e1d-94f1-4744-a7d3-68a011be7e8e	2025-04-22 22:32:34.072435+00	2025-04-22 22:32:34.072435+00	password	69456a3c-c314-4c97-86da-01bcb184971e
ea1f03da-80d0-433a-91fa-99bae3ade53e	2025-04-22 22:35:22.352546+00	2025-04-22 22:35:22.352546+00	password	49599054-d289-40a8-9b11-3eb46413160a
c2b581f1-e43a-4382-9290-faa5d9f44011	2025-04-22 22:35:22.41704+00	2025-04-22 22:35:22.41704+00	password	0f4b7801-2949-4e10-a536-48674f4feca3
25cd06ed-b241-45fb-88a2-f80e9abcf59d	2025-04-22 22:37:23.776552+00	2025-04-22 22:37:23.776552+00	password	feb4828b-dda9-4151-8c06-f1151c4d9ecf
40862373-f37e-4bb6-881e-7c368379939c	2025-04-22 22:37:23.839476+00	2025-04-22 22:37:23.839476+00	password	349d7da4-17d3-4e90-bc21-c77b5beb8fd6
09b56488-6a38-45d3-b004-31772895d313	2025-04-22 22:40:57.313255+00	2025-04-22 22:40:57.313255+00	password	e1d2a2f3-f7d5-48a0-8b7a-e612bcc0164e
99b4670c-9d04-413c-bbaf-16b840d8f2da	2025-04-22 22:40:57.377209+00	2025-04-22 22:40:57.377209+00	password	7e0ed417-50f9-466e-bf62-81896c464eb6
8bd1dbae-ef0a-4fce-a105-6e31b50005c2	2025-04-22 22:42:42.143569+00	2025-04-22 22:42:42.143569+00	password	72f47921-cad4-49db-8ba6-b4bafd3f568c
04f96c2a-6bfd-47fa-84f4-f9528586ce34	2025-04-22 22:48:24.141723+00	2025-04-22 22:48:24.141723+00	password	75113f99-a2e5-4da8-9da6-afb1cb81699f
a00320dc-d3df-4c7a-a9e7-21df844b2373	2025-04-22 22:59:22.254478+00	2025-04-22 22:59:22.254478+00	password	5d0c60e4-3372-4621-aa6f-196a3dd9f7be
57e57732-eaab-4dce-8abb-90b67a3c3de6	2025-04-22 23:23:16.236742+00	2025-04-22 23:23:16.236742+00	password	3706e99d-4122-4675-9c14-7951b3d723f9
619d2d69-acce-4910-b0a3-183d0a23bdb6	2025-04-22 23:23:16.30535+00	2025-04-22 23:23:16.30535+00	password	074e18fb-f4d4-4078-9125-02ac51ecdace
a2cb4c5a-162d-46a5-8845-9f39571826f7	2025-04-23 00:06:06.393273+00	2025-04-23 00:06:06.393273+00	password	9d243f2b-5569-4191-98e7-4b522bfbab25
01301c77-d3f7-4d40-8e5e-c75e3e657788	2025-04-23 00:13:05.164745+00	2025-04-23 00:13:05.164745+00	password	abb33d1e-d94a-4625-9f6c-12c0e15d9a70
cca4666b-203b-4c10-a213-2ca1c4309c9e	2025-04-23 01:00:17.699996+00	2025-04-23 01:00:17.699996+00	password	89e9b284-a084-4782-9c5a-ea267b85aa99
5e864b96-1393-4e90-892f-67bce748c283	2025-04-23 07:45:01.904907+00	2025-04-23 07:45:01.904907+00	password	938d6c07-54a2-46b1-be9b-f30308e31ab6
15913bb2-d2df-4ba7-ac85-fe8d4d6cd54a	2025-04-23 12:13:46.326825+00	2025-04-23 12:13:46.326825+00	password	88214029-52c4-43e8-a083-741b007be1e9
34e733be-ad1a-42a3-96f6-99a28b27bdc9	2025-04-24 11:14:43.14618+00	2025-04-24 11:14:43.14618+00	password	412a3365-c62f-476b-836b-5a1e7f7f8d5a
1064a6de-c9a0-44a9-b90b-53dd59dcaeb3	2025-04-24 11:20:33.932189+00	2025-04-24 11:20:33.932189+00	password	dc9fbd91-abce-49ae-a56f-27ac5ff98929
8cb58c8e-3507-431d-a355-b7e4e3297572	2025-04-24 11:20:34.016242+00	2025-04-24 11:20:34.016242+00	password	a2c5fde8-3ea2-4791-bd6c-c95bc888374f
aa295306-98b1-41a4-aee4-af4a1cb3bcbe	2025-04-24 11:22:52.285917+00	2025-04-24 11:22:52.285917+00	password	5311c6ac-7619-4e12-a688-8d9fdf3f40cd
bae0ca0e-f31a-4c78-8726-1132231a92ce	2025-04-24 11:22:52.348286+00	2025-04-24 11:22:52.348286+00	password	05c293e7-73ab-4119-889a-f2a314e5695a
0fbedb74-3b81-4106-b263-8f257172fa64	2025-04-24 11:24:27.722149+00	2025-04-24 11:24:27.722149+00	password	a5c7d0b5-aec1-4116-889f-09201365ecd3
b55018a7-9b55-4a67-af25-3d5064290a6c	2025-04-24 11:35:56.288182+00	2025-04-24 11:35:56.288182+00	password	270fc299-48cc-43ee-ac13-0b690c9e810b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	153	iHX3LShRb1AxWWy5nhK3pQ	98f8b807-8353-441f-a427-7ff41cb83010	f	2025-04-22 22:30:00.584074+00	2025-04-22 22:30:00.584074+00	\N	0406b811-63dd-421b-9290-e32d9ae5f17e
00000000-0000-0000-0000-000000000000	154	j5IIFm8nUTeIlx0_feKB_Q	98f8b807-8353-441f-a427-7ff41cb83010	f	2025-04-22 22:30:00.672522+00	2025-04-22 22:30:00.672522+00	\N	c054afbf-25ac-42a5-bf5d-18c327d71b67
00000000-0000-0000-0000-000000000000	155	FxliumyIuoodmdNHeR9IVw	98f8b807-8353-441f-a427-7ff41cb83010	f	2025-04-22 22:32:34.070212+00	2025-04-22 22:32:34.070212+00	\N	12a30e1d-94f1-4744-a7d3-68a011be7e8e
00000000-0000-0000-0000-000000000000	156	_O4MNBROvl5JLXan2pyiwg	6ef841e6-7821-4b0b-9dd1-4fca83a08264	f	2025-04-22 22:35:22.351271+00	2025-04-22 22:35:22.351271+00	\N	ea1f03da-80d0-433a-91fa-99bae3ade53e
00000000-0000-0000-0000-000000000000	157	xJJi0YBZuDTdCi2LvkbzkA	6ef841e6-7821-4b0b-9dd1-4fca83a08264	f	2025-04-22 22:35:22.415727+00	2025-04-22 22:35:22.415727+00	\N	c2b581f1-e43a-4382-9290-faa5d9f44011
00000000-0000-0000-0000-000000000000	158	kDQUuiXsC45PT2FXsKHUrw	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-22 22:37:23.77578+00	2025-04-22 22:37:23.77578+00	\N	25cd06ed-b241-45fb-88a2-f80e9abcf59d
00000000-0000-0000-0000-000000000000	159	HdzpFW7tzUHFoTnPSmv0Xw	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-22 22:37:23.838513+00	2025-04-22 22:37:23.838513+00	\N	40862373-f37e-4bb6-881e-7c368379939c
00000000-0000-0000-0000-000000000000	160	RKauU3f6RiUStX39kCpiTA	e0470a72-d65f-4b08-9989-212d76720a7d	f	2025-04-22 22:40:57.312084+00	2025-04-22 22:40:57.312084+00	\N	09b56488-6a38-45d3-b004-31772895d313
00000000-0000-0000-0000-000000000000	161	ct83G1guQxi4WQkCBDZvvQ	e0470a72-d65f-4b08-9989-212d76720a7d	f	2025-04-22 22:40:57.375857+00	2025-04-22 22:40:57.375857+00	\N	99b4670c-9d04-413c-bbaf-16b840d8f2da
00000000-0000-0000-0000-000000000000	162	S01i-pePeNzyjC6O-7wvTg	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-22 22:42:42.142454+00	2025-04-22 22:42:42.142454+00	\N	8bd1dbae-ef0a-4fce-a105-6e31b50005c2
00000000-0000-0000-0000-000000000000	163	RdsNWz-FYbTa6aXgjB3jiA	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-22 22:48:24.137785+00	2025-04-22 22:48:24.137785+00	\N	04f96c2a-6bfd-47fa-84f4-f9528586ce34
00000000-0000-0000-0000-000000000000	164	hEph2MW2JHThwUepTVpu1g	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-22 22:59:22.236407+00	2025-04-22 22:59:22.236407+00	\N	a00320dc-d3df-4c7a-a9e7-21df844b2373
00000000-0000-0000-0000-000000000000	165	Y7-kDtKzkWUluUQf2rYYFQ	d5ffb06c-010a-41a0-8527-673d498ed225	f	2025-04-22 23:23:16.231382+00	2025-04-22 23:23:16.231382+00	\N	57e57732-eaab-4dce-8abb-90b67a3c3de6
00000000-0000-0000-0000-000000000000	166	_jWtiwr4IJmvi_iUtT7WXQ	d5ffb06c-010a-41a0-8527-673d498ed225	f	2025-04-22 23:23:16.304251+00	2025-04-22 23:23:16.304251+00	\N	619d2d69-acce-4910-b0a3-183d0a23bdb6
00000000-0000-0000-0000-000000000000	169	5PffmChQoEhRqbYRpm6Z-A	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-23 01:00:17.684385+00	2025-04-23 01:00:17.684385+00	\N	cca4666b-203b-4c10-a213-2ca1c4309c9e
00000000-0000-0000-0000-000000000000	167	VWN_HDJfEyfUxLuk9iIyjQ	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-23 00:06:06.383182+00	2025-04-23 07:32:54.697099+00	\N	a2cb4c5a-162d-46a5-8845-9f39571826f7
00000000-0000-0000-0000-000000000000	170	3n-MfJ9cT2TzdIrqQX-95A	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-23 07:32:54.724625+00	2025-04-23 07:32:54.724625+00	VWN_HDJfEyfUxLuk9iIyjQ	a2cb4c5a-162d-46a5-8845-9f39571826f7
00000000-0000-0000-0000-000000000000	168	IIBmJK8WszZQh_UcNUgPXw	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-23 00:13:05.160558+00	2025-04-23 07:32:55.110293+00	\N	01301c77-d3f7-4d40-8e5e-c75e3e657788
00000000-0000-0000-0000-000000000000	171	01qrkD8fWQQdiYPjF-YcdA	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-23 07:32:55.11087+00	2025-04-23 07:32:55.11087+00	IIBmJK8WszZQh_UcNUgPXw	01301c77-d3f7-4d40-8e5e-c75e3e657788
00000000-0000-0000-0000-000000000000	203	7sWhQstapJLKgR-0w-vS-w	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-23 07:45:01.868076+00	2025-04-23 08:43:44.990071+00	\N	5e864b96-1393-4e90-892f-67bce748c283
00000000-0000-0000-0000-000000000000	205	PLHnqFJqdF_BXulSN42M3w	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-23 12:13:46.30914+00	2025-04-24 09:08:20.631345+00	\N	15913bb2-d2df-4ba7-ac85-fe8d4d6cd54a
00000000-0000-0000-0000-000000000000	238	SruDLRVTmM3he1mSm6o45Q	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-24 09:08:20.635923+00	2025-04-24 09:08:20.635923+00	PLHnqFJqdF_BXulSN42M3w	15913bb2-d2df-4ba7-ac85-fe8d4d6cd54a
00000000-0000-0000-0000-000000000000	204	MMggWEsuNL-8_DjcSEVdVA	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-23 08:43:44.996146+00	2025-04-24 09:08:58.999124+00	7sWhQstapJLKgR-0w-vS-w	5e864b96-1393-4e90-892f-67bce748c283
00000000-0000-0000-0000-000000000000	239	UFcmyGu19sxx-3TRONZOlA	19cae141-9672-4e8e-847c-203b31ae5991	t	2025-04-24 09:08:58.999503+00	2025-04-24 10:46:16.741748+00	MMggWEsuNL-8_DjcSEVdVA	5e864b96-1393-4e90-892f-67bce748c283
00000000-0000-0000-0000-000000000000	240	8sf1a2rIzSr6bZTTFHHPdg	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-24 10:46:16.747379+00	2025-04-24 10:46:16.747379+00	UFcmyGu19sxx-3TRONZOlA	5e864b96-1393-4e90-892f-67bce748c283
00000000-0000-0000-0000-000000000000	241	GnKg1XdJuivoryLV-5_yrA	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-24 11:14:43.142272+00	2025-04-24 11:14:43.142272+00	\N	34e733be-ad1a-42a3-96f6-99a28b27bdc9
00000000-0000-0000-0000-000000000000	242	f_w0af3ggscQ8BgG4oiLcA	1746fc93-97d9-454a-aa64-a44ff934172b	f	2025-04-24 11:20:33.930446+00	2025-04-24 11:20:33.930446+00	\N	1064a6de-c9a0-44a9-b90b-53dd59dcaeb3
00000000-0000-0000-0000-000000000000	243	o-Ja0bFvrDwx-R-CSPuuVg	1746fc93-97d9-454a-aa64-a44ff934172b	f	2025-04-24 11:20:34.015171+00	2025-04-24 11:20:34.015171+00	\N	8cb58c8e-3507-431d-a355-b7e4e3297572
00000000-0000-0000-0000-000000000000	244	uY1sqmkSfansHUCtDXhC6Q	05cd3956-d893-46cd-b626-985bd3d3df32	f	2025-04-24 11:22:52.285022+00	2025-04-24 11:22:52.285022+00	\N	aa295306-98b1-41a4-aee4-af4a1cb3bcbe
00000000-0000-0000-0000-000000000000	245	HVxlhF6Wp4jCMD6kPecudA	05cd3956-d893-46cd-b626-985bd3d3df32	f	2025-04-24 11:22:52.347323+00	2025-04-24 11:22:52.347323+00	\N	bae0ca0e-f31a-4c78-8726-1132231a92ce
00000000-0000-0000-0000-000000000000	246	_hVl5rOSQToQyCTGKpXTMg	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-24 11:24:27.719317+00	2025-04-24 11:24:27.719317+00	\N	0fbedb74-3b81-4106-b263-8f257172fa64
00000000-0000-0000-0000-000000000000	247	2bSgVzRy9cWhMJRhYeheDA	19cae141-9672-4e8e-847c-203b31ae5991	f	2025-04-24 11:35:56.282871+00	2025-04-24 11:35:56.282871+00	\N	b55018a7-9b55-4a67-af25-3d5064290a6c
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
0406b811-63dd-421b-9290-e32d9ae5f17e	98f8b807-8353-441f-a427-7ff41cb83010	2025-04-22 22:30:00.581222+00	2025-04-22 22:30:00.581222+00	\N	aal1	\N	\N	node	172.18.0.1	\N
c054afbf-25ac-42a5-bf5d-18c327d71b67	98f8b807-8353-441f-a427-7ff41cb83010	2025-04-22 22:30:00.671372+00	2025-04-22 22:30:00.671372+00	\N	aal1	\N	\N	node	172.18.0.1	\N
12a30e1d-94f1-4744-a7d3-68a011be7e8e	98f8b807-8353-441f-a427-7ff41cb83010	2025-04-22 22:32:34.068849+00	2025-04-22 22:32:34.068849+00	\N	aal1	\N	\N	node	172.18.0.1	\N
ea1f03da-80d0-433a-91fa-99bae3ade53e	6ef841e6-7821-4b0b-9dd1-4fca83a08264	2025-04-22 22:35:22.350651+00	2025-04-22 22:35:22.350651+00	\N	aal1	\N	\N	node	172.18.0.1	\N
c2b581f1-e43a-4382-9290-faa5d9f44011	6ef841e6-7821-4b0b-9dd1-4fca83a08264	2025-04-22 22:35:22.414785+00	2025-04-22 22:35:22.414785+00	\N	aal1	\N	\N	node	172.18.0.1	\N
25cd06ed-b241-45fb-88a2-f80e9abcf59d	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-22 22:37:23.775223+00	2025-04-22 22:37:23.775223+00	\N	aal1	\N	\N	node	172.18.0.1	\N
40862373-f37e-4bb6-881e-7c368379939c	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-22 22:37:23.837724+00	2025-04-22 22:37:23.837724+00	\N	aal1	\N	\N	node	172.18.0.1	\N
09b56488-6a38-45d3-b004-31772895d313	e0470a72-d65f-4b08-9989-212d76720a7d	2025-04-22 22:40:57.311167+00	2025-04-22 22:40:57.311167+00	\N	aal1	\N	\N	node	172.18.0.1	\N
99b4670c-9d04-413c-bbaf-16b840d8f2da	e0470a72-d65f-4b08-9989-212d76720a7d	2025-04-22 22:40:57.374914+00	2025-04-22 22:40:57.374914+00	\N	aal1	\N	\N	node	172.18.0.1	\N
8bd1dbae-ef0a-4fce-a105-6e31b50005c2	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-22 22:42:42.141772+00	2025-04-22 22:42:42.141772+00	\N	aal1	\N	\N	node	172.18.0.1	\N
04f96c2a-6bfd-47fa-84f4-f9528586ce34	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-22 22:48:24.13684+00	2025-04-22 22:48:24.13684+00	\N	aal1	\N	\N	node	172.18.0.1	\N
a00320dc-d3df-4c7a-a9e7-21df844b2373	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-22 22:59:22.22916+00	2025-04-22 22:59:22.22916+00	\N	aal1	\N	\N	node	172.18.0.1	\N
57e57732-eaab-4dce-8abb-90b67a3c3de6	d5ffb06c-010a-41a0-8527-673d498ed225	2025-04-22 23:23:16.228222+00	2025-04-22 23:23:16.228222+00	\N	aal1	\N	\N	node	172.18.0.1	\N
619d2d69-acce-4910-b0a3-183d0a23bdb6	d5ffb06c-010a-41a0-8527-673d498ed225	2025-04-22 23:23:16.303655+00	2025-04-22 23:23:16.303655+00	\N	aal1	\N	\N	node	172.18.0.1	\N
cca4666b-203b-4c10-a213-2ca1c4309c9e	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-23 01:00:17.673839+00	2025-04-23 01:00:17.673839+00	\N	aal1	\N	\N	node	172.18.0.1	\N
a2cb4c5a-162d-46a5-8845-9f39571826f7	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-23 00:06:06.379753+00	2025-04-23 07:32:54.754901+00	\N	aal1	\N	2025-04-23 07:32:54.754781	node	172.18.0.1	\N
01301c77-d3f7-4d40-8e5e-c75e3e657788	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-23 00:13:05.15909+00	2025-04-23 07:32:55.119872+00	\N	aal1	\N	2025-04-23 07:32:55.119757	node	172.18.0.1	\N
15913bb2-d2df-4ba7-ac85-fe8d4d6cd54a	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-23 12:13:46.29259+00	2025-04-24 09:08:20.64722+00	\N	aal1	\N	2025-04-24 09:08:20.647056	node	172.18.0.1	\N
5e864b96-1393-4e90-892f-67bce748c283	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-23 07:45:01.763256+00	2025-04-24 10:46:16.757762+00	\N	aal1	\N	2025-04-24 10:46:16.757647	node	172.18.0.1	\N
34e733be-ad1a-42a3-96f6-99a28b27bdc9	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-24 11:14:43.135927+00	2025-04-24 11:14:43.135927+00	\N	aal1	\N	\N	node	172.18.0.1	\N
1064a6de-c9a0-44a9-b90b-53dd59dcaeb3	1746fc93-97d9-454a-aa64-a44ff934172b	2025-04-24 11:20:33.929325+00	2025-04-24 11:20:33.929325+00	\N	aal1	\N	\N	node	172.18.0.1	\N
8cb58c8e-3507-431d-a355-b7e4e3297572	1746fc93-97d9-454a-aa64-a44ff934172b	2025-04-24 11:20:34.014471+00	2025-04-24 11:20:34.014471+00	\N	aal1	\N	\N	node	172.18.0.1	\N
aa295306-98b1-41a4-aee4-af4a1cb3bcbe	05cd3956-d893-46cd-b626-985bd3d3df32	2025-04-24 11:22:52.284512+00	2025-04-24 11:22:52.284512+00	\N	aal1	\N	\N	node	172.18.0.1	\N
bae0ca0e-f31a-4c78-8726-1132231a92ce	05cd3956-d893-46cd-b626-985bd3d3df32	2025-04-24 11:22:52.34669+00	2025-04-24 11:22:52.34669+00	\N	aal1	\N	\N	node	172.18.0.1	\N
0fbedb74-3b81-4106-b263-8f257172fa64	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-24 11:24:27.7182+00	2025-04-24 11:24:27.7182+00	\N	aal1	\N	\N	node	172.18.0.1	\N
b55018a7-9b55-4a67-af25-3d5064290a6c	19cae141-9672-4e8e-847c-203b31ae5991	2025-04-24 11:35:56.278491+00	2025-04-24 11:35:56.278491+00	\N	aal1	\N	\N	node	172.18.0.1	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	d5ffb06c-010a-41a0-8527-673d498ed225	authenticated	authenticated	test1@wojtyczka.com	$2a$10$DzyZ6xdHNoctNUnEDGVYce.EUrhSWW5IwL7klTf1Zopt8cYqNy1tu	2025-04-22 23:23:16.223447+00	\N		\N		\N			\N	2025-04-22 23:23:16.303592+00	{"provider": "email", "providers": ["email"]}	{"sub": "d5ffb06c-010a-41a0-8527-673d498ed225", "email": "test1@wojtyczka.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T23:23:16.145Z"}	\N	2025-04-22 23:23:16.202987+00	2025-04-22 23:23:16.305093+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	136e942b-96f6-4180-bad7-a9a768e09e9a	authenticated	authenticated	pawel.test1@wojtyczka.com	$2a$10$GIZSnIhrc9vYPd/gfVaD5OamYaxguyq1xOqbGYfHv/7hmo8uJOgnC	2025-04-22 22:29:44.935815+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-04-22 22:29:44.932546+00	2025-04-22 22:29:44.93646+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6ef841e6-7821-4b0b-9dd1-4fca83a08264	authenticated	authenticated	pierdololo1@gmail.com	$2a$10$tJi7LgkqsGejid5LDrVqy.X/UqlfK.XXMwThNDdpuAo0MElxEDUYG	2025-04-22 22:35:22.346455+00	\N		\N		\N			\N	2025-04-22 22:35:22.4147+00	{"provider": "email", "providers": ["email"]}	{"sub": "6ef841e6-7821-4b0b-9dd1-4fca83a08264", "email": "pierdololo1@gmail.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:35:22.276Z"}	\N	2025-04-22 22:35:22.337562+00	2025-04-22 22:35:22.416687+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	19cae141-9672-4e8e-847c-203b31ae5991	authenticated	authenticated	pawel.wojtyczka@asperit.com	$2a$10$5tSIj3pIeyiVJB83RxYwqefv/PA7TqvOg0r.pWmZOyMDSFC7WpURC	2025-04-22 22:37:23.771765+00	\N		\N		\N			\N	2025-04-24 11:35:56.278415+00	{"provider": "email", "providers": ["email"]}	{"sub": "19cae141-9672-4e8e-847c-203b31ae5991", "email": "pawel.wojtyczka@asperit.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:37:23.707Z"}	\N	2025-04-22 22:37:23.767167+00	2025-04-24 11:35:56.286476+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1746fc93-97d9-454a-aa64-a44ff934172b	authenticated	authenticated	pawel.test100@wojtyczka.com	$2a$10$j6/0I/imXRyisowcxpsnE.8JSvyYjvmqrub4.fgFNhTql0CUMhHCS	2025-04-24 11:20:33.917613+00	\N		\N		\N			\N	2025-04-24 11:20:34.01438+00	{"provider": "email", "providers": ["email"]}	{"sub": "1746fc93-97d9-454a-aa64-a44ff934172b", "email": "pawel.test100@wojtyczka.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-24T11:20:33.823Z"}	\N	2025-04-24 11:20:33.90125+00	2025-04-24 11:20:34.015937+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	98f8b807-8353-441f-a427-7ff41cb83010	authenticated	authenticated	pawel.test2@wojtyczka.com	$2a$10$60afgmPpjseuoLdeOKNWPuRM2hT2iMvB1tU5EPXUYn65HQ7KQJumS	2025-04-22 22:30:00.577405+00	\N		\N		\N			\N	2025-04-22 22:32:34.068691+00	{"provider": "email", "providers": ["email"]}	{"sub": "98f8b807-8353-441f-a427-7ff41cb83010", "email": "pawel.test2@wojtyczka.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:30:00.504Z"}	\N	2025-04-22 22:30:00.568052+00	2025-04-22 22:32:34.071959+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e0470a72-d65f-4b08-9989-212d76720a7d	authenticated	authenticated	pawel.1@wojtyczka.com	$2a$10$DEBPdPsSxvPDGHRzUl9NBeY4EiTiIGGh3CkKiwARyBzs3j5jTs3tm	2025-04-22 22:40:57.308108+00	\N		\N		\N			\N	2025-04-22 22:40:57.37484+00	{"provider": "email", "providers": ["email"]}	{"sub": "e0470a72-d65f-4b08-9989-212d76720a7d", "email": "pawel.1@wojtyczka.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-22T22:40:57.245Z"}	\N	2025-04-22 22:40:57.30324+00	2025-04-22 22:40:57.376858+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	05cd3956-d893-46cd-b626-985bd3d3df32	authenticated	authenticated	pawel.test101@wojtyczka.com	$2a$10$/0NNF0bRCDHYyytS8Ypx1elw3JAi.kDVFvZ2rzemdEukfngZw95TK	2025-04-24 11:22:52.281817+00	\N		\N		\N			\N	2025-04-24 11:22:52.346615+00	{"provider": "email", "providers": ["email"]}	{"sub": "05cd3956-d893-46cd-b626-985bd3d3df32", "email": "pawel.test101@wojtyczka.com", "email_verified": true, "phone_verified": false, "email_confirmed": true, "registration_date": "2025-04-24T11:22:52.213Z"}	\N	2025-04-24 11:22:52.277281+00	2025-04-24 11:22:52.348088+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, user_id, started_at, ended_at, openai_thread_id, answer_accepted, messages) FROM stdin;
\.


--
-- Data for Name: shopping_list_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shopping_list_items (id, shopping_list_id, item_name, purchased, created_at, updated_at) FROM stdin;
5a8be14d-56a7-4fdf-9c98-3374a85fb721	58168035-bbbe-4b69-974f-d34e5eb69561	chleb	f	2025-04-24 11:31:20.904943	2025-04-24 11:31:20.904943
986a70b6-30bc-43ff-8a14-0e98157e6740	58168035-bbbe-4b69-974f-d34e5eb69561	mleko	f	2025-04-24 11:31:20.904943	2025-04-24 11:31:20.904943
b650ec8c-eb18-498a-b87f-20f0eaf7cf01	58168035-bbbe-4b69-974f-d34e5eb69561	20 dkg sera żółtego	f	2025-04-24 11:31:20.904943	2025-04-24 11:31:20.904943
\.


--
-- Data for Name: shopping_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shopping_lists (id, user_id, title, created_at, updated_at) FROM stdin;
d339d980-b40a-41c0-9799-35f4872e1d9c	19cae141-9672-4e8e-847c-203b31ae5991	Lista zakupów 24.04.2025	2025-04-24 11:29:33.407274	2025-04-24 11:29:33.407274
2e46ff72-abc5-4163-8e48-5f2eea93aaa9	19cae141-9672-4e8e-847c-203b31ae5991	Lista zakupów 24.04.2025	2025-04-24 11:30:21.804308	2025-04-24 11:30:21.804308
58168035-bbbe-4b69-974f-d34e5eb69561	19cae141-9672-4e8e-847c-203b31ae5991	Majówka	2025-04-24 11:30:58.484584	2025-04-24 11:31:03.891747
f8ef9ec1-05d4-455e-992d-927a8c5983b9	d5ffb06c-010a-41a0-8527-673d498ed225	Na majóweczkę :-)	2025-04-22 23:23:18.373089	2025-04-22 23:28:28.624918
4a7503b9-950a-447e-8895-a2b365f3bb8a	d5ffb06c-010a-41a0-8527-673d498ed225	Na weekend	2025-04-22 23:47:34.726961	2025-04-22 23:47:41.393429
7dae55f1-d970-44d8-b99b-3ed35962446e	d5ffb06c-010a-41a0-8527-673d498ed225	Lista zakupów 23.04.2025	2025-04-22 23:53:56.19911	2025-04-22 23:53:56.19911
61217648-2a49-442a-9c97-6d80046679ae	98f8b807-8353-441f-a427-7ff41cb83010	Lista zakupów 23.04.2025	2025-04-22 22:30:05.877949	2025-04-22 22:30:05.877949
8611c3e5-531b-4361-b3d9-8ea2f2d3722d	e0470a72-d65f-4b08-9989-212d76720a7d	Lista zakupów 23.04.2025	2025-04-22 22:41:00.292439	2025-04-22 22:41:00.292439
df028862-0e91-4d5e-a393-a96d3e9b7680	05cd3956-d893-46cd-b626-985bd3d3df32	Lista zakupów 24.04.2025	2025-04-24 11:22:54.340521	2025-04-24 11:22:54.340521
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, updated_date, admin) FROM stdin;
8c733d3c-0b4f-4966-b252-497fdaa0992f	pawel@wojtyczka.com	2025-04-22 22:29:28.206139	f
136e942b-96f6-4180-bad7-a9a768e09e9a	pawel.test1@wojtyczka.com	2025-04-22 22:29:44.932151	f
98f8b807-8353-441f-a427-7ff41cb83010	pawel.test2@wojtyczka.com	2025-04-22 22:30:00.567714	f
6ef841e6-7821-4b0b-9dd1-4fca83a08264	pierdololo1@gmail.com	2025-04-22 22:35:22.337147	f
19cae141-9672-4e8e-847c-203b31ae5991	pawel.wojtyczka@asperit.com	2025-04-22 22:37:23.766823	f
e0470a72-d65f-4b08-9989-212d76720a7d	pawel.1@wojtyczka.com	2025-04-22 22:40:57.301822	f
d5ffb06c-010a-41a0-8527-673d498ed225	test1@wojtyczka.com	2025-04-22 23:23:16.202643	f
1746fc93-97d9-454a-aa64-a44ff934172b	pawel.test100@wojtyczka.com	2025-04-24 11:20:33.900843	f
05cd3956-d893-46cd-b626-985bd3d3df32	pawel.test101@wojtyczka.com	2025-04-24 11:22:52.276985	f
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-04-16 11:43:14
20211116045059	2025-04-16 11:43:14
20211116050929	2025-04-16 11:43:14
20211116051442	2025-04-16 11:43:14
20211116212300	2025-04-16 11:43:14
20211116213355	2025-04-16 11:43:14
20211116213934	2025-04-16 11:43:14
20211116214523	2025-04-16 11:43:14
20211122062447	2025-04-16 11:43:14
20211124070109	2025-04-16 11:43:14
20211202204204	2025-04-16 11:43:14
20211202204605	2025-04-16 11:43:14
20211210212804	2025-04-16 11:43:14
20211228014915	2025-04-16 11:43:14
20220107221237	2025-04-16 11:43:14
20220228202821	2025-04-16 11:43:14
20220312004840	2025-04-16 11:43:14
20220603231003	2025-04-16 11:43:14
20220603232444	2025-04-16 11:43:14
20220615214548	2025-04-16 11:43:14
20220712093339	2025-04-16 11:43:14
20220908172859	2025-04-16 11:43:14
20220916233421	2025-04-16 11:43:14
20230119133233	2025-04-16 11:43:14
20230128025114	2025-04-16 11:43:14
20230128025212	2025-04-16 11:43:14
20230227211149	2025-04-16 11:43:14
20230228184745	2025-04-16 11:43:14
20230308225145	2025-04-16 11:43:14
20230328144023	2025-04-16 11:43:14
20231018144023	2025-04-16 11:43:14
20231204144023	2025-04-16 11:43:14
20231204144024	2025-04-16 11:43:14
20231204144025	2025-04-16 11:43:14
20240108234812	2025-04-16 11:43:14
20240109165339	2025-04-16 11:43:14
20240227174441	2025-04-16 11:43:14
20240311171622	2025-04-16 11:43:14
20240321100241	2025-04-16 11:43:14
20240401105812	2025-04-16 11:43:14
20240418121054	2025-04-16 11:43:14
20240523004032	2025-04-16 11:43:14
20240618124746	2025-04-16 11:43:14
20240801235015	2025-04-16 11:43:14
20240805133720	2025-04-16 11:43:14
20240827160934	2025-04-16 11:43:14
20240919163303	2025-04-16 11:43:14
20240919163305	2025-04-16 11:43:14
20241019105805	2025-04-16 11:43:14
20241030150047	2025-04-16 11:43:14
20241108114728	2025-04-16 11:43:14
20241121104152	2025-04-16 11:43:14
20241130184212	2025-04-16 11:43:14
20241220035512	2025-04-16 11:43:14
20241220123912	2025-04-16 11:43:14
20241224161212	2025-04-16 11:43:14
20250107150512	2025-04-16 11:43:14
20250110162412	2025-04-16 11:43:14
20250123174212	2025-04-16 11:43:14
20250128220012	2025-04-16 11:43:14
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-04-16 11:43:16.217834
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-04-16 11:43:16.221746
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-04-16 11:43:16.223545
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-04-16 11:43:16.230158
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-04-16 11:43:16.243634
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-04-16 11:43:16.245953
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-04-16 11:43:16.248432
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-04-16 11:43:16.251335
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-04-16 11:43:16.253194
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-04-16 11:43:16.254994
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-04-16 11:43:16.257009
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-04-16 11:43:16.259293
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-04-16 11:43:16.261946
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-04-16 11:43:16.264208
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-04-16 11:43:16.266236
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-04-16 11:43:16.280478
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-04-16 11:43:16.282679
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-04-16 11:43:16.284416
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-04-16 11:43:16.286189
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-04-16 11:43:16.288183
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-04-16 11:43:16.289605
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-04-16 11:43:16.294061
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-04-16 11:43:16.307396
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-04-16 11:43:16.321335
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-04-16 11:43:16.325161
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-04-16 11:43:16.327581
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-04-16 11:43:16.329479
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-04-16 11:43:16.345167
28	object-bucket-name-sorting	8f385d71c72f7b9f6388e22f6e393e3b78bf8617	2025-04-16 11:43:16.356384
29	create-prefixes	8416491709bbd2b9f849405d5a9584b4f78509fb	2025-04-16 11:43:16.36009
30	update-object-levels	f5899485e3c9d05891d177787d10c8cb47bae08a	2025-04-16 11:43:16.363107
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-04-16 11:43:16.371758
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-04-16 11:43:16.380112
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-04-16 11:43:16.388403
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-04-16 11:43:16.389889
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-04-16 11:43:16.393416
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-04-16 11:43:03.037233+00
20210809183423_update_grants	2025-04-16 11:43:03.037233+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20240612130015	{"-- Migration: initial_schema\n-- Description: Creates the initial database schema with users, conversations, shopping lists, and items\n-- Created at: 2024-06-12 13:00:15\n\n-- users table\ncreate table if not exists public.users (\n  id uuid primary key default gen_random_uuid(),\n  email varchar(128) not null unique,\n  password_hash text not null,\n  registration_date timestamp not null default current_timestamp,\n  last_login_date timestamp,\n  updated_date timestamp not null default current_timestamp\n)","-- RLS disabled for MVP stage\n-- enable row level security\n-- alter table public.users enable row level security;\n\n-- rls policies for users\n-- create policy \\"Users can view their own data\\" \n--   on public.users \n--   for select \n--   to authenticated \n--   using (auth.uid() = id);\n\n-- create policy \\"Users can update their own data\\" \n--   on public.users \n--   for update \n--   to authenticated \n--   using (auth.uid() = id);\n\n-- conversations table\ncreate table if not exists public.conversations (\n  id uuid primary key default gen_random_uuid(),\n  user_id uuid not null references public.users(id) on delete cascade,\n  started_at timestamp not null default current_timestamp,\n  ended_at timestamp,\n  openai_thread_id text,\n  answer_accepted boolean not null default false,\n  messages jsonb\n)","-- RLS disabled for MVP stage\n-- enable row level security\n-- alter table public.conversations enable row level security;\n\n-- rls policies for conversations\n-- create policy \\"Users can view their own conversations\\" \n--   on public.conversations \n--   for select \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- create policy \\"Users can insert their own conversations\\" \n--   on public.conversations \n--   for insert \n--   to authenticated \n--   with check (auth.uid() = user_id);\n\n-- create policy \\"Users can update their own conversations\\" \n--   on public.conversations \n--   for update \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- create policy \\"Users can delete their own conversations\\" \n--   on public.conversations \n--   for delete \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- shopping_lists table\ncreate table if not exists public.shopping_lists (\n  id uuid primary key default gen_random_uuid(),\n  user_id uuid not null references public.users(id) on delete cascade,\n  title varchar(255) not null,\n  created_at timestamp not null default current_timestamp,\n  updated_at timestamp not null default current_timestamp\n)","-- RLS disabled for MVP stage\n-- enable row level security\n-- alter table public.shopping_lists enable row level security;\n\n-- rls policies for shopping_lists\n-- create policy \\"Users can view their own shopping lists\\" \n--   on public.shopping_lists \n--   for select \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- create policy \\"Users can insert their own shopping lists\\" \n--   on public.shopping_lists \n--   for insert \n--   to authenticated \n--   with check (auth.uid() = user_id);\n\n-- create policy \\"Users can update their own shopping lists\\" \n--   on public.shopping_lists \n--   for update \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- create policy \\"Users can delete their own shopping lists\\" \n--   on public.shopping_lists \n--   for delete \n--   to authenticated \n--   using (auth.uid() = user_id);\n\n-- shopping_list_items table\ncreate table if not exists public.shopping_list_items (\n  id uuid primary key default gen_random_uuid(),\n  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,\n  item_name text not null,\n  purchased boolean not null default false,\n  created_at timestamp not null default current_timestamp,\n  updated_at timestamp not null default current_timestamp\n)","-- RLS disabled for MVP stage\n-- enable row level security\n-- alter table public.shopping_list_items enable row level security;\n\n-- rls policies for shopping_list_items\n-- create policy \\"Users can view items from their shopping lists\\" \n--   on public.shopping_list_items \n--   for select \n--   to authenticated \n--   using (\n--     shopping_list_id in (\n--       select id from public.shopping_lists where user_id = auth.uid()\n--     )\n--   );\n\n-- create policy \\"Users can insert items to their shopping lists\\" \n--   on public.shopping_list_items \n--   for insert \n--   to authenticated \n--   with check (\n--     shopping_list_id in (\n--       select id from public.shopping_lists where user_id = auth.uid()\n--     )\n--   );\n\n-- create policy \\"Users can update items from their shopping lists\\" \n--   on public.shopping_list_items \n--   for update \n--   to authenticated \n--   using (\n--     shopping_list_id in (\n--       select id from public.shopping_lists where user_id = auth.uid()\n--     )\n--   );\n\n-- create policy \\"Users can delete items from their shopping lists\\" \n--   on public.shopping_list_items \n--   for delete \n--   to authenticated \n--   using (\n--     shopping_list_id in (\n--       select id from public.shopping_lists where user_id = auth.uid()\n--     )\n--   );\n\n-- add indexes to improve query performance\ncreate index if not exists idx_conversations_user_id on public.conversations(user_id)","create index if not exists idx_shopping_lists_user_id on public.shopping_lists(user_id)","create index if not exists idx_shopping_list_items_shopping_list_id on public.shopping_list_items(shopping_list_id)","-- add triggers for updated_at columns\ncreate or replace function trigger_set_timestamp()\nreturns trigger as $$\nbegin\n  new.updated_at = current_timestamp;\n  return new;\nend;\n$$ language plpgsql","create trigger set_timestamp_users\nbefore update on public.users\nfor each row\nexecute function trigger_set_timestamp()","create trigger set_timestamp_shopping_lists\nbefore update on public.shopping_lists\nfor each row\nexecute function trigger_set_timestamp()","create trigger set_timestamp_shopping_list_items\nbefore update on public.shopping_list_items\nfor each row\nexecute function trigger_set_timestamp()"}	initial_schema
20240620150045	{"-- Migration: add_admin_column\n-- Description: Adds an admin boolean column to the users table to identify administrators\n-- Created at: 2024-06-20 15:00:45\n\n-- add admin column to users table with default value of false\n-- this allows identification of users with administrative privileges\nalter table public.users add column if not exists admin boolean not null default false","-- add comment to explain the purpose of the column\ncomment on column public.users.admin is 'Identifies users with administrative privileges. Default is false for regular users.'","-- update existing comment on table if needed\ncomment on table public.users is 'Stores user accounts including regular users and administrators'"}	add_admin_column
20240620151530	{"-- Migration: fix_user_timestamp_trigger\n-- Description: Fixes the issue with the trigger for updating timestamp on the users table\n-- Created at: 2024-06-20 15:15:30\n\n-- Problem: The trigger tries to update \\"updated_at\\" but users table has \\"updated_date\\"\n-- Solution: Create a modified trigger function specifically for the users table\n\n-- drop the existing trigger on users to avoid conflicts\ndrop trigger if exists set_timestamp_users on public.users","-- create a specific trigger function for users table that uses updated_date instead of updated_at\ncreate or replace function trigger_set_timestamp_users()\nreturns trigger as $$\nbegin\n  new.updated_date = current_timestamp;\n  return new;\nend;\n$$ language plpgsql","-- create a new trigger with the correct function\ncreate trigger set_timestamp_users\nbefore update on public.users\nfor each row\nexecute function trigger_set_timestamp_users()","-- add comment to explain the fix\ncomment on function trigger_set_timestamp_users() is 'Updates the updated_date column to current timestamp on record update'"}	fix_user_timestamp_trigger
23240612130015	{"-- Function to insert a new user into public.users when a user is created in auth.users\ncreate or replace function public.handle_new_user()\nreturns trigger\nlanguage plpgsql\nsecurity definer set search_path = public\nas $$\nbegin\n  -- Ensure the table name 'users' matches your public table name\n  insert into public.users (id, email)\n  values (new.id, new.email);\n  return new;\nend;\n$$","-- Trigger to call handle_new_user function after a new user is inserted into auth.users\n-- Drop trigger first if it exists to make the migration idempotent\ndrop trigger if exists on_auth_user_created on auth.users","create trigger on_auth_user_created\n  after insert on auth.users\n  for each row execute procedure public.handle_new_user()","-- Optional: Grant usage on the new function to the authenticated role if needed,\n-- though security definer should handle permissions for inserting into public.users\n-- grant execute on function public.handle_new_user() to authenticated"}	create_user_sync_trigger
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 247, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: shopping_list_items shopping_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_list_items
    ADD CONSTRAINT shopping_list_items_pkey PRIMARY KEY (id);


--
-- Name: shopping_lists shopping_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_shopping_list_items_shopping_list_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_list_items_shopping_list_id ON public.shopping_list_items USING btree (shopping_list_id);


--
-- Name: idx_shopping_lists_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_unique ON storage.objects USING btree (name COLLATE "C", bucket_id);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: shopping_list_items set_timestamp_shopping_list_items; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_shopping_list_items BEFORE UPDATE ON public.shopping_list_items FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: shopping_lists set_timestamp_shopping_lists; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_shopping_lists BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: users set_timestamp_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp_users();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN ((new.name <> old.name)) EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: shopping_list_items shopping_list_items_shopping_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_list_items
    ADD CONSTRAINT shopping_list_items_shopping_list_id_fkey FOREIGN KEY (shopping_list_id) REFERENCES public.shopping_lists(id) ON DELETE CASCADE;


--
-- Name: shopping_lists shopping_lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime shopping_lists; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shopping_lists;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT ALL ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT ALL ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION sign(payload json, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION trigger_set_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO anon;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO service_role;


--
-- Name: FUNCTION trigger_set_timestamp_users(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_set_timestamp_users() TO anon;
GRANT ALL ON FUNCTION public.trigger_set_timestamp_users() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_set_timestamp_users() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.schema_migrations TO postgres;
GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE conversations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversations TO anon;
GRANT ALL ON TABLE public.conversations TO authenticated;
GRANT ALL ON TABLE public.conversations TO service_role;


--
-- Name: TABLE shopping_list_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shopping_list_items TO anon;
GRANT ALL ON TABLE public.shopping_list_items TO authenticated;
GRANT ALL ON TABLE public.shopping_list_items TO service_role;


--
-- Name: TABLE shopping_lists; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shopping_lists TO anon;
GRANT ALL ON TABLE public.shopping_lists TO authenticated;
GRANT ALL ON TABLE public.shopping_lists TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE migrations; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;
GRANT ALL ON TABLE storage.migrations TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

