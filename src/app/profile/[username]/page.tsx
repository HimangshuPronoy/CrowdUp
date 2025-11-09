"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import { MapPin, Link as LinkIcon, Calendar, Settings } from "lucide-react";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();

  const userPosts = [
    {
      type: "Bug Report" as const,
      company: "Instagram",
      companyColor: "#E1306C",
      title: "Instagram stories loading incredibly slowly",
      description: "The stories feature has been taking 10+ seconds to load on my iPhone 14. This started happening after the latest update. It's making the app basically unusable for stories.",
      votes: 47,
      author: "Lorenzo Adacher",
      authorInitial: "L",
      timestamp: "2h ago",
      comments: 12,
    },
    {
      type: "Feature Request" as const,
      company: "Spotify",
      companyColor: "#1DB954",
      title: "Add playlist collaborative editing",
      description: "Would love to see real-time collaborative playlist editing where multiple users can add/remove songs simultaneously.",
      votes: 89,
      author: "Lorenzo Adacher",
      authorInitial: "L",
      timestamp: "1d ago",
      comments: 23,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-orange-500 to-orange-600 ring-4 ring-orange-200">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-3xl font-bold">
                  L
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">Lorenzo Adacher</h1>
                <p className="text-gray-500 mb-3">@{username}</p>
                <p className="text-gray-700 max-w-2xl mb-4">
                  Product designer & tech enthusiast. Passionate about creating better user experiences. 
                  Always looking for ways to improve the apps we use daily! 🚀
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a href="#" className="text-orange-500 hover:underline">lorenzo.design</a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined March 2023</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">127</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">2.4K</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">342</p>
              <p className="text-sm text-gray-600">Following</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">8.5K</p>
              <p className="text-sm text-gray-600">Upvotes</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 pt-6 border-t mt-6">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
              🏆 Top Contributor
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              ⚡ Early Adopter
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              💡 Feature Hunter
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6">
          <div className="flex items-center gap-4 px-6 py-3 border-b">
            <Button variant="ghost" className="text-orange-500 border-b-2 border-orange-500 rounded-none">
              Posts
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-orange-500">
              Comments
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-orange-500">
              Upvoted
            </Button>
          </div>
        </div>

        {/* User Posts */}
        <div className="space-y-4">
          {userPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
}