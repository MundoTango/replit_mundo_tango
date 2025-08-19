-- Create payment-related tables for Mundo Tango

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, past_due, canceled, trialing, etc.
  tier VARCHAR(50) NOT NULL, -- free, basic, enthusiast, professional, enterprise
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- card, bank_account, etc.
  last4 VARCHAR(4),
  brand VARCHAR(50), -- visa, mastercard, etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- succeeded, pending, failed
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  tiers TEXT[] NOT NULL, -- Array of tiers that have this feature
  limit_value INTEGER, -- NULL for unlimited, number for limited features
  limit_unit VARCHAR(50), -- 'count', 'mb', 'minutes', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Insert default subscription features
INSERT INTO subscription_features (feature_name, description, tiers, limit_value, limit_unit) VALUES
  ('create_memories', 'Create and share memories', ARRAY['free', 'basic', 'enthusiast', 'professional', 'enterprise'], NULL, NULL),
  ('join_groups', 'Join community groups', ARRAY['free', 'basic', 'enthusiast', 'professional', 'enterprise'], NULL, NULL),
  ('send_messages', 'Send messages to other users', ARRAY['basic', 'enthusiast', 'professional', 'enterprise'], NULL, NULL),
  ('create_events', 'Create events', ARRAY['enthusiast', 'professional', 'enterprise'], NULL, NULL),
  ('host_travelers', 'Host traveling dancers', ARRAY['professional', 'enterprise'], NULL, NULL),
  ('analytics_dashboard', 'Access analytics dashboard', ARRAY['professional', 'enterprise'], NULL, NULL),
  ('custom_branding', 'Custom branding options', ARRAY['enterprise'], NULL, NULL),
  ('priority_support', 'Priority customer support', ARRAY['professional', 'enterprise'], NULL, NULL),
  ('advanced_search', 'Advanced search features', ARRAY['enthusiast', 'professional', 'enterprise'], NULL, NULL),
  ('bulk_invites', 'Send bulk event invites', ARRAY['professional', 'enterprise'], 100, 'count'),
  ('storage_limit', 'Media storage limit', ARRAY['free'], 100, 'mb'),
  ('storage_limit', 'Media storage limit', ARRAY['basic'], 1000, 'mb'),
  ('storage_limit', 'Media storage limit', ARRAY['enthusiast'], 5000, 'mb'),
  ('storage_limit', 'Media storage limit', ARRAY['professional', 'enterprise'], NULL, NULL)
ON CONFLICT (feature_name) DO NOTHING;