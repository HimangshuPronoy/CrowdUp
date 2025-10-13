# Company Management - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Run Database Migration
In your Supabase SQL Editor, run:
```sql
-- Copy and paste the entire contents of:
supabase-company-management.sql
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Create Your First Company
1. Go to http://localhost:3000/company/create
2. Fill in the form
3. Click "Create Company"

## 📋 What's New

### New Pages
- **`/company/create`** - Create your company page
- **`/company/[slug]/manage`** - Manage team and settings
- **`/invite/[token]`** - Accept team invitations

### New Features
✅ Create company pages
✅ Invite team members via email
✅ Role-based access control (Owner, Admin, Member, Viewer)
✅ Team management dashboard
✅ Invitation system with expiration
✅ Automatic owner assignment

## 🎯 User Roles

### Owner
- Full control over company
- Cannot be removed
- Can do everything

### Admin
- Invite/remove team members
- Manage company settings
- Respond to feedback

### Member
- View company dashboard
- Respond to feedback
- Cannot manage team

### Viewer
- Read-only access
- View feedback only

## 📝 How to Use

### Create a Company

1. **Navigate to Create Page**
   ```
   Click "Create Your Company" on search page
   OR go to /company/create
   ```

2. **Fill in Details**
   - Company Name (required)
   - URL Slug (auto-generated or custom)
   - Description
   - Website
   - Contact Email
   - Brand Color

3. **Submit**
   - You become the owner automatically
   - Redirected to management dashboard

### Invite Team Members

1. **Go to Management Dashboard**
   ```
   /company/[your-slug]/manage
   ```

2. **Click "Team Members" Tab**

3. **Enter Details**
   - Email address
   - Select role (Admin, Member, or Viewer)

4. **Send Invitation**
   - Invitation link generated
   - Valid for 7 days
   - Share link with team member

### Accept Invitation

1. **Click Invitation Link**
   ```
   /invite/[token]
   ```

2. **Sign In** (if not already)

3. **Review Details**
   - See company name
   - See your assigned role

4. **Accept or Decline**
   - Accept: Join the team
   - Decline: Reject invitation

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Role-based permissions
- ✅ Token-based invitations
- ✅ Expiration dates
- ✅ Unique constraints
- ✅ Owner protection (cannot be removed)

## 📊 Database Tables

### company_members
Stores team members and their roles

### company_invitations
Tracks pending/accepted/declined invitations

### company_responses (Coming Soon)
Official company responses to feedback

## 🎨 UI Features

### Management Dashboard
- **Tabbed Interface**
  - Team Members
  - Invitations
  - Settings

- **Member List**
  - Avatar display
  - Role badges
  - Join date
  - Remove option (for admins)

- **Invitation List**
  - Pending invitations
  - Expiration dates
  - Cancel option

### Company Page Updates
- "Manage Company" button for team members
- Shows if you're a team member
- Quick access to management

## 🔄 Workflows

### Creating & Managing a Company

```
1. Create company → Become owner
2. Invite team members → Send invitations
3. Team accepts → Members join
4. Manage team → Add/remove as needed
5. Respond to feedback → Engage community
```

### Team Member Journey

```
1. Receive invitation link
2. Click link → View invitation
3. Sign in (if needed)
4. Accept invitation → Join team
5. Access management dashboard
6. Start responding to feedback
```

## 💡 Tips

### For Owners
- Set up your company profile completely
- Invite trusted team members
- Assign appropriate roles
- Review team regularly
- Keep company info updated

### For Team Members
- Accept invitations promptly
- Understand your role permissions
- Engage with community feedback
- Communicate with team
- Report issues to admins

## 🐛 Troubleshooting

### "Company already exists"
**Solution**: Choose a different name/slug

### "Invitation expired"
**Solution**: Request new invitation from admin

### "Permission denied"
**Solution**: Check your role permissions

### "Already a member"
**Solution**: You're already on the team

### Can't see "Manage Company" button
**Solution**: You need to be a team member

## 📈 Next Steps

After setup:
1. ✅ Create your company
2. ✅ Invite your team
3. ✅ Customize company profile
4. ✅ Start engaging with feedback
5. ✅ Build your community presence

## 🔮 Coming Soon

- 📧 Email notifications for invitations
- 💬 Official company responses to posts
- ✅ Company verification badges
- 📊 Analytics dashboard
- 🎨 Custom branding options
- 📱 Mobile team management

## 📚 Documentation

- **Full Guide**: COMPANY-MANAGEMENT.md
- **Database Schema**: supabase-company-management.sql
- **Features List**: FEATURES.md
- **Enhancements**: ENHANCEMENTS.md

## ✅ Checklist

Before going live:
- [ ] Run database migration
- [ ] Test company creation
- [ ] Test team invitations
- [ ] Verify role permissions
- [ ] Check RLS policies
- [ ] Test invitation acceptance
- [ ] Verify email validation
- [ ] Test member removal
- [ ] Check expiration handling
- [ ] Test all user roles

## 🆘 Support

Need help?
1. Check COMPANY-MANAGEMENT.md
2. Review database logs
3. Check browser console
4. Verify authentication
5. Test with different roles

---

**Ready to build your company presence on CrowdUp!** 🎉
