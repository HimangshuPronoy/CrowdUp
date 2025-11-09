"use client";

import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import PodiumView from "@/components/PodiumView";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import SidePanel from "@/components/SidePanel";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const topPosts = [
    {
      postId: "3",
      type: "Complaint" as const,
      company: "Spotify",
      companyColor: "#1DB954",
      title: "Spotify's new UI is confusing and hard to navigate",
      votes: 156,
      rank: 1 as const,
    },
    {
      postId: "1",
      type: "Bug Report" as const,
      company: "Instagram",
      companyColor: "#E1306C",
      title: "Instagram stories loading incredibly slowly",
      votes: 47,
      rank: 2 as const,
    },
    {
      postId: "2",
      type: "Feature Request" as const,
      company: "WhatsApp",
      companyColor: "#25D366",
      title: "WhatsApp needs message scheduling feature",
      votes: 23,
      rank: 3 as const,
    },
  ];

  const posts = [
    {
      postId: "1",
      type: "Bug Report" as const,
      company: "Instagram",
      companyColor: "#E1306C",
      title: "Instagram stories loading incredibly slowly",
      description: "The stories feature has been taking 10+ seconds to load on my iPhone 14. This started happening after the latest update. It's making the app basically unusable for stories.",
      votes: 47,
      author: "Sarah Chen",
      authorInitial: "S",
      timestamp: "2h ago",
      comments: 12,
    },
    {
      postId: "2",
      type: "Feature Request" as const,
      company: "WhatsApp",
      companyColor: "#25D366",
      title: "WhatsApp needs message scheduling feature",
      description: "It would be amazing if WhatsApp added the ability to schedule messages for later. This would be super helpful for work communications across time zones.",
      votes: 23,
      author: "Mike Rodriguez",
      authorInitial: "M",
      timestamp: "4h ago",
      comments: 8,
    },
    {
      postId: "3",
      type: "Complaint" as const,
      company: "Spotify",
      companyColor: "#1DB954",
      title: "Spotify's new UI is confusing and hard to navigate",
      description: "The recent redesign has made it much harder to find my playlists and discover new music. The old interface was much more intuitive. Please consider reverting some of these changes.",
      votes: 156,
      author: "Alex Thompson",
      authorInitial: "A",
      timestamp: "6h ago",
      comments: 34,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-8">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 space-y-4">
            {/* Podium View */}
            <PodiumView posts={topPosts as [typeof topPosts[0], typeof topPosts[1], typeof topPosts[2]]} />

            {/* Sort dropdown */}
            <div className="mb-6">
              <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 text-sm font-medium hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30">
                Sort by: Featured
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {posts.map((post) => (
              <PostCard key={post.postId} {...post} />
            ))}
            
            <div className="text-center py-8">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 hover:bg-gradient-to-br hover:from-yellow-400 hover:to-orange-500 hover:text-white hover:border-transparent border-gray-300 transition-all shadow-lg hover:shadow-orange-500/30"
              >
                Load More Posts
              </Button>
            </div>
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