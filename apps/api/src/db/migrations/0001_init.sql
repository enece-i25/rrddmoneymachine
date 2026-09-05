CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(30),
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('provider','client','admin')),
  admin_subrole VARCHAR(20) CHECK (admin_subrole IN ('super_admin','support','finance')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification','active','suspended','banned')),
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

CREATE TABLE provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  tiktok_handle VARCHAR(100),
  category VARCHAR(30) CHECK (category IN ('influencer','kiosco','pyme','startup')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method_id VARCHAR(255)
);

CREATE TABLE client_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  tiktok_handle VARCHAR(100),
  reputation_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_sessions_completed INT NOT NULL DEFAULT 0,
  total_sessions_failed INT NOT NULL DEFAULT 0,
  verification_tier VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (verification_tier IN ('new','trusted','elite')),
  tier_pay_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  trailing_compliance_avg NUMERIC(5,2),
  tier_warning_active BOOLEAN NOT NULL DEFAULT FALSE,
  tier_warning_sent_at TIMESTAMPTZ,
  grace_sessions_remaining INT NOT NULL DEFAULT 0,
  cbu_alias VARCHAR(50)
);

CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(user_id),
  client_id UUID REFERENCES users(user_id),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('tiktok','instagram')),
  scheduled_duration_min INT NOT NULL,
  collaborators_requested INT NOT NULL,
  live_url TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'programada'
    CHECK (status IN ('programada','en_curso','pausada','completada','incumplida','disputada')),
  compliance_pct NUMERIC(5,2),
  amount_earned NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE heartbeats (
  heartbeat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_time_ms INT,
  verification_type VARCHAR(20) CHECK (verification_type IN ('tap','captcha','keyword')),
  passed BOOLEAN NOT NULL
);

CREATE TABLE payments_in (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(user_id),
  session_id UUID REFERENCES sessions(session_id),
  amount_usd NUMERIC(10,2) NOT NULL,
  amount_ars NUMERIC(12,2) NOT NULL,
  fx_rate_used NUMERIC(10,2) NOT NULL,
  mp_payment_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE client_balance (
  balance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(user_id),
  session_id UUID REFERENCES sessions(session_id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','available','withdrawn')),
  available_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE withdrawal_requests (
  withdrawal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(user_id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','processing','paid','failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  mp_transfer_id VARCHAR(100)
);

CREATE TABLE provider_credit (
  credit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(user_id),
  session_id UUID REFERENCES sessions(session_id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','consumed','expiring_soon','expired','withdrawal_requested','withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  warning_sent_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  consumed_in_session_id UUID REFERENCES sessions(session_id),
  withdrawal_eligible_from TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_provider ON sessions(provider_id);
CREATE INDEX idx_sessions_client ON sessions(client_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_heartbeats_session ON heartbeats(session_id);
CREATE INDEX idx_client_balance_client_status ON client_balance(client_id, status);
CREATE INDEX idx_provider_credit_provider_status ON provider_credit(provider_id, status);
