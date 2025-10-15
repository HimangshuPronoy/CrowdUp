# Engagement Algorithm - CrowdUp

## Overview

CrowdUp uses a sophisticated multi-factor engagement algorithm inspired by neuroscience principles and social media best practices to keep users engaged and surface the most relevant content.

## Algorithm Components

### 1. Engagement Score (0-100)
**The master score that ranks all content**

Weighted combination of:
- 35% Virality Score
- 25% Recency Score  
- 20% Quality Score
- 15% Controversy Score
- 5% Raw Votes

### 2. Virality Score
**Measures rapid growth and sharing potential**

```
Formula: (upvotes + comments×2 + shares×3) / (hours_old + 1)
```

**Why it works:**
- Rewards fast-growing content
- Comments worth 2x votes (deeper engagement)
- Shares worth 3x votes (network effect)
- Time decay prevents old viral posts from dominating

**Neuroscience:** Taps into FOMO (Fear of Missing Out) and social proof

### 3. Controversy Score
**High engagement from both sides = more interesting**

```
Formula: min(upvotes, downvotes) / max(upvotes, downvotes) × 100
```

**Why it works:**
- Balanced debate = more engagement
- Prevents echo chambers
- Surfaces diverse opinions
- Encourages discussion

**Neuroscience:** Activates curiosity and tribal instincts

### 4. Recency Score
**Newer content gets priority**

```
Formula: 100 × e^(-hours_old/24)
```

**Decay curve:**
- 0 hours: 100 points
- 24 hours: 37 points
- 48 hours: 14 points
- 72 hours: 5 points

**Why it works:**
- Fresh content feels relevant
- Prevents stale feed
- Encourages regular posting

**Neuroscience:** Novelty seeking behavior

### 5. Quality Score
**Engagement rate matters**

```
Formula: (clicks/views × 50) + (comments/(views/10) × 50)
```

**Metrics:**
- Click-through rate (CTR)
- Comment rate
- View duration
- Completion rate

**Why it works:**
- Rewards compelling content
- Filters clickbait
- Promotes meaningful engagement

**Neuroscience:** Reward prediction and satisfaction

## Feed Algorithms

### Best (Smart Feed) - Default
**Balanced mix of quality, recency, and engagement**

```sql
ORDER BY engagement_score DESC
```

- Uses full engagement algorithm
- Best for discovery
- Balances all factors
- Default experience

### Hot (Viral)
**Fast-growing, trending content**

```sql
ORDER BY virality_score DESC
```

- Emphasizes rapid growth
- Shows what's trending NOW
- Great for FOMO
- Updates frequently

### New
**Chronological feed**

```sql
ORDER BY created_at DESC
```

- Pure recency
- No algorithmic filtering
- See everything
- Power user preference

### Most Discussed
**High comment activity**

```sql
ORDER BY comments_count DESC
```

- Active conversations
- Community engagement
- Deep discussions
- Quality over quantity

### Controversial
**Balanced debate**

```sql
ORDER BY controversy_score DESC
```

- Diverse opinions
- Heated discussions
- Both sides engaged
- Thought-provoking

## Neuroscience Principles

### 1. Variable Rewards
**Like slot machines, unpredictable rewards keep users engaged**

Implementation:
- Mix of content types
- Surprise viral posts
- Varied engagement levels
- Dopamine hits

### 2. Social Validation
**Humans crave approval and belonging**

Implementation:
- Vote counts visible
- Comment counts
- Trending indicators
- Karma system

### 3. FOMO (Fear of Missing Out)
**Anxiety about missing important content**

Implementation:
- "Hot" and "Trending" feeds
- Real-time updates
- Notification badges
- Time-sensitive content

### 4. Curiosity Gap
**Incomplete information drives engagement**

Implementation:
- Truncated descriptions
- "Read more" prompts
- Image previews
- Controversy indicators

### 5. Tribal Behavior
**Humans form groups and defend positions**

Implementation:
- Company pages
- Follow system
- Controversy score
- Team responses

### 6. Reciprocity
**Give value, get engagement**

Implementation:
- Karma system
- Recognition badges
- Company responses
- Community building

## View Tracking

### Metrics Collected
- **View Count**: How many times seen
- **View Duration**: How long viewed
- **Click Count**: How many clicked through
- **User ID**: Who viewed (if logged in)

### Privacy
- Anonymous views tracked
- Aggregated data only
- No personal tracking
- GDPR compliant

## Engagement Optimization

### For Users
**How to get more visibility:**

1. **Post at peak times**
   - When your audience is active
   - Weekday mornings/evenings
   - Avoid late nights

2. **Encourage discussion**
   - Ask questions
   - Be controversial (respectfully)
   - Respond to comments
   - Engage early

3. **Use images**
   - Visual content performs better
   - 2-4 images optimal
   - High quality matters

4. **Write compelling titles**
   - Clear and specific
   - Emotional hooks
   - Avoid clickbait
   - Promise value

5. **Engage quickly**
   - First hour is critical
   - Respond to comments
   - Share on other platforms
   - Build momentum

### For Companies
**How to manage feedback:**

1. **Respond quickly**
   - First response matters
   - Show you're listening
   - Be authentic
   - Acknowledge issues

2. **Engage with controversy**
   - Don't hide from criticism
   - Address concerns
   - Show progress
   - Build trust

3. **Reward good feedback**
   - Upvote quality posts
   - Implement suggestions
   - Give credit
   - Build community

## Technical Implementation

### Database Schema
```sql
-- Engagement metrics
engagement_score FLOAT
virality_score FLOAT
controversy_score FLOAT
recency_score FLOAT
quality_score FLOAT

-- Tracking metrics
view_count INTEGER
click_count INTEGER
share_count INTEGER
```

### Calculation Frequency
- **Real-time**: Views, clicks, votes
- **Every 15 min**: Hot posts refresh
- **Every hour**: Full recalculation
- **Daily**: Historical cleanup

### Performance
- Materialized views for hot posts
- Indexed score columns
- Cached calculations
- Efficient queries

## A/B Testing

### Metrics to Track
1. **Session Duration**: Time on platform
2. **Posts per Session**: Content consumed
3. **Return Rate**: Daily active users
4. **Engagement Rate**: Votes + comments
5. **Viral Coefficient**: Shares per post

### Experiments to Run
1. **Weight Adjustments**: Test different factor weights
2. **Decay Rates**: Optimize recency decay
3. **Feed Mix**: Vary content diversity
4. **Notification Timing**: When to alert users
5. **Content Types**: What performs best

## Future Enhancements

### Personalization
- User interest tracking
- Collaborative filtering
- ML-based recommendations
- Custom feed preferences

### Advanced Metrics
- Sentiment analysis
- Topic modeling
- Network effects
- Influence scores

### Gamification
- Streak tracking
- Achievement badges
- Leaderboards
- Challenges

### AI Integration
- Content moderation
- Spam detection
- Quality prediction
- Trend forecasting

## Ethical Considerations

### Transparency
- Users can see why content is shown
- Algorithm explanation available
- No hidden manipulation
- User control over feed

### Well-being
- No infinite scroll addiction
- Positive content prioritized
- Toxic content filtered
- Mental health focus

### Fairness
- No pay-to-win
- Equal opportunity for visibility
- Merit-based ranking
- Community-driven

## Monitoring

### Key Metrics
- Average engagement score
- Score distribution
- Algorithm effectiveness
- User satisfaction

### Alerts
- Sudden score drops
- Viral content detection
- Spam patterns
- System health

## Summary

The CrowdUp engagement algorithm balances:
- ✅ User engagement (keep people interested)
- ✅ Content quality (surface best posts)
- ✅ Fairness (everyone gets a chance)
- ✅ Freshness (new content matters)
- ✅ Diversity (varied perspectives)

Result: A feed that's engaging, fair, and addictive (in a good way)! 🚀
