-- ============================================================
-- Intelligence E Agriculture — External API Integration Layer
-- Adds API key management for external system integration.
-- Business and Enterprise plans get API access.
-- ============================================================

-- API keys table for external integrations
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,           -- First 8 chars shown in UI (e.g. "eia_live")
  key_hash TEXT NOT NULL UNIQUE,      -- SHA-256 hash of full key
  key_hint TEXT NOT NULL,             -- Last 4 chars shown in UI (e.g. "...ab3f")
  scopes TEXT[] NOT NULL DEFAULT ARRAY['agriculture:read', 'agriculture:write'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  request_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- External API usage log
CREATE TABLE IF NOT EXISTS public.external_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'general',
  credits_used INTEGER NOT NULL DEFAULT 1,
  response_status INTEGER NOT NULL DEFAULT 200,
  processing_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_api_key_id ON public.external_api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_user_id ON public.external_api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_external_api_usage_created_at ON public.external_api_usage(created_at);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can manage their own API keys'
  ) THEN
    CREATE POLICY "Users can manage their own API keys"
      ON public.api_keys
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can see their own API usage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'external_api_usage' AND policyname = 'Users can view their own API usage'
  ) THEN
    CREATE POLICY "Users can view their own API usage"
      ON public.external_api_usage
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admins can see all API keys and usage
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Admins can manage all API keys'
  ) THEN
    CREATE POLICY "Admins can manage all API keys"
      ON public.api_keys
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'external_api_usage' AND policyname = 'Admins can view all API usage'
  ) THEN
    CREATE POLICY "Admins can view all API usage"
      ON public.external_api_usage
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Function to increment API key request count and update last_used_at
CREATE OR REPLACE FUNCTION public.record_api_key_usage(
  p_key_hash TEXT,
  p_endpoint TEXT,
  p_request_type TEXT,
  p_credits_used INTEGER,
  p_response_status INTEGER,
  p_processing_time_ms INTEGER,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key_id UUID;
  v_user_id UUID;
BEGIN
  -- Get key info
  SELECT id, user_id INTO v_key_id, v_user_id
  FROM public.api_keys
  WHERE key_hash = p_key_hash AND is_active = true;

  IF v_key_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update key usage stats
  UPDATE public.api_keys
  SET
    request_count = request_count + 1,
    last_used_at = now(),
    updated_at = now()
  WHERE id = v_key_id;

  -- Log usage
  INSERT INTO public.external_api_usage (
    api_key_id, user_id, endpoint, request_type,
    credits_used, response_status, processing_time_ms,
    ip_address, user_agent
  ) VALUES (
    v_key_id, v_user_id, p_endpoint, p_request_type,
    p_credits_used, p_response_status, p_processing_time_ms,
    p_ip_address, p_user_agent
  );

  RETURN v_key_id;
END;
$$;
