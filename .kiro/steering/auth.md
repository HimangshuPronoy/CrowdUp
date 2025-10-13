## Authentication Patterns

### Auth Context

The app uses a centralized `AuthContext` for authentication state management:

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, profile, loading, signIn, signUp, signOut } = useAuth();
```

### Protected Routes

Pages that require authentication should check for user and redirect:

```typescript
useEffect(() => {
  if (!user) {
    toast.error("Please sign in");
    router.push("/auth/login");
  }
}, [user]);
```

### User Profile Access

- `user` - Supabase auth user object (id, email, etc.)
- `profile` - User profile from profiles table (username, full_name, bio, avatar_url)

### Auth Pages

- `/auth/login` - Sign in page
- `/auth/signup` - Sign up page (creates profile automatically)

### Supabase Client Usage

**Client-side** (in components):
```typescript
import { supabase } from "@/lib/supabase";
```

**Server-side** (in API routes/server actions):
```typescript
import { supabaseAdmin } from "@/lib/supabase";
```

### Common Auth Patterns

**Check if user is authenticated:**
```typescript
if (!user) {
  toast.error("Please sign in");
  router.push("/auth/login");
  return;
}
```

**Check if user owns resource:**
```typescript
const isOwner = user?.id === post.user_id;
```

**Display user info:**
```typescript
{profile?.full_name || profile?.username || "Anonymous"}
{profile?.full_name?.[0] || profile?.username?.[0] || "A"}
```

### Row Level Security (RLS)

All database tables have RLS enabled. Key policies:

- **Public read** - Anyone can view posts, comments, profiles, companies
- **Authenticated write** - Only signed-in users can create content
- **Owner update/delete** - Users can only modify their own content
- **User ID matching** - Enforced via `auth.uid() = user_id` checks
