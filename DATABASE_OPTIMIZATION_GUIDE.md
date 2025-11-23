# CrowdUp - Database Optimization Guide

## 🗄️ Complete Database Enhancement Strategy

---

## 1. 📊 Missing Indexes (Add Immediately)

```sql
-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_posts_type_votes_created 
  ON posts(type, votes DESC, created_at DESC);

CREATE INDEX CONCURRENTLY idx_posts_company_created_votes 
  ON posts(company, created_at DESC, votes DESC);

CREATE INDEX CONCURRENTLY idx_posts_user_created 
  ON posts(user_id, created_at DESC);

-- Partial indexes for hot data
CREATE INDEX CONCURRENTLY idx_posts_trending 
  ON posts(votes DESC, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '48 hours';

CREATE INDEX CONCURRENTLY idx_posts_popular 
  ON posts(votes DESC) 
  WHERE votes > 10;

-- Full-text search indexes
CREATE INDEX idx_posts_title_search ON posts USING gin(to_tsvector('english', title));
CREATE INDEX idx_posts_description_search ON posts USING gin(to_tsvector('english', description));

-- Comments optimization
CREATE INDEX CONCURRENTLY idx_comments_post_user 
  ON comments(post_id, user_id, created_at DESC);

-- Votes optimization
CREATE INDEX CONCURRENTLY idx_votes_post_type 
  ON votes(post_id, vote_type);

CREATE INDEX CONCURRENTLY idx_votes_user_created 
  ON votes(user_id, created_at DESC);

-- User activity indexes
CREATE INDEX CONCURRENTLY idx_users_created 
  ON users(created_at DESC);

CREATE INDEX CONCURRENTLY idx_users_display_name_lower 
  ON users(LOWER(display_name));

-- App and review indexes
CREATE INDEX CONCURRENTLY idx_apps_category_rating 
  ON apps(category, average_rating DESC);

CREATE INDEX CONCURRENTLY idx_app_reviews_app_rating 
  ON app_reviews(app_id, rating DESC, created_at DESC);

-- Connection indexes
CREATE INDEX CONCURRENTLY idx_connections_follower_created 
  ON connections(follower_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_connections_following_created 
  ON connections(following_id, created_at DESC);

-- Message indexes
CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_sender_created 
  ON messages(sender_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_unread 
  ON messages(conversation_id, read) 
  WHERE read = FALSE;
```

---

## 2. 🔄 Database Views for Complex Queries

```sql
-- Post engagement view
CREATE OR REPLACE VIEW post_engagement AS
SELECT 
  p.id,
  p.user_id,
  p.type,
  p.company,
  p.title,
  p.votes,
  p.created_at,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT v.id) as vote_count,
  COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'up') as upvote_count,
  COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'down') as downvote_count,
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 as age_hours
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
LEFT JOIN votes v ON v.post_id = p.id
GROUP BY p.id;

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count,
  SUM(p.votes) as total_votes,
  COUNT(DISTINCT f1.id) as follower_count,
  COUNT(DISTINCT f2.id) as following_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
LEFT JOIN comments c ON c.user_id = u.id
LEFT JOIN connections f1 ON f1.following_id = u.id
LEFT JOIN connections f2 ON f2.follower_id = u.id
GROUP BY u.id;

-- Trending posts view (last 48 hours)
CREATE OR REPLACE VIEW trending_posts AS
SELECT 
  p.*,
  pe.comment_count,
  pe.vote_count,
  (pe.vote_count + pe.comment_count * 2) / GREATEST(pe.age_hours, 1) as trending_score
FROM posts p
JOIN post_engagement pe ON pe.id = p.id
WHERE p.created_at > NOW() - INTERVAL '48 hours'
ORDER BY trending_score DESC;

-- Company analytics view
CREATE OR REPLACE VIEW company_analytics AS
SELECT 
  p.company,
  COUNT(*) as post_count,
  SUM(CASE WHEN p.type = 'Bug Report' THEN 1 ELSE 0 END) as bug_count,
  SUM(CASE WHEN p.type = 'Feature Request' THEN 1 ELSE 0 END) as feature_count,
  SUM(CASE WHEN p.type = 'Complaint' THEN 1 ELSE 0 END) as complaint_count,
  AVG(p.votes) as avg_votes,
  MAX(p.created_at) as last_post_at
FROM posts p
GROUP BY p.company;
```

---

## 3. 🚀 Materialized Views for Performance

```sql
-- Materialized view for dashboard stats (refresh every hour)
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as total_posts,
  COUNT(DISTINCT c.id) as total_comments,
  COUNT(DISTINCT v.id) as total_votes,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '24 hours') as posts_today,
  COUNT(DISTINCT u.id) FILTER (WHERE u.created_at > NOW() - INTERVAL '7 days') as new_users_week
FROM users u
CROSS JOIN posts p
CROSS JOIN comments c
CROSS JOIN votes v;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (using pg_cron extension)
SELECT cron.schedule('refresh-dashboard', '0 * * * *', 'SELECT refresh_dashboard_stats()');

-- Materialized view for popular companies
CREATE MATERIALIZED VIEW popular_companies AS
SELECT 
  company,
  COUNT(*) as post_count,
  SUM(votes) as total_votes,
  AVG(votes) as avg_votes
FROM posts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY company
ORDER BY post_count DESC, total_votes DESC
LIMIT 100;

CREATE UNIQUE INDEX ON popular_companies(company);
```

---

## 4. 🔧 Database Functions for Business Logic

```sql
-- Function to calculate post score (for algorithm)
CREATE OR REPLACE FUNCTION calculate_post_score(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC;
  v_age_hours NUMERIC;
  v_votes INTEGER;
  v_comments INTEGER;
  v_time_decay NUMERIC;
  v_engagement NUMERIC;
BEGIN
  SELECT 
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600,
    votes,
    (SELECT COUNT(*) FROM comments WHERE post_id = p_post_id)
  INTO v_age_hours, v_votes, v_comments
  FROM posts
  WHERE id = p_post_id;

  -- Time decay (exponential)
  v_time_decay := POWER(0.5, v_age_hours / 24);

  -- Engagement score
  v_engagement := v_votes + (v_comments * 2);

  -- Calculate final score
  v_score := (v_engagement * 0.3) + (v_time_decay * 100 * 0.2);

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Function to get user feed (personalized)
CREATE OR REPLACE FUNCTION get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    calculate_post_score(p.id, p_user_id) as score
  FROM posts p
  WHERE p.id NOT IN (
    SELECT post_id FROM votes WHERE user_id = p_user_id
  )
  ORDER BY score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to update post votes efficiently
CREATE OR REPLACE FUNCTION update_post_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts
    SET votes = votes + CASE 
      WHEN NEW.vote_type = 'up' AND OLD.vote_type = 'down' THEN 2
      WHEN NEW.vote_type = 'down' AND OLD.vote_type = 'up' THEN -2
      ELSE 0
    END
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET votes = votes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote updates
CREATE TRIGGER update_post_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_post_votes();
```

---

## 5. 📈 Query Optimization Techniques

### Use EXPLAIN ANALYZE
```sql
-- Before optimization
EXPLAIN ANALYZE
SELECT * FROM posts 
WHERE company = 'Twitter' 
ORDER BY created_at DESC;

-- Check for:
-- - Sequential scans (bad)
-- - Index scans (good)
-- - Execution time
```

### Optimize N+1 Queries
```sql
-- BAD: N+1 query
SELECT * FROM posts;
-- Then for each post:
SELECT * FROM comments WHERE post_id = ?;

-- GOOD: Single query with JOIN
SELECT 
  p.*,
  json_agg(c.*) as comments
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id;
```

### Use CTEs for Complex Queries
```sql
WITH recent_posts AS (
  SELECT * FROM posts 
  WHERE created_at > NOW() - INTERVAL '7 days'
),
post_stats AS (
  SELECT 
    post_id,
    COUNT(*) as comment_count
  FROM comments
  WHERE post_id IN (SELECT id FROM recent_posts)
  GROUP BY post_id
)
SELECT 
  rp.*,
  COALESCE(ps.comment_count, 0) as comments
FROM recent_posts rp
LEFT JOIN post_stats ps ON ps.post_id = rp.id
ORDER BY rp.votes DESC;
```

---

## 6. 🔒 Database Constraints & Validation

```sql
-- Add check constraints
ALTER TABLE posts 
ADD CONSTRAINT check_votes_reasonable 
CHECK (votes >= -1000 AND votes <= 100000);

ALTER TABLE app_reviews 
ADD CONSTRAINT check_rating_range 
CHECK (rating >= 1 AND rating <= 5);

-- Add unique constraints
ALTER TABLE votes 
ADD CONSTRAINT unique_user_post_vote 
UNIQUE (user_id, post_id);

-- Add foreign key constraints with cascading
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_user_id_fkey,
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;

-- Add not null constraints
ALTER TABLE posts 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN company SET NOT NULL;
```

---

## 7. 🧹 Database Maintenance

```sql
-- Vacuum and analyze regularly
VACUUM ANALYZE posts;
VACUUM ANALYZE comments;
VACUUM ANALYZE votes;

-- Reindex for performance
REINDEX TABLE posts;
REINDEX TABLE comments;

-- Check table bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Remove unused indexes
-- (Check idx_scan = 0 for indexes that are never used)
```

---

## 8. 📊 Partitioning for Scale

```sql
-- Partition posts by date (for very large datasets)
CREATE TABLE posts_partitioned (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE posts_2024_q1 PARTITION OF posts_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE posts_2024_q2 PARTITION OF posts_partitioned
  FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Auto-create partitions
CREATE OR REPLACE FUNCTION create_partition_if_not_exists()
RETURNS TRIGGER AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := DATE_TRUNC('quarter', NEW.created_at);
  end_date := start_date + INTERVAL '3 months';
  partition_name := 'posts_' || TO_CHAR(start_date, 'YYYY_Q"Q"');

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF posts_partitioned FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. 🔍 Full-Text Search Optimization

```sql
-- Create full-text search configuration
CREATE TEXT SEARCH CONFIGURATION crowdup (COPY = english);

-- Add custom dictionary
ALTER TEXT SEARCH CONFIGURATION crowdup
  ALTER MAPPING FOR word WITH english_stem;

-- Create GIN index for fast search
CREATE INDEX idx_posts_fulltext ON posts 
USING gin(to_tsvector('crowdup', title || ' ' || description));

-- Search function
CREATE OR REPLACE FUNCTION search_posts(query TEXT)
RETURNS TABLE (
  post_id UUID,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    ts_rank(to_tsvector('crowdup', title || ' ' || description), plainto_tsquery('crowdup', query)) as rank
  FROM posts
  WHERE to_tsvector('crowdup', title || ' ' || description) @@ plainto_tsquery('crowdup', query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 10. 📉 Performance Monitoring Queries

```sql
-- Slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Cache hit ratio (should be > 99%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- Active connections
SELECT 
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname;
```

---

## ✅ Implementation Checklist

- [ ] Add all missing indexes
- [ ] Create database views
- [ ] Setup materialized views
- [ ] Add database functions
- [ ] Implement triggers
- [ ] Add constraints
- [ ] Setup maintenance jobs
- [ ] Configure monitoring
- [ ] Test query performance
- [ ] Document changes

---

**Expected Performance Gains:**
- 10x faster queries with proper indexes
- 50% reduction in database load with views
- Real-time analytics with materialized views
- Automatic data consistency with triggers

**Last Updated:** November 23, 2024
