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
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    telegram_id bigint NOT NULL,
    tariff text NOT NULL,
    payment_method text DEFAULT 'foreign'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    amount_cents integer,
    currency text,
    stripe_checkout_session_id text,
    stripe_payment_intent_id text,
    stripe_event_id text,
    checkout_url text,
    subscription_id uuid,
    granted_at timestamp with time zone,
    error text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'granting'::text, 'granted'::text, 'expired'::text, 'failed'::text, 'refunded'::text])))
);

ALTER TABLE ONLY public.payments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.payments OWNER TO supabase_admin;

--
-- Name: claim_paid_payment(uuid); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.claim_paid_payment(p_id uuid) RETURNS public.payments
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  r public.payments;
begin
  update public.payments
  set status = 'granting',
      updated_at = now(),
      error = null
  where id = p_id
    and status = 'paid'
  returning * into r;
  return r;
end;
$$;


ALTER FUNCTION public.claim_paid_payment(p_id uuid) OWNER TO supabase_admin;

--
-- Name: mark_chat_read_for_admin(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_chat_read_for_admin(p_chat_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update messages
  set read_at = now()
  where chat_id = p_chat_id
    and is_user = true
    and read_at is null;
end;
$$;


ALTER FUNCTION public.mark_chat_read_for_admin(p_chat_id uuid) OWNER TO postgres;

--
-- Name: mark_chat_read_for_user(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_chat_read_for_user(p_chat_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update messages
  set read_at = now()
  where chat_id = p_chat_id
    and is_user = false
    and read_at is null;
end;
$$;


ALTER FUNCTION public.mark_chat_read_for_user(p_chat_id uuid) OWNER TO postgres;

--
-- Name: messages_after_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.messages_after_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_chat_id uuid;
  v_preview text;
begin
  v_chat_id := coalesce(new.chat_id, old.chat_id);

  if tg_op = 'INSERT' then
    v_preview := left(new.body, 200);
    update chats
    set
      last_message_at = new.created_at,
      last_message_preview = v_preview,
      status = case when status = 'closed' then 'open' else status end,
      updated_at = now()
    where id = v_chat_id;
  end if;

  perform refresh_chat_unread_counts(v_chat_id);
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION public.messages_after_change() OWNER TO postgres;

--
-- Name: refresh_chat_unread_counts(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_chat_unread_counts(p_chat_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update chats c
  set
    unread_admin = (
      select count(*)::integer
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = true
        and m.read_at is null
    ),
    unread_user = (
      select count(*)::integer
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = false
        and m.read_at is null
    ),
    updated_at = now()
  where c.id = p_chat_id;
end;
$$;


ALTER FUNCTION public.refresh_chat_unread_counts(p_chat_id uuid) OWNER TO postgres;

--
-- Name: support_chat_status(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.support_chat_status(p_chat_id uuid) RETURNS TABLE(total_messages integer, waiting_count integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    (select count(*) from messages where chat_id = p_chat_id)::int,
    (
      select count(*)
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = true
        and m.created_at > coalesce(
          (select max(created_at) from messages where chat_id = p_chat_id and is_user = false),
          '-infinity'::timestamptz
        )
    )::int;
$$;


ALTER FUNCTION public.support_chat_status(p_chat_id uuid) OWNER TO postgres;

--
-- Name: support_recent(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.support_recent(p_limit integer DEFAULT 15) RETURNS TABLE(chat_id uuid, telegram_id bigint, username text, first_name text, last_name text, last_message_at timestamp with time zone, last_message_preview text, waiting_count integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  with last_admin as (
    select chat_id, max(created_at) as t
    from messages
    where is_user = false
    group by chat_id
  )
  select
    c.id,
    c.telegram_id,
    coalesce(c.username, u.username) as username,
    u.first_name,
    u.last_name,
    c.last_message_at,
    c.last_message_preview,
    (
      select count(*)
      from messages m
      where m.chat_id = c.id
        and m.is_user = true
        and m.created_at > coalesce(la.t, '-infinity'::timestamptz)
    )::int as waiting_count
  from chats c
  left join bot_users u on u.telegram_id = c.telegram_id
  left join last_admin la on la.chat_id = c.id
  order by c.last_message_at desc nulls last
  limit greatest(p_limit, 1);
$$;


ALTER FUNCTION public.support_recent(p_limit integer) OWNER TO postgres;

--
-- Name: support_waiting(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.support_waiting() RETURNS TABLE(chat_id uuid, telegram_id bigint, username text, first_name text, last_name text, waiting_count integer, first_waiting_at timestamp with time zone, last_waiting_at timestamp with time zone, bodies text[])
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  with last_admin as (
    select chat_id, max(created_at) as t
    from messages
    where is_user = false
    group by chat_id
  )
  select
    m.chat_id,
    c.telegram_id,
    coalesce(c.username, u.username)                     as username,
    u.first_name,
    u.last_name,
    count(*)::int                                        as waiting_count,
    min(m.created_at)                                    as first_waiting_at,
    max(m.created_at)                                    as last_waiting_at,
    array_agg(m.body order by m.created_at)              as bodies
  from messages m
  join chats c on c.id = m.chat_id
  left join last_admin la on la.chat_id = m.chat_id
  left join bot_users u on u.telegram_id = c.telegram_id
  where m.is_user = true
    and (la.t is null or m.created_at > la.t)
  group by m.chat_id, c.telegram_id, coalesce(c.username, u.username), u.first_name, u.last_name
  order by min(m.created_at) asc;
$$;


ALTER FUNCTION public.support_waiting() OWNER TO postgres;

--
-- Name: bot_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot_settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.bot_settings FORCE ROW LEVEL SECURITY;


ALTER TABLE public.bot_settings OWNER TO postgres;

--
-- Name: bot_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot_users (
    telegram_id bigint NOT NULL,
    username text,
    first_name text,
    last_name text,
    payment_method text,
    state text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.bot_users FORCE ROW LEVEL SECURITY;


ALTER TABLE public.bot_users OWNER TO postgres;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    telegram_id bigint NOT NULL,
    username text,
    status text DEFAULT 'open'::text NOT NULL,
    unread_user integer DEFAULT 0 NOT NULL,
    unread_admin integer DEFAULT 0 NOT NULL,
    last_message_at timestamp with time zone,
    last_message_preview text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chats_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text]))),
    CONSTRAINT chats_unread_admin_check CHECK ((unread_admin >= 0)),
    CONSTRAINT chats_unread_user_check CHECK ((unread_user >= 0))
);

ALTER TABLE ONLY public.chats FORCE ROW LEVEL SECURITY;


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    is_user boolean NOT NULL,
    body text NOT NULL,
    telegram_message_id bigint,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    admin_id bigint,
    admin_name text
);

ALTER TABLE ONLY public.messages FORCE ROW LEVEL SECURITY;


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: scheduled_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scheduled_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    telegram_id bigint NOT NULL,
    kind text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    send_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.scheduled_messages FORCE ROW LEVEL SECURITY;


ALTER TABLE public.scheduled_messages OWNER TO postgres;

--
-- Name: subscription_invites; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.subscription_invites (
    invite_link text NOT NULL,
    subscription_id uuid NOT NULL,
    telegram_id bigint NOT NULL,
    month smallint NOT NULL,
    chat_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscription_invites_month_check CHECK (((month >= 1) AND (month <= 3)))
);

ALTER TABLE ONLY public.subscription_invites FORCE ROW LEVEL SECURITY;


ALTER TABLE public.subscription_invites OWNER TO supabase_admin;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    telegram_id bigint NOT NULL,
    tariff text NOT NULL,
    payment_method text,
    status text DEFAULT 'active'::text NOT NULL,
    access_starts_at timestamp with time zone DEFAULT now() NOT NULL,
    access_ends_at timestamp with time zone NOT NULL,
    invite_link text,
    invite_created_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    unlocked_months integer[] DEFAULT '{1}'::integer[] NOT NULL,
    chat_access_ends_at timestamp with time zone,
    chat_kicked_at timestamp with time zone
);

ALTER TABLE ONLY public.subscriptions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tariff_prices; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.tariff_prices (
    tariff text NOT NULL,
    price_rub numeric(12,2) NOT NULL,
    price_usd numeric(12,2) NOT NULL,
    price_eur numeric(12,2) NOT NULL,
    checkout_currency text DEFAULT 'eur'::text NOT NULL,
    stripe_price_id text,
    label text,
    active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    price_rub_was numeric(12,2),
    price_usd_was numeric(12,2),
    price_eur_was numeric(12,2),
    CONSTRAINT tariff_prices_checkout_currency_check CHECK ((checkout_currency = ANY (ARRAY['rub'::text, 'usd'::text, 'eur'::text]))),
    CONSTRAINT tariff_prices_price_eur_check CHECK ((price_eur > (0)::numeric)),
    CONSTRAINT tariff_prices_price_rub_check CHECK ((price_rub > (0)::numeric)),
    CONSTRAINT tariff_prices_price_usd_check CHECK ((price_usd > (0)::numeric))
);

ALTER TABLE ONLY public.tariff_prices FORCE ROW LEVEL SECURITY;


ALTER TABLE public.tariff_prices OWNER TO supabase_admin;

--
-- Name: vip_intake; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vip_intake (
    telegram_id bigint NOT NULL,
    timezone_country text,
    preferred_days text,
    preferred_time text,
    topic text,
    step text DEFAULT 'q1'::text NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.vip_intake FORCE ROW LEVEL SECURITY;


ALTER TABLE public.vip_intake OWNER TO postgres;

--
-- Name: bot_settings bot_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_settings
    ADD CONSTRAINT bot_settings_pkey PRIMARY KEY (key);


--
-- Name: bot_users bot_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_users
    ADD CONSTRAINT bot_users_pkey PRIMARY KEY (telegram_id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: chats chats_telegram_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_telegram_id_key UNIQUE (telegram_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_stripe_checkout_session_id_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_stripe_checkout_session_id_key UNIQUE (stripe_checkout_session_id);


--
-- Name: scheduled_messages scheduled_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_messages
    ADD CONSTRAINT scheduled_messages_pkey PRIMARY KEY (id);


--
-- Name: subscription_invites subscription_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.subscription_invites
    ADD CONSTRAINT subscription_invites_pkey PRIMARY KEY (invite_link);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tariff_prices tariff_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.tariff_prices
    ADD CONSTRAINT tariff_prices_pkey PRIMARY KEY (tariff);


--
-- Name: vip_intake vip_intake_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vip_intake
    ADD CONSTRAINT vip_intake_pkey PRIMARY KEY (telegram_id);


--
-- Name: chats_status_last_msg_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chats_status_last_msg_idx ON public.chats USING btree (status, last_message_at DESC NULLS LAST);


--
-- Name: messages_chat_created_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_chat_created_idx ON public.messages USING btree (chat_id, created_at);


--
-- Name: messages_chat_unread_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_chat_unread_idx ON public.messages USING btree (chat_id, is_user) WHERE (read_at IS NULL);


--
-- Name: payments_pending_grant_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX payments_pending_grant_idx ON public.payments USING btree (created_at) WHERE (status = 'paid'::text);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_telegram_id_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX payments_telegram_id_idx ON public.payments USING btree (telegram_id);


--
-- Name: scheduled_messages_due_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX scheduled_messages_due_idx ON public.scheduled_messages USING btree (send_at) WHERE ((sent_at IS NULL) AND (cancelled_at IS NULL));


--
-- Name: subscription_invites_sub_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX subscription_invites_sub_idx ON public.subscription_invites USING btree (subscription_id);


--
-- Name: subscription_invites_telegram_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX subscription_invites_telegram_idx ON public.subscription_invites USING btree (telegram_id);


--
-- Name: subscriptions_chat_kick_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_chat_kick_idx ON public.subscriptions USING btree (chat_access_ends_at) WHERE (chat_kicked_at IS NULL);


--
-- Name: subscriptions_status_ends_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_ends_idx ON public.subscriptions USING btree (status, access_ends_at);


--
-- Name: subscriptions_telegram_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_telegram_id_idx ON public.subscriptions USING btree (telegram_id);


--
-- Name: messages trg_messages_after_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_messages_after_change AFTER INSERT OR DELETE OR UPDATE OF read_at, is_user, body ON public.messages FOR EACH ROW EXECUTE FUNCTION public.messages_after_change();


--
-- Name: chats chats_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: payments payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: payments payments_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: scheduled_messages scheduled_messages_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scheduled_messages
    ADD CONSTRAINT scheduled_messages_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: subscription_invites subscription_invites_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.subscription_invites
    ADD CONSTRAINT subscription_invites_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;


--
-- Name: subscription_invites subscription_invites_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.subscription_invites
    ADD CONSTRAINT subscription_invites_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: vip_intake vip_intake_telegram_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vip_intake
    ADD CONSTRAINT vip_intake_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.bot_users(telegram_id) ON DELETE CASCADE;


--
-- Name: bot_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_settings bot_settings_public_price_increase; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY bot_settings_public_price_increase ON public.bot_settings FOR SELECT TO authenticated, anon USING ((key = 'price_increase_at'::text));


--
-- Name: bot_users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bot_users ENABLE ROW LEVEL SECURITY;

--
-- Name: chats; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_invites; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.subscription_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: tariff_prices; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.tariff_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: tariff_prices tariff_prices_public_read; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY tariff_prices_public_read ON public.tariff_prices FOR SELECT TO authenticated, anon USING ((active = true));


--
-- Name: vip_intake; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.vip_intake ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.payments TO postgres;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: FUNCTION claim_paid_payment(p_id uuid); Type: ACL; Schema: public; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION public.claim_paid_payment(p_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.claim_paid_payment(p_id uuid) TO postgres;
GRANT ALL ON FUNCTION public.claim_paid_payment(p_id uuid) TO service_role;


--
-- Name: FUNCTION mark_chat_read_for_admin(p_chat_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_chat_read_for_admin(p_chat_id uuid) TO anon;
GRANT ALL ON FUNCTION public.mark_chat_read_for_admin(p_chat_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_chat_read_for_admin(p_chat_id uuid) TO service_role;


--
-- Name: FUNCTION mark_chat_read_for_user(p_chat_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_chat_read_for_user(p_chat_id uuid) TO anon;
GRANT ALL ON FUNCTION public.mark_chat_read_for_user(p_chat_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_chat_read_for_user(p_chat_id uuid) TO service_role;


--
-- Name: FUNCTION messages_after_change(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.messages_after_change() TO anon;
GRANT ALL ON FUNCTION public.messages_after_change() TO authenticated;
GRANT ALL ON FUNCTION public.messages_after_change() TO service_role;


--
-- Name: FUNCTION refresh_chat_unread_counts(p_chat_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.refresh_chat_unread_counts(p_chat_id uuid) TO anon;
GRANT ALL ON FUNCTION public.refresh_chat_unread_counts(p_chat_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.refresh_chat_unread_counts(p_chat_id uuid) TO service_role;


--
-- Name: FUNCTION support_chat_status(p_chat_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.support_chat_status(p_chat_id uuid) TO anon;
GRANT ALL ON FUNCTION public.support_chat_status(p_chat_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.support_chat_status(p_chat_id uuid) TO service_role;


--
-- Name: FUNCTION support_recent(p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.support_recent(p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.support_recent(p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.support_recent(p_limit integer) TO service_role;


--
-- Name: FUNCTION support_waiting(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.support_waiting() TO anon;
GRANT ALL ON FUNCTION public.support_waiting() TO authenticated;
GRANT ALL ON FUNCTION public.support_waiting() TO service_role;


--
-- Name: TABLE bot_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bot_settings TO service_role;
GRANT SELECT ON TABLE public.bot_settings TO anon;
GRANT SELECT ON TABLE public.bot_settings TO authenticated;


--
-- Name: TABLE bot_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bot_users TO service_role;


--
-- Name: TABLE chats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chats TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.messages TO service_role;


--
-- Name: TABLE scheduled_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.scheduled_messages TO service_role;


--
-- Name: TABLE subscription_invites; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.subscription_invites TO postgres;
GRANT ALL ON TABLE public.subscription_invites TO service_role;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: TABLE tariff_prices; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.tariff_prices TO postgres;
GRANT ALL ON TABLE public.tariff_prices TO service_role;
GRANT SELECT ON TABLE public.tariff_prices TO anon;
GRANT SELECT ON TABLE public.tariff_prices TO authenticated;


--
-- Name: TABLE vip_intake; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vip_intake TO service_role;


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
-- PostgreSQL database dump complete
--

