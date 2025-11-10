"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PostCard from "@/components/PostCard";
import { Calendar, Settings } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { formatDistanceToNow, format } from "date-fns";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  created_at: string;
}

interface Post {
  id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, username, display_name, bio, created_at")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      setLoading(false);
      return;
    }

    setProfile(userData);

    // Fetch user posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (!postsError && postsData) {
      setPosts(postsData);
      
      // Fetch comment counts
      const postIds = postsData.map(p => p.id);
      if (postIds.length > 0) {
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (commentsData) {
          const counts: Record<string, number> = {};
          commentsData.forEach((comment: { post_id: string }) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          setCommentCounts(counts);
        }
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading profile...</p>
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
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600 mb-4">User not found</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const formattedPosts = posts.map((post) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    description: post.description,
    votes: post.votes,
    author: profile.display_name,
    authorInitial: profile.display_name.charAt(0).toUpperCase(),
    timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    comments: commentCounts[post.id] || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl font-bold">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.display_name}</h1>
                <p className="text-gray-500 mb-3">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {posts.length}
              </p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {posts.reduce((sum, post) => sum + post.votes, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Votes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6">
          <div className="flex items-center gap-4 px-6 py-3 border-b">
            <Button variant="ghost" className="text-orange-500 border-b-2 border-orange-500 rounded-none">
              Posts ({posts.length})
            </Button>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-4">
          {formattedPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <p className="text-gray-600 mb-4">No posts yet</p>
              {isOwnProfile && (
                <Button
                  onClick={() => router.push("/create")}
                  className="rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                >
                  Create Your First Post
                </Button>
              )}
            </div>
          ) : (
            formattedPosts.map((post) => (
              <PostCard key={post.postId} {...post} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
