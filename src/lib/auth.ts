import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface SignUpData {
  username: string;
  display_name: string;
  email: string;
  password: string;
}

export interface SignInData {
  usernameOrEmail: string;
  password: string;
}

export async function signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if username exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .single();

    if (existingUsername) {
      return { user: null, error: 'Username already taken' };
    }

    // Check if email exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingEmail) {
      return { user: null, error: 'Email already registered' };
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: data.username,
        display_name: data.display_name,
        email: data.email,
        password_hash,
      })
      .select('id, username, display_name, email, avatar_url, bio, created_at')
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    // Store session
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userId', newUser.id);
    }

    return { user: newUser, error: null };
  } catch (error) {
    return { user: null, error: 'An error occurred during sign up' };
  }
}

export async function signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
  try {
    // Find user by username or email
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${data.usernameOrEmail},email.eq.${data.usernameOrEmail}`)
      .limit(1);

    if (fetchError || !users || users.length === 0) {
      return { user: null, error: 'Invalid credentials' };
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password_hash);

    if (!isValid) {
      return { user: null, error: 'Invalid credentials' };
    }

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    // Store session
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('userId', user.id);

    return { user: userWithoutPassword, error: null };
  } catch (error) {
    return { user: null, error: 'An error occurred during sign in' };
  }
}

export function signOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}
