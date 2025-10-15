-- Engagement Algorithm for CrowdUp
-- Based on neuroscience principles and viral content patterns

-- Add engagement metrics to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS engagement_score FLOAT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS virality_score FLOAT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS controversy_score FLOAT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recency_score FLOAT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS quality_score FLOAT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create post views tracking
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER DEFAULT 0, -- seconds
  clicked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);

-- Enable RLS
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post views" ON post_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can track views" ON post_views FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Function to calculate engagement score
-- Based on: votes, comments, views, recency, controversy
CREATE OR REPLACE FUNCTION calculate_engagement_score(post_id UUID)
RETURNS FLOAT AS $$
DECLARE
  v_votes_count INTEGER;
  v_comments_count INTEGER;
  v_view_count INTEGER;
  v_click_count INTEGER;
  v_share_count INTEGER;
  v_created_at TIMESTAMP;
  v_hours_old FLOAT;
  v_upvotes INTEGER;
  v_downvotes INTEGER;
  v_engagement_score FLOAT;
  v_virality_score FLOAT;
  v_controversy_score FLOAT;
  v_recency_score FLOAT;
  v_quality_score FLOAT;
BEGIN
  -- Get post metrics
  SELECT 
    votes_count, 
    comments_count, 
    view_count,
    click_count,
    share_count,
    created_at
  INTO 
    v_votes_count, 
    v_comments_count, 
    v_view_count,
    v_click_count,
    v_share_count,
    v_created_at
  FROM posts WHERE id = post_id;

  -- Calculate hours since post creation
  v_hours_old := EXTRACT(EPOCH FROM (NOW() - v_created_at)) / 3600;

  -- Get upvotes and downvotes
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO v_upvotes, v_downvotes
  FROM votes WHERE votes.post_id = calculate_engagement_score.post_id;

  -- 1. VIRALITY SCORE (0-100)
  -- Measures rapid growth and sharing potential
  -- Formula: (votes + comments*2 + shares*3) / (hours_old + 1)
  v_virality_score := (
    (v_upvotes * 1.0) + 
    (v_comments_count * 2.0) + 
    (v_share_count * 3.0)
  ) / (v_hours_old + 1);

  -- 2. CONTROVERSY SCORE (0-100)
  -- High engagement from both sides = more interesting
  -- Formula: min(upvotes, downvotes) / max(upvotes, downvotes)
  IF v_upvotes + v_downvotes > 0 THEN
    v_controversy_score := (
      LEAST(v_upvotes, v_downvotes)::FLOAT / 
      GREATEST(v_upvotes, v_downvotes, 1)::FLOAT
    ) * 100;
  ELSE
    v_controversy_score := 0;
  END IF;

  -- 3. RECENCY SCORE (0-100)
  -- Decay function: newer posts get higher scores
  -- Formula: 100 * e^(-hours_old/24)
  v_recency_score := 100 * EXP(-v_hours_old / 24.0);

  -- 4. QUALITY SCORE (0-100)
  -- Based on engagement rate (clicks/views)
  IF v_view_count > 0 THEN
    v_quality_score := (
      (v_click_count::FLOAT / v_view_count::FLOAT) * 50 +
      (v_comments_count::FLOAT / GREATEST(v_view_count::FLOAT / 10, 1)) * 50
    );
  ELSE
    v_quality_score := 0;
  END IF;

  -- 5. ENGAGEMENT SCORE (0-100)
  -- Weighted combination of all factors
  v_engagement_score := (
    v_virality_score * 0.35 +      -- 35% virality
    v_recency_score * 0.25 +       -- 25% recency
    v_quality_score * 0.20 +       -- 20% quality
    v_controversy_score * 0.15 +   -- 15% controversy
    (v_upvotes * 0.05)             -- 5% raw votes
  );

  -- Cap at 100
  v_engagement_score := LEAST(v_engagement_score, 100);

  -- Update post scores
  UPDATE posts SET
    engagement_score = v_engagement_score,
    virality_score = v_virality_score,
    controversy_score = v_controversy_score,
    recency_score = v_recency_score,
    quality_score = v_quality_score
  WHERE id = post_id;

  RETURN v_engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_view_count_trigger
AFTER INSERT ON post_views
FOR EACH ROW EXECUTE FUNCTION increment_view_count();

-- Function to update click count
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clicked = TRUE AND OLD.clicked = FALSE THEN
    UPDATE posts 
    SET click_count = click_count + 1 
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_click_count_trigger
AFTER UPDATE ON post_views
FOR EACH ROW EXECUTE FUNCTION increment_click_count();

-- Scheduled job to recalculate engagement scores
-- Run this every hour via Supabase Edge Functions or cron
CREATE OR REPLACE FUNCTION recalculate_all_engagement_scores()
RETURNS void AS $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT id FROM posts WHERE created_at > NOW() - INTERVAL '7 days'
  LOOP
    PERFORM calculate_engagement_score(post_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for hot posts (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS hot_posts AS
SELECT 
  p.*,
  p.engagement_score as score,
  RANK() OVER (ORDER BY p.engagement_score DESC) as rank
FROM posts p
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.engagement_score DESC
LIMIT 100;

CREATE INDEX IF NOT EXISTS idx_hot_posts_score ON hot_posts(score DESC);

-- Refresh materialized view (call this every 15 minutes)
-- REFRESH MATERIALIZED VIEW hot_posts;
