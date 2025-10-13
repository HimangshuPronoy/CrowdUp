"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import FilterBar from "@/components/FilterBar";
import SidePanel from "@/components/SidePanel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/database";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");

  useEffect(() => {
    fetchPosts();
  }, [selectedType, selectedSort]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (username, full_name),
          companies (name, color, slug)
        `);

      // Apply type filter
      if (selectedType !== "all") {
        query = query.eq('type', selectedType);
      }

      // Apply sorting
      switch (selectedSort) {
        case "popular":
          query = query.order('votes_count', { ascending: false });
          break;
        case "discussed":
          query = query.order('comments_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <aside className="w-80">
              <Sidebar />
            </aside>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1">
            <FilterBar
              selectedType={selectedType}
              selectedSort={selectedSort}
              onTypeChange={setSelectedType}
              onSortChange={setSelectedSort}
            />
            <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600 mb-4">No posts yet. Be the first to share feedback!</p>
                <Button
                  onClick={() => window.location.href = '/create'}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Create Post
                </Button>
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
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-80">
            <Sidebar />
          </aside>
        </div>
      </main>
      <SidePanel />
    </div>
  );
}