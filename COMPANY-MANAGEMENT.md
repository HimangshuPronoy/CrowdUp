# Company Management System

## Overview

The Company Management System allows users to create and manage their own company pages, invite team members, and respond to community feedback.

## Features

### 1. Create Company Page
**Location**: `/company/create`

**Features:**
- Create your company profile
- Set company name and URL slug
- Add description and contact info
- Choose brand color
- Automatic owner assignment

**Fields:**
- Company Name (required)
- URL Slug (required, auto-generated)
- Description
- Website URL
- Contact Email
- Brand Color (hex code)

### 2. Team Management
**Location**: `/company/[slug]/manage`

**Roles:**
- **Owner**: Full control, cannot be removed
- **Admin**: Can invite/remove members, manage settings
- **Member**: Can respond to feedback
- **Viewer**: Read-only access

**Permissions:**
| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Respond to posts | ✅ | ✅ | ✅ | ❌ |
| View feedback | ✅ | ✅ | ✅ | ✅ |
| Edit company | ✅ | ✅ | ❌ | ❌ |

### 3. Team Invitations
**How it works:**

1. **Send Invitation**
   - Admin/Owner enters email and selects role
   - System generates unique invitation token
   - Invitation valid for 7 days

2. **Receive Invitation**
   - Invitee receives invitation link
   - Link format: `/invite/[token]`
   - Can accept or decline

3. **Accept Invitation**
   - User must be signed in
   - Automatically added to team
   - Redirected to company management

4. **Invitation States**
   - Pending: Waiting for response
   - Accepted: User joined team
   - Declined: User rejected invitation
   - Expired: Past expiration date

### 4. Company Responses (Coming Soon)
**Planned Features:**
- Respond to user feedback
- Mark status (acknowledged, in progress, completed, won't fix)
- Official company badge on responses
- Notification to post author

## Database Schema

### New Tables

#### company_members
```sql
- id (UUID)
- company_id (UUID, references companies)
- user_id (UUID, references profiles)
- role (text: owner, admin, member, viewer)
- invited_by (UUID, references profiles)
- joined_at (timestamp)
- UNIQUE(company_id, user_id)
```

#### company_invitations
```sql
- id (UUID)
- company_id (UUID, references companies)
- email (text)
- role (text: admin, member, viewer)
- invited_by (UUID, references profiles)
- token (text, unique)
- status (text: pending, accepted, declined, expired)
- expires_at (timestamp)
- created_at (timestamp)
```

#### company_responses
```sql
- id (UUID)
- post_id (UUID, references posts)
- company_id (UUID, references companies)
- user_id (UUID, references profiles)
- response (text)
- status (text: acknowledged, in_progress, completed, wont_fix)
- created_at (timestamp)
- updated_at (timestamp)
```

### Modified Tables

#### companies
Added columns:
- `owner_id` (UUID) - Primary owner
- `created_by` (UUID) - User who created it
- `verified` (boolean) - Verification status
- `website` (text) - Company website
- `email` (text) - Contact email

## Setup Instructions

### 1. Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Run supabase-company-management.sql
```

This creates:
- New tables for team management
- RLS policies for security
- Automatic triggers for owner assignment
- Invitation token generation

### 2. Test the Feature

1. **Create a Company**
   ```
   1. Go to /company/create
   2. Fill in company details
   3. Click "Create Company"
   4. Automatically become owner
   ```

2. **Invite Team Members**
   ```
   1. Go to /company/[slug]/manage
   2. Enter email and select role
   3. Click "Send Invite"
   4. Share invitation link
   ```

3. **Accept Invitation**
   ```
   1. Click invitation link
   2. Sign in if needed
   3. Click "Accept Invitation"
   4. Join company team
   ```

## User Flows

### Creating a Company

```
User → /company/create
  ↓
Fill form (name, slug, description, etc.)
  ↓
Submit
  ↓
Company created
  ↓
User added as owner
  ↓
Redirect to /company/[slug]/manage
```

### Inviting Team Members

```
Owner/Admin → /company/[slug]/manage
  ↓
Click "Team Members" tab
  ↓
Enter email + select role
  ↓
Click "Send Invite"
  ↓
Invitation created with token
  ↓
Share link: /invite/[token]
```

### Accepting Invitation

```
Invitee → /invite/[token]
  ↓
View invitation details
  ↓
Sign in (if needed)
  ↓
Click "Accept"
  ↓
Added to company_members
  ↓
Invitation marked as accepted
  ↓
Redirect to /company/[slug]/manage
```

## Security

### Row Level Security (RLS)

**company_members:**
- Anyone can view members
- Only admins/owners can add/remove members
- Cannot remove owner

**company_invitations:**
- Only company members can view invitations
- Only admins/owners can create invitations
- Only admins/owners can cancel invitations

**companies:**
- Anyone can view companies
- Authenticated users can create companies
- Only owners/admins can update companies

### Validation

- Email validation for invitations
- Unique constraints prevent duplicates
- Token-based invitation security
- Expiration dates on invitations
- Role-based access control

## API Examples

### Create Company
```typescript
const { data, error } = await supabase
  .from('companies')
  .insert({
    name: 'Acme Inc',
    slug: 'acme-inc',
    description: 'We make great products',
    color: '#FF6B35',
    created_by: user.id
  });
```

### Invite Team Member
```typescript
const { data, error } = await supabase
  .from('company_invitations')
  .insert({
    company_id: companyId,
    email: 'user@example.com',
    role: 'member',
    invited_by: user.id
  });
```

### Accept Invitation
```typescript
// Add to team
await supabase
  .from('company_members')
  .insert({
    company_id: invitation.company_id,
    user_id: user.id,
    role: invitation.role
  });

// Update invitation
await supabase
  .from('company_invitations')
  .update({ status: 'accepted' })
  .eq('id', invitation.id);
```

## UI Components

### Pages Created
- `/company/create` - Create company form
- `/company/[id]/manage` - Company management dashboard
- `/invite/[token]` - Invitation acceptance page

### Features
- Tabbed interface (Members, Invitations, Settings)
- Role badges with color coding
- Member list with avatars
- Invitation management
- Real-time updates

## Best Practices

### For Company Owners
1. Verify team member emails before inviting
2. Assign appropriate roles based on responsibilities
3. Regularly review team members
4. Keep company information up to date
5. Respond to community feedback promptly

### For Team Members
1. Accept invitations promptly
2. Understand your role permissions
3. Engage with community feedback
4. Maintain professional responses
5. Report issues to admins

## Troubleshooting

### Common Issues

**"Company already exists"**
- Slug must be unique
- Try a different company name/slug

**"Invitation expired"**
- Invitations expire after 7 days
- Request a new invitation

**"Already a member"**
- User is already part of the team
- Check team members list

**"Permission denied"**
- Only owners/admins can invite
- Check your role

## Future Enhancements

### Planned Features
- 📧 Email notifications for invitations
- 🔔 Real-time notifications for team activity
- 📊 Company analytics dashboard
- 💬 Official company responses to posts
- ✅ Company verification badges
- 🎨 Custom company branding
- 📱 Mobile app for team management
- 🔗 Integration with external tools
- 📈 Feedback analytics
- 🏆 Company reputation scores

### Potential Improvements
- Bulk invite functionality
- Team member search
- Role customization
- Activity logs
- Export team data
- Integration with Slack/Discord
- Automated responses
- Feedback categorization
- Priority tagging
- SLA tracking

## Support

For issues or questions:
- Check database logs in Supabase
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure user is authenticated
- Verify invitation token is valid
