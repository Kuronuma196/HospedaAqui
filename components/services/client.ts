// ═══════════════════════════════════════════════════════════════════════════
// HospedAqui — Configuração do Backend Supabase
// ═══════════════════════════════════════════════════════════════════════════
//
// COMO CONFIGURAR EM 3 PASSOS:
//
//  1. Acesse https://supabase.com → crie um projeto gratuito
//     (Recomendado: região South America - São Paulo)
//
//  2. Vá em Settings > API e copie:
//     • Project URL   → substitua SUPABASE_URL abaixo
//     • anon/public   → substitua SUPABASE_ANON_KEY abaixo
//
//  3. No SQL Editor do Supabase, execute o script SQL_SCHEMA abaixo
//     para criar todas as tabelas e dados iniciais.
//
//  Após configurar, o app usa banco real. Sem configurar, usa dados de demo.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

// ► Substitua pelos valores do SEU projeto Supabase:
export const SUPABASE_URL = 'https://tfqrxfkayywgpngodjzm.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_Myu6SacL93ijqHL3cYBkbA_XrfBPpy_'

export const IS_CONFIGURED =
  !SUPABASE_URL.startsWith('YOUR_') &&
  !SUPABASE_ANON_KEY.startsWith('YOUR_')

export const supabase = IS_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

// ─── PROTOTYPE MODE ───────────────────────────────────────────────────────────
// Quando ativo, todas as operações são simuladas (sem salvar dados reais).
let _protoMode = (() => {
  try { return localStorage.getItem('hospedaqui-prototype') === 'true' } catch { return false }
})()

export const getIsPrototypeMode = () => _protoMode

export function setPrototypeMode(value: boolean) {
  _protoMode = value
  try { localStorage.setItem('hospedaqui-prototype', String(value)) } catch {}
}
// ═══════════════════════════════════════════════════════════════════════════
// SQL_SCHEMA — Execute no SQL Editor do Supabase
// ═══════════════════════════════════════════════════════════════════════════
export const SQL_SCHEMA = `
-- ============================================================
-- HospedAqui — Banco de Dados PostgreSQL (Supabase)
-- Execute em: SQL Editor do seu projeto Supabase
-- IDEMPOTENTE: pode ser executado múltiplas vezes sem erros
-- ============================================================

-- TABELA 1: Perfis de usuário (extende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  preferences JSONB DEFAULT '{"language":"pt-BR","currency":"BRL","notifications":true}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TABELA 2: Hospedagens
CREATE TABLE IF NOT EXISTS public.properties (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL,
  location             TEXT NOT NULL,
  city                 TEXT NOT NULL,
  state                TEXT NOT NULL,
  stars                INTEGER DEFAULT 3,
  score                DECIMAL(3,1) DEFAULT 8.0,
  reviews_count        INTEGER DEFAULT 0,
  score_label          TEXT DEFAULT 'Bom',
  price_per_night      DECIMAL(10,2) NOT NULL,
  original_price       DECIMAL(10,2),
  images               TEXT[] DEFAULT '{}',
  amenities            TEXT[] DEFAULT '{}',
  description          TEXT,
  check_in_time        TEXT DEFAULT '14:00',
  check_out_time       TEXT DEFAULT '12:00',
  cancellation_policy  TEXT,
  payment_policy       TEXT,
  badge                TEXT,
  highlight            TEXT,
  active               BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "properties_read" ON public.properties;
CREATE POLICY "properties_read" ON public.properties FOR SELECT USING (active = true);

-- TABELA 3: Quartos
CREATE TABLE IF NOT EXISTS public.rooms (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id     UUID REFERENCES public.properties ON DELETE CASCADE,
  name            TEXT NOT NULL,
  capacity        INTEGER DEFAULT 2,
  beds            TEXT NOT NULL,
  size_sqm        INTEGER,
  price_per_night DECIMAL(10,2) NOT NULL,
  amenities       TEXT[] DEFAULT '{}',
  available       BOOLEAN DEFAULT TRUE,
  image_url       TEXT,
  cancellable     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rooms_read" ON public.rooms;
CREATE POLICY "rooms_read" ON public.rooms FOR SELECT USING (true);

-- TABELA 4: Reservas
CREATE TABLE IF NOT EXISTS public.reservations (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code                TEXT UNIQUE NOT NULL DEFAULT
    'HSP-' || extract(year from now())::text || '-' || floor(random()*90000+10000)::text,
  user_id             UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  property_id         UUID REFERENCES public.properties,
  property_name       TEXT NOT NULL,
  property_image      TEXT,
  property_city       TEXT,
  room_id             UUID REFERENCES public.rooms,
  room_name           TEXT,
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL,
  nights              INTEGER NOT NULL,
  adults              INTEGER DEFAULT 2,
  children            INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','awaiting_confirmation','confirmed','cancelled','completed')),
  total_value         DECIMAL(10,2) NOT NULL,
  price_per_night     DECIMAL(10,2) NOT NULL DEFAULT 0,
  fixed_charges       DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method      TEXT,
  payment_status      TEXT DEFAULT 'pending',
  payment_due_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  extras              TEXT[] DEFAULT '{}',
  guest_name          TEXT,
  guest_email         TEXT,
  guest_phone         TEXT,
  special_requests    TEXT,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
-- Não marcar reservas como pagas por padrão; somente confirmação server-side pode fazê-lo.
ALTER TABLE public.reservations ALTER COLUMN status SET DEFAULT 'pending_payment';
ALTER TABLE public.reservations ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours');
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS fixed_charges DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending_payment','awaiting_confirmation','confirmed','cancelled','completed'));
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reservations_own" ON public.reservations;
CREATE POLICY "reservations_own" ON public.reservations
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
CREATE OR REPLACE TRIGGER reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TABELA 5: Favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favorites_own" ON public.favorites;
CREATE POLICY "favorites_own" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- TABELA 6: Avaliações de hospedagens
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id   UUID REFERENCES public.properties ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles ON DELETE SET NULL,
  reviewer_name TEXT,
  score         DECIMAL(3,1) NOT NULL CHECK (score BETWEEN 0 AND 10),
  text          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_read"   ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_read"   ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TABELA 7: Motoristas
CREATE TABLE IF NOT EXISTS public.drivers (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  cpf              TEXT NOT NULL,
  cnpj             TEXT,
  pix_key          TEXT NOT NULL,
  license_number   TEXT NOT NULL,
  license_expiry   DATE NOT NULL,
  bio              TEXT DEFAULT '',
  status           TEXT DEFAULT 'active' CHECK (status IN ('pending','active','suspended')),
  rating           NUMERIC(3,2) DEFAULT 0,
  total_ratings    INTEGER DEFAULT 0,
  total_trips      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "drivers_read"   ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update" ON public.drivers;
CREATE POLICY "drivers_read"   ON public.drivers FOR SELECT USING (true);
CREATE POLICY "drivers_insert" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "drivers_update" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);

-- TABELA 8: Carros dos motoristas
CREATE TABLE IF NOT EXISTS public.cars (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id        UUID REFERENCES public.drivers ON DELETE CASCADE NOT NULL,
  brand            TEXT NOT NULL,
  model            TEXT NOT NULL,
  year             INTEGER NOT NULL,
  plate            TEXT NOT NULL,
  color            TEXT NOT NULL,
  category         TEXT DEFAULT 'economy' CHECK (category IN ('economy','comfort','suv','van','luxury')),
  capacity         INTEGER DEFAULT 4,
  features         TEXT[] DEFAULT '{}',
  images           TEXT[] DEFAULT '{}',
  price_per_km     NUMERIC(8,2) DEFAULT 2.50,
  min_fare         NUMERIC(8,2) DEFAULT 15.00,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cars_read"   ON public.cars;
DROP POLICY IF EXISTS "cars_manage" ON public.cars;
CREATE POLICY "cars_read"   ON public.cars FOR SELECT USING (true);
CREATE POLICY "cars_manage" ON public.cars FOR ALL USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- TABELA 9: Corridas de táxi
CREATE TABLE IF NOT EXISTS public.taxi_bookings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  guest_id         UUID REFERENCES auth.users ON DELETE SET NULL,
  guest_name       TEXT,
  driver_id        UUID REFERENCES public.drivers ON DELETE SET NULL,
  car_id           UUID REFERENCES public.cars ON DELETE SET NULL,
  origin           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  scheduled_date   DATE NOT NULL,
  scheduled_time   TIME NOT NULL,
  passengers       INTEGER DEFAULT 1,
  estimated_km     NUMERIC(8,2) DEFAULT 10,
  total_value      NUMERIC(10,2) NOT NULL,
  status           TEXT DEFAULT 'pending_payment' CHECK (status IN ('confirmed','in_progress','completed','cancelled','pending_payment')),
  payment_method   TEXT,
  payment_status   TEXT DEFAULT 'pending',
  payment_due_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  cancellation_reason TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
-- Migração idempotente para projetos que já tinham a tabela criada.
ALTER TABLE public.taxi_bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.taxi_bookings ALTER COLUMN status SET DEFAULT 'pending_payment';
ALTER TABLE public.taxi_bookings ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE public.taxi_bookings ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours');
ALTER TABLE public.taxi_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.taxi_bookings DROP CONSTRAINT IF EXISTS taxi_bookings_status_check;
ALTER TABLE public.taxi_bookings ADD CONSTRAINT taxi_bookings_status_check
  CHECK (status IN ('confirmed','in_progress','completed','cancelled','pending_payment'));
-- O navegador nunca confirma pagamentos; apenas serviço/ webhook confiável pode atualizar esse campo.
CREATE OR REPLACE FUNCTION public.guard_hospedaqui_payment_status() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF auth.role() IN ('anon','authenticated') THEN
    IF TG_OP = 'INSERT' AND COALESCE(NEW.payment_status, 'pending') <> 'pending' THEN
      RAISE EXCEPTION 'Payment status can only be confirmed by a trusted server.';
    ELSIF TG_OP = 'UPDATE' AND NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      RAISE EXCEPTION 'Payment status can only be confirmed by a trusted server.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS reservations_payment_status_guard ON public.reservations;
CREATE TRIGGER reservations_payment_status_guard BEFORE INSERT OR UPDATE OF payment_status
  ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.guard_hospedaqui_payment_status();
DROP TRIGGER IF EXISTS taxi_payment_status_guard ON public.taxi_bookings;
CREATE TRIGGER taxi_payment_status_guard BEFORE INSERT OR UPDATE OF payment_status
  ON public.taxi_bookings FOR EACH ROW EXECUTE FUNCTION public.guard_hospedaqui_payment_status();
ALTER TABLE public.taxi_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "taxi_guest_see"  ON public.taxi_bookings;
DROP POLICY IF EXISTS "taxi_driver_see" ON public.taxi_bookings;
DROP POLICY IF EXISTS "taxi_insert"     ON public.taxi_bookings;
DROP POLICY IF EXISTS "taxi_update"     ON public.taxi_bookings;
CREATE POLICY "taxi_guest_see"  ON public.taxi_bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "taxi_driver_see" ON public.taxi_bookings FOR SELECT USING (
  driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);
CREATE POLICY "taxi_insert" ON public.taxi_bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "taxi_update" ON public.taxi_bookings FOR UPDATE USING (
  auth.uid() = guest_id OR driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- Cancelamento automático de reservas/corridas não pagas após o prazo de 48 horas.
-- Supabase Cron executa a função a cada 5 minutos; a edição renova payment_due_at no app.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE OR REPLACE FUNCTION public.expire_unpaid_hospedaqui_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reservations
     SET status = 'cancelled', cancellation_reason = 'Pagamento não realizado no prazo de 48 horas'
   WHERE status = 'pending_payment'
     AND payment_status = 'pending'
     AND payment_due_at <= NOW();

  UPDATE public.taxi_bookings
     SET status = 'cancelled', cancellation_reason = 'Pagamento não realizado no prazo de 48 horas'
   WHERE status = 'pending_payment'
     AND payment_status = 'pending'
     AND payment_due_at <= NOW();
END;
$$;
REVOKE ALL ON FUNCTION public.expire_unpaid_hospedaqui_bookings() FROM PUBLIC;

DO $$
DECLARE existing_job RECORD;
BEGIN
  FOR existing_job IN SELECT jobid FROM cron.job WHERE jobname = 'expire-unpaid-hospedaqui-bookings' LOOP
    PERFORM cron.unschedule(existing_job.jobid);
  END LOOP;
  PERFORM cron.schedule(
    'expire-unpaid-hospedaqui-bookings',
    '*/5 * * * *',
    'SELECT public.expire_unpaid_hospedaqui_bookings();'
  );
END;
$$;

-- TABELA 10: Avaliações de motoristas (por hóspedes)
CREATE TABLE IF NOT EXISTS public.driver_reviews (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  taxi_booking_id  UUID REFERENCES public.taxi_bookings ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  driver_id        UUID REFERENCES public.drivers ON DELETE CASCADE NOT NULL,
  car_id           UUID REFERENCES public.cars ON DELETE SET NULL,
  stars            INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  text             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(taxi_booking_id, reviewer_id)
);
ALTER TABLE public.driver_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "driver_reviews_read"   ON public.driver_reviews;
DROP POLICY IF EXISTS "driver_reviews_insert" ON public.driver_reviews;
CREATE POLICY "driver_reviews_read"   ON public.driver_reviews FOR SELECT USING (true);
CREATE POLICY "driver_reviews_insert" ON public.driver_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- TABELA 11: Avaliações de hóspedes (por motoristas)
CREATE TABLE IF NOT EXISTS public.guest_reviews (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  taxi_booking_id  UUID REFERENCES public.taxi_bookings ON DELETE CASCADE,
  reviewer_id      UUID REFERENCES public.drivers ON DELETE CASCADE NOT NULL,
  guest_id         UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stars            INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  text             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(taxi_booking_id, reviewer_id)
);
ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "guest_reviews_read"   ON public.guest_reviews;
DROP POLICY IF EXISTS "guest_reviews_insert" ON public.guest_reviews;
CREATE POLICY "guest_reviews_read"   ON public.guest_reviews FOR SELECT USING (true);
CREATE POLICY "guest_reviews_insert" ON public.guest_reviews FOR INSERT WITH CHECK (
  reviewer_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- ════════════════════════════════════════════
-- STORAGE — Bucket público para upload de fotos
-- ════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hospedaqui', 'hospedaqui', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "hospedaqui_select" ON storage.objects;
DROP POLICY IF EXISTS "hospedaqui_insert" ON storage.objects;
DROP POLICY IF EXISTS "hospedaqui_update" ON storage.objects;
DROP POLICY IF EXISTS "hospedaqui_delete" ON storage.objects;
CREATE POLICY "hospedaqui_select" ON storage.objects FOR SELECT USING (bucket_id = 'hospedaqui');
CREATE POLICY "hospedaqui_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hospedaqui' AND auth.role() = 'authenticated');
CREATE POLICY "hospedaqui_update" ON storage.objects FOR UPDATE USING (bucket_id = 'hospedaqui' AND auth.uid() = owner);
CREATE POLICY "hospedaqui_delete" ON storage.objects FOR DELETE USING (bucket_id = 'hospedaqui' AND auth.uid() = owner);

-- ════════════════════════════════════════════
-- SEED DATA — Hospedagens de exemplo
-- ════════════════════════════════════════════
INSERT INTO public.properties
  (name,type,location,city,state,stars,score,reviews_count,score_label,
   price_per_night,original_price,images,amenities,description,
   check_in_time,check_out_time,cancellation_policy,payment_policy,badge)
VALUES
('Grand Blue Hotel','Hotel','Av. Atlântica, 2000, Copacabana','Rio de Janeiro','RJ',5,9.2,1423,'Excepcional',
 520,680,
 ARRAY['https://images.unsplash.com/photo-1593349480374-01bb7d5782d5?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?w=800','https://images.unsplash.com/photo-1769149255670-aa0ad6428dd6?w=800'],
 ARRAY['Wi-Fi grátis','Piscina','Academia','Spa','Restaurante','Estacionamento','Ar-condicionado','Recepção 24h','Café da manhã','Vista para o mar','Pet friendly','Acessibilidade'],
 'Hotel cinco estrelas no coração de Copacabana. Vista privilegiada para o Atlântico, quartos espaçosos e serviços de alto padrão.',
 '14:00','12:00','Cancelamento gratuito até 48h antes do check-in.',
 'Pagamento na chegada aceito. Cartão obrigatório para garantia.','Mais popular'),

('Pousada Mar Azul','Pousada','Rua das Flores, 45, Porto da Barra','Salvador','BA',4,8.7,876,'Ótimo',
 290,null,
 ARRAY['https://images.unsplash.com/photo-1612900631807-6e32af134ff7?w=800','https://images.unsplash.com/photo-1649825420262-f765e1c602c9?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?w=800'],
 ARRAY['Wi-Fi grátis','Piscina','Café da manhã','Estacionamento','Ar-condicionado','Vista para o mar'],
 'Pousada charmosa na Porto da Barra com café da manhã tropical incluído e vista deslumbrante para o Atlântico.',
 '14:00','11:00','Cancelamento sem custo até 72h antes.',
 'Pagamento antecipado de 50% na reserva.',null),

('Chalé da Serra Premium','Chalé','Estrada da Uva, Km 5','Gramado','RS',4,9.5,642,'Excepcional',
 380,450,
 ARRAY['https://images.unsplash.com/photo-1740906574432-4195b969ef24?w=800','https://images.unsplash.com/photo-1774716926071-fc03e73d0806?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?w=800'],
 ARRAY['Wi-Fi grátis','Lareira','Hidromassagem','Café da manhã','Estacionamento','Vista para montanha','Aquecimento'],
 'Chalé romântico na Serra Gaúcha com lareira, hidromassagem e café da manhã colonial.',
 '15:00','12:00','Não reembolsável.','Pagamento 100% antecipado.','Avaliação 9.5'),

('Resort Praia de Iracema','Resort','Av. Beira Mar, 4500','Fortaleza','CE',5,8.9,1102,'Ótimo',
 680,null,
 ARRAY['https://images.unsplash.com/photo-1769149255670-aa0ad6428dd6?w=800','https://images.unsplash.com/photo-1612900631807-6e32af134ff7?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?w=800'],
 ARRAY['Wi-Fi grátis','Piscina','Academia','Spa','Restaurante','All inclusive','Praia privativa','Animação','Quadra esportiva'],
 'Resort all-inclusive premium em Fortaleza com acesso direto à praia e entretenimento diário.',
 '14:00','12:00','Cancelamento gratuito até 7 dias antes.',
 'All-inclusive inclui refeições, bebidas e atividades.',null),

('Flat Moderno Paulista','Flat','Rua Augusta, 1200, Jardins','São Paulo','SP',3,8.3,534,'Muito bom',
 210,null,
 ARRAY['https://images.unsplash.com/photo-1774716926071-fc03e73d0806?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?w=800','https://images.unsplash.com/photo-1649825420262-f765e1c602c9?w=800'],
 ARRAY['Wi-Fi grátis','Academia','Lavanderia','Cozinha','Ar-condicionado','Recepção 24h','Área de trabalho'],
 'Flat moderno e funcional no coração de São Paulo, ideal para viagens corporativas e estadias prolongadas.',
 '14:00','11:00','Cancelamento gratuito até 24h antes.',
 'Depósito de segurança de R$ 200.',null),

('Eco Pousada Floripa','Pousada','Rua Lauro Linhares, 500, Trindade','Florianópolis','SC',3,8.6,388,'Ótimo',
 245,null,
 ARRAY['https://images.unsplash.com/photo-1560971923-16c232d1ee89?w=800','https://images.unsplash.com/photo-1612900631807-6e32af134ff7?w=800','https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800','https://images.unsplash.com/photo-1649825420262-f765e1c602c9?w=800'],
 ARRAY['Wi-Fi grátis','Café da manhã','Estacionamento','Bicicleta','Área verde'],
 'Pousada ecológica perto das melhores praias de Florianópolis com café da manhã artesanal.',
 '13:00','11:00','Apenas cartão de débito ou pix.',
 'Cancelamento sem custo até 48h antes.',null)
ON CONFLICT DO NOTHING;
`;
