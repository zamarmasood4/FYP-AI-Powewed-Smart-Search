-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    original_query TEXT NOT NULL,
    processed_query JSONB,
    result_count INTEGER DEFAULT 0,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table for storing scraped data and embeddings
CREATE TABLE IF NOT EXISTS public.items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    source_url TEXT,
    source TEXT NOT NULL,
    tags TEXT[],
    metadata JSONB,
    embedding VECTOR(384), -- Dimension for all-MiniLM-L6-v2 model
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table for recommendation learning
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'purchase', 'like', 'dislike')),
    interaction_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations cache table
CREATE TABLE IF NOT EXISTS public.recommendations_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT,
    recommendations JSONB NOT NULL,
    recommendation_type TEXT NOT NULL,
    similarity_scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON public.search_history(search_timestamp);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_source ON public.items(source);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_item_id ON public.user_interactions(item_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_cache_user_id ON public.recommendations_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_cache_expires ON public.recommendations_cache(expires_at);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_items_embedding ON public.items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to search similar items using vector similarity
CREATE OR REPLACE FUNCTION search_similar_items(
    query_embedding VECTOR(384),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10,
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    source_url TEXT,
    source TEXT,
    tags TEXT[],
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT
        i.id,
        i.title,
        i.description,
        i.category,
        i.price,
        i.image_url,
        i.source_url,
        i.source,
        i.tags,
        1 - (i.embedding <=> query_embedding) AS similarity
    FROM public.items i
    WHERE 
        (filter_category IS NULL OR i.category = filter_category)
        AND 1 - (i.embedding <=> query_embedding) > match_threshold
    ORDER BY i.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to get user's search history
CREATE OR REPLACE FUNCTION get_user_search_history(
    p_user_id UUID,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    original_query TEXT,
    processed_query JSONB,
    result_count INTEGER,
    search_timestamp TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
AS $$
    SELECT
        sh.id,
        sh.original_query,
        sh.processed_query,
        sh.result_count,
        sh.search_timestamp
    FROM public.search_history sh
    WHERE sh.user_id = p_user_id
    ORDER BY sh.search_timestamp DESC
    LIMIT p_limit;
$$;

-- Function to get user's interaction history
CREATE OR REPLACE FUNCTION get_user_interaction_history(
    p_user_id UUID,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    item_id UUID,
    interaction_type TEXT,
    interaction_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    item_title TEXT,
    item_category TEXT
)
LANGUAGE SQL
AS $$
    SELECT
        ui.id,
        ui.item_id,
        ui.interaction_type,
        ui.interaction_data,
        ui.created_at,
        i.title AS item_title,
        i.category AS item_category
    FROM public.user_interactions ui
    JOIN public.items i ON ui.item_id = i.id
    WHERE ui.user_id = p_user_id
    ORDER BY ui.created_at DESC
    LIMIT p_limit;
$$;

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations_cache ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Search history policies
CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON public.user_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations cache policies
CREATE POLICY "Users can view own recommendations" ON public.recommendations_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.recommendations_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Items table is public for reading (needed for recommendations)
CREATE POLICY "Items are viewable by everyone" ON public.items
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
