-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (se integra con Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Social links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_url CHECK (url ~ '^https?://.+')
);

-- AI chat links table
CREATE TABLE IF NOT EXISTS public.ai_chat_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  ai_platform TEXT NOT NULL, -- 'chatgpt', 'claude', 'gemini', etc.
  description TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_chat_url CHECK (url ~ '^https?://.+'),
  CONSTRAINT valid_platform CHECK (ai_platform IN ('chatgpt', 'claude', 'gemini', 'copilot', 'perplexity', 'other'))
);

-- Indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX idx_social_links_position ON public.social_links(user_id, position);
CREATE INDEX idx_ai_chat_links_user_id ON public.ai_chat_links(user_id);
CREATE INDEX idx_ai_chat_links_position ON public.ai_chat_links(user_id, position);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_links ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies for social_links table
CREATE POLICY "Social links are viewable by everyone"
  ON public.social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own social links"
  ON public.social_links FOR ALL
  USING (auth.uid() = user_id);

-- Policies for ai_chat_links table
CREATE POLICY "Active AI chat links are viewable by everyone"
  ON public.ai_chat_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage own AI chat links"
  ON public.ai_chat_links FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_links_updated_at
  BEFORE UPDATE ON public.ai_chat_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_chat_views(chat_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ai_chat_links
  SET views_count = views_count + 1
  WHERE id = chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
