export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  color: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  owner_id: string | null;
  created_by: string | null;
  verified: boolean;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by: string | null;
  joined_at: string;
}

export interface CompanyInvitation {
  id: string;
  company_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  company_id: string;
  type: 'Bug Report' | 'Feature Request' | 'Complaint';
  title: string;
  description: string;
  votes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  companies?: Company;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Follow {
  id: string;
  user_id: string;
  company_id: string;
  created_at: string;
}
