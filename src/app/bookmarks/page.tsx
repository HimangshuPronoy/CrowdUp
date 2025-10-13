"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function BookmarksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view bookmarks");
      router.push("/auth/login");
      return;
    }
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select(`
          post_id,
          posts (
            *,
            profiles (username, full_name),
            companies (name, color, slug)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract posts from bookmarks
      const bookmarkedPosts = bookmarks
        ?.map((b: any) => b.posts)
        .filter(Boolean) || [];

      setPosts(bookmarkedPosts);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bookmarked Posts</h1>
            <p className="text-gray-600">Posts you've saved for later</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No bookmarks yet</p>
            <p className="text-sm text-gray-500">
              Click the bookmark icon on posts to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
