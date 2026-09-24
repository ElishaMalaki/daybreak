-- Add Groq as an internal AI provider and EarthAI as the public branded provider.
-- This is additive and does not modify existing data.

ALTER TYPE public.ai_provider ADD VALUE IF NOT EXISTS 'groq';
ALTER TYPE public.ai_provider ADD VALUE IF NOT EXISTS 'earthai';
