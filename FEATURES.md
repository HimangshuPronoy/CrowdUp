# CrowdUp Features Guide

## 🎯 Core Features

### 1. Authentication
- **Sign Up**: Create account with email, username, and full name
- **Sign In**: Secure login with Supabase Auth
- **Profile**: Automatic profile creation on signup
- **Session**: Persistent login across page refreshes

### 2. Posts
- **Create**: Share bug reports, feature requests, or complaints
- **Types**: 
  - 🐛 Bug Report (red theme)
  - 💡 Feature Request (blue theme)
  - ⚠️ Complaint (yellow theme)
- **Details**: Title, description, company selection
- **Visibility**: All posts are public

### 3. Voting System
- **Upvote**: Show support for posts
- **Downvote**: Express disagreement
- **Real-time**: Vote counts update instantly
- **Karma**: Authors earn karma from upvotes
- **Visual**: Orange for upvotes, blue for downvotes

### 4. Comments
- **Add**: Share thoughts on any post
- **Thread**: View all comments chronologically
- **Author**: See who commented with avatar
- **Time**: Relative timestamps (e.g., "2 hours ago")

### 5. Companies
- **Browse**: View all companies
- **Follow**: Track companies you care about
- **Stats**: See follower count and post count
- **Posts**: View all feedback for a company
- **Colors**: Each company has unique brand color

---

## ⭐ Enhanced Features

### 6. Bookmarks
**Save posts for later reading**

- **Add**: Click bookmark icon on any post
- **Remove**: Click again to unbookmark
- **View**: Access all bookmarks at `/bookmarks`
- **Persist**: Bookmarks saved to database
- **Visual**: Filled icon when bookmarked

**Use Cases:**
- Save interesting posts to read later
- Keep track of important feedback
- Build a personal collection

### 7. Advanced Filtering
**Find exactly what you're looking for**

**Filter by Type:**
- All Types
- Bug Reports only
- Feature Requests only
- Complaints only

**Sort by:**
- Most Recent (newest first)
- Most Popular (highest votes)
- Most Discussed (most comments)

**Features:**
- Real-time filtering
- Persistent across page loads
- Reset button to clear filters
- Smooth transitions

### 8. Karma System
**Reputation based on community engagement**

**How it Works:**
- +1 karma for each upvote on your posts
- -1 karma when upvotes are removed
- Displayed on profile pages
- Automatic calculation via database triggers

**Benefits:**
- Encourages quality content
- Shows user credibility
- Gamification element
- Community recognition

**Display:**
- Profile pages: "⭐ 42 karma"
- Visible to all users
- Updates in real-time

### 9. Activity Feed
**Track interactions with your content**

**Shows:**
- Who upvoted your posts
- Who commented on your posts
- When interactions happened
- Which post was interacted with

**Features:**
- Last 20 interactions
- Click to view related post
- Time-based sorting
- Visual icons for activity types

**Activity Types:**
- 👍 Upvotes (orange)
- 💬 Comments (blue)
- 👥 Follows (green)

---

## 🎨 UI/UX Features

### 10. Modern Interface
**Beautiful, responsive design**

**Animations:**
- Hover effects on cards
- Scale transitions
- Smooth color changes
- Loading skeletons

**Colors:**
- Primary: Orange (#FF6B35)
- Success: Green
- Error: Red
- Neutral: Gray scale

**Typography:**
- Clear hierarchy
- Readable fonts
- Proper spacing
- Consistent sizing

### 11. Responsive Design
**Works on all devices**

- Desktop: Full layout with sidebar
- Tablet: Optimized spacing
- Mobile: Touch-friendly buttons
- Adaptive: Adjusts to screen size

---

## 📱 Navigation

### Header (Always Visible)
- **Logo**: Click to go home
- **Home**: View all posts
- **Search**: Find companies
- **Create**: New post (orange button)
- **Bookmarks**: Saved posts (signed in only)
- **Messages**: Coming soon
- **Profile**: Your profile
- **Notifications**: Activity alerts

### User Menu (Dropdown)
- Profile
- Bookmarks
- Activity Feed
- Settings
- Logout

### Sidebar (Desktop)
- Community Feed info
- Trending companies
- Community stats
- Quick navigation

---

## 🔍 Search & Discovery

### Search Page
- **Companies**: Find by name
- **Real-time**: Results as you type
- **Details**: See company info
- **Navigate**: Click to view company page

### Trending Page
- **Companies**: Most followed
- **Growth**: See trending metrics
- **Topics**: Popular categories
- **Stats**: Engagement numbers

---

## 👤 Profile Features

### Your Profile
- **Avatar**: Initial-based avatar
- **Info**: Name, username, bio
- **Stats**: 
  - Join date
  - Post count
  - Karma score
- **Posts**: All your posts
- **Edit**: Update via settings

### Other Profiles
- View posts
- See karma
- Check activity
- Follow (coming soon)

---

## ⚙️ Settings

### Profile Settings
- Update username
- Change full name
- Edit bio
- Profile picture (coming soon)

### Privacy
- Email (view only)
- Password change (coming soon)
- Account deletion (coming soon)

---

## 🚀 Quick Actions

### From Home
1. **Filter posts**: Use dropdowns
2. **Vote**: Click up/down arrows
3. **Comment**: Click comment count
4. **Bookmark**: Click bookmark icon
5. **Share**: Click share icon

### From Post Detail
1. **Vote**: Up/down arrows
2. **Comment**: Write and submit
3. **Bookmark**: Save for later
4. **Navigate**: Click company/author

### From Profile
1. **View posts**: Click on any post
2. **Edit**: Go to settings
3. **Share**: Copy profile URL

---

## 💡 Tips & Tricks

### Getting Started
1. Create an account
2. Browse trending companies
3. Create your first post
4. Engage with others' posts
5. Build your karma

### Maximizing Engagement
1. Write clear, detailed posts
2. Choose appropriate post type
3. Respond to comments
4. Vote on quality content
5. Follow companies you care about

### Building Reputation
1. Create valuable posts
2. Get upvotes to earn karma
3. Engage in discussions
4. Help others with comments
5. Be active in the community

---

## 🔔 Notifications (Coming Soon)

### Planned Features
- Real-time alerts
- Email notifications
- Push notifications
- Notification preferences
- Mark as read/unread

---

## 📊 Stats & Analytics

### Community Stats
- Active users
- Posts today
- Total companies
- Engagement metrics

### Personal Stats
- Karma score
- Post count
- Comment count
- Votes received

---

## 🎯 Best Practices

### Creating Posts
- ✅ Clear, descriptive titles
- ✅ Detailed descriptions
- ✅ Choose correct type
- ✅ Select right company
- ❌ Avoid spam
- ❌ No duplicate posts

### Commenting
- ✅ Be constructive
- ✅ Stay on topic
- ✅ Be respectful
- ❌ No harassment
- ❌ No spam

### Voting
- ✅ Vote based on quality
- ✅ Upvote helpful content
- ✅ Downvote spam/off-topic
- ❌ Don't vote manipulate
- ❌ Don't downvote disagreements

---

## 🆘 Getting Help

### Common Issues
- **Can't sign in**: Check email/password
- **Post not showing**: Refresh page
- **Votes not working**: Sign in first
- **Bookmarks missing**: Check `/bookmarks`

### Support
- Check TROUBLESHOOTING.md
- Review SETUP.md
- Check browser console
- Verify database setup
