# supabase_schema.sql
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    company TEXT,
    role TEXT NOT NULL CHECK (role IN ('business-analyst', 'product-manager', 'marketing-manager', 'data-scientist', 'researcher', 'small-business-owner', 'consumer', 'other')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- User sessions table for token management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Analysis history table
CREATE TABLE IF NOT EXISTS analysis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_url TEXT,
    sentiment_summary JSONB DEFAULT '{}',
    overall_sentiment TEXT CHECK (overall_sentiment IN ('positive', 'negative', 'neutral')),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for analysis history
CREATE INDEX IF NOT EXISTS idx_analysis_user ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created ON analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON analysis_history(overall_sentiment);

-- User preferences table (for future features)
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Analysis history policies
CREATE POLICY "Users can view own analysis history" ON analysis_history
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own analysis history" ON analysis_history
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
FOR ALL USING (auth.uid()::text = user_id::text);

-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_analyses', COUNT(*),
        'positive_analyses', COUNT(*) FILTER (WHERE overall_sentiment = 'positive'),
        'negative_analyses', COUNT(*) FILTER (WHERE overall_sentiment = 'negative'),
        'neutral_analyses', COUNT(*) FILTER (WHERE overall_sentiment = 'neutral'),
        'total_reviews_analyzed', COALESCE(SUM(total_reviews), 0),
        'last_analysis', MAX(created_at)
    ) INTO result
    FROM analysis_history
    WHERE user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default roles for reference
CREATE TABLE IF NOT EXISTS user_roles (
    value TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT
);

INSERT INTO user_roles (value, label, description) VALUES
('business-analyst', 'Business Analyst', 'Analyzes business data and trends'),
('product-manager', 'Product Manager', 'Manages product development and strategy'),
('marketing-manager', 'Marketing Manager', 'Handles marketing campaigns and analysis'),
('data-scientist', 'Data Scientist', 'Performs data analysis and machine learning'),
('researcher', 'Researcher', 'Conducts research and analysis'),
('small-business-owner', 'Small Business Owner', 'Owns or operates a small business'),
('consumer', 'Consumer', 'End user or customer'),
('other', 'Other', 'Other role not listed above')
ON CONFLICT (value) DO NOTHING;