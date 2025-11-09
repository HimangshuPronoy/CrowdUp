"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PostCard from "@/components/PostCard";
import { TrendingUp, Users, MessageSquare, AlertCircle } from "lucide-react";
import { use } from "react";

export default function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const companyPosts = [
    {
      type: "Bug Report" as const,
      company: "Instagram",
      companyColor: "#E1306C",
      title: "Instagram stories loading incredibly slowly",
      description: "The stories feature has been taking 10+ seconds to load on my iPhone 14.",
      votes: 47,
      author: "Sarah Chen",
      authorInitial: "S",
      timestamp: "2h ago",
      comments: 12,
    },
    {
      type: "Feature Request" as const,
      company: "Instagram",
      companyColor: "#E1306C",
      title: "Add dark mode for Instagram web",
      description: "Would love to see a dark mode option for the web version of Instagram.",
      votes: 234,
      author: "John Doe",
      authorInitial: "J",
      timestamp: "5h ago",
      comments: 45,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Company Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-24 w-24 bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-purple-200">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                I
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Instagram</h1>
              <p className="text-gray-600 mb-4">
                Instagram is a photo and video sharing social networking service owned by Meta Platforms. 
                Connect with friends, share moments, and explore content from around the world.
              </p>
              <div className="flex items-center gap-4">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Follow
                </Button>
                <Button variant="outline">
                  Visit Website
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-500">15.4K</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">347</p>
              <p className="text-sm text-gray-600">Total Posts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">+12%</p>
              <p className="text-sm text-gray-600">Growth</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">23</p>
              <p className="text-sm text-gray-600">Active Issues</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6">
          <div className="flex items-center gap-4 px-6 py-3 border-b">
            <Button variant="ghost" className="text-orange-500 border-b-2 border-orange-500 rounded-none">
              All Posts
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-orange-500">
              Bug Reports
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-orange-500">
              Feature Requests
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-orange-500">
              Complaints
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {companyPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
}