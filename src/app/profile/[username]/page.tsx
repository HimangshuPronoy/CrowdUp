"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Profile, Post } from "@/types/database";
import { formatDistanceToNow, format } from "date-fns";

export default function ProfilePage() {
  const params = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUserProfile?.username === params.username;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [params.username]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', params.username)
        .single();

      if (!profileData) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, full_name),
          companies (name, color, slug)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600">User not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border p-8 mb-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 bg-orange-500 ring-4 ring-orange-100">
              <AvatarFallback className="bg-orange-500 text-white text-3xl">
                {profile.full_name?.[0] || profile.username[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                </div>
                {isOwnProfile && (
                  <Button
                    onClick={() => window.location.href = '/settings'}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{posts.length} posts</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-semibold">
                  <span>⭐</span>
                  <span>{(profile as any).karma || 0} karma</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start bg-white border rounded-lg p-1 mb-6">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  type={post.type}
                  company={post.companies?.name || "Unknown"}
                  companyColor={post.companies?.color || "#000000"}
                  title={post.title}
                  description={post.description}
                  votes={post.votes_count}
                  author={post.profiles?.full_name || post.profiles?.username || "Anonymous"}
                  authorInitial={post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || "A"}
                  timestamp={formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  comments={post.comments_count}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-600">Comments coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
