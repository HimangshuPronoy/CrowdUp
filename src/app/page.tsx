"use client";

import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import PodiumView from "@/components/PodiumView";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import SidePanel from "@/components/SidePanel";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"featured" | "new" | "top">("featured");
  const [displayCount, setDisplayCount] = useState(10);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `);

    // Apply sorting
    if (sortBy === "new") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "top") {
      query = query.order("votes", { ascending: false });
    } else {
      // Featured: combination of votes and recency
      query = query.order("votes", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      setPosts(data as Post[]);
      
      // Fetch comment counts for all posts
      if (data.length > 0) {
        const postIds = data.map((p: any) => p.id);
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (commentsData) {
          const counts: Record<string, number> = {};
          commentsData.forEach((comment: any) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          setCommentCounts(counts);
        }
      }
    }
    setLoading(false);
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  const topPosts = posts.slice(0, 3).map((post, index) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    votes: post.votes,
    rank: (index + 1) as 1 | 2 | 3,
  }));

  const formattedPosts = posts.map((post) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    description: post.description,
    votes: post.votes,
    author: post.users.display_name,
    authorInitial: post.users.display_name.charAt(0).toUpperCase(),
    timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    comments: commentCounts[post.id] || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-6 pt-28 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading posts...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-8">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 space-y-4">
            {/* Podium View */}
            {topPosts.length === 3 && (
              <PodiumView posts={topPosts as [typeof topPosts[0], typeof topPosts[1], typeof topPosts[2]]} />
            )}

            {/* Sort dropdown */}
            <div className="mb-6 relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 text-sm font-medium hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
              >
                Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showSortMenu && (
                <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => { setSortBy("featured"); setShowSortMenu(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                  >
                    Featured
                  </button>
                  <button
                    onClick={() => { setSortBy("new"); setShowSortMenu(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    New
                  </button>
                  <button
                    onClick={() => { setSortBy("top"); setShowSortMenu(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                  >
                    Top
                  </button>
                </div>
              )}
            </div>

            {formattedPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border">
                <p className="text-gray-600 mb-4">No posts yet. Be the first to share!</p>
                <Button
                  onClick={() => window.location.href = "/create"}
                  className="rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                >
                  Create Post
                </Button>
              </div>
            ) : (
              <>
                {formattedPosts.slice(0, displayCount).map((post) => (
                  <PostCard key={post.postId} {...post} />
                ))}
                
                {displayCount < formattedPosts.length && (
                  <div className="text-center py-8">
                    <Button 
                      onClick={loadMore}
                      variant="outline" 
                      size="lg" 
                      className="rounded-full px-8 hover:bg-gradient-to-br hover:from-yellow-400 hover:to-orange-500 hover:text-white hover:border-transparent border-gray-300 transition-all shadow-lg hover:shadow-orange-500/30"
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-80 hidden lg:block">
            <Sidebar />
          </aside>
        </div>
      </main>
      <SidePanel />
    </div>
  );
}
