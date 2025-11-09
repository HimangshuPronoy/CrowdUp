"use client";

import { TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const trendingGroups = [
    { name: "Instagram", followers: "15.4K", growth: "+12%", initial: "I", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500", id: "instagram" },
    { name: "WhatsApp", followers: "12.3K", growth: "+8%", initial: "W", color: "bg-green-500", id: "whatsapp" },
    { name: "Spotify", followers: "9.8K", growth: "+15%", initial: "S", color: "bg-green-600", id: "spotify" },
    { name: "Discord", followers: "8.7K", growth: "+5%", initial: "D", color: "bg-indigo-600", id: "discord" },
  ];

  return (
    <div className="space-y-4 sticky top-24">
      {/* Community Feed */}
      <div className="rounded-2xl bg-orange-50 p-5 border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">Community Feed</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Latest feedback and suggestions from the community
        </p>
      </div>

      {/* Trending Groups */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">Trending Group</h3>
        </div>
        
        <div className="space-y-3">
          {trendingGroups.map((group) => (
            <button
              key={group.name}
              onClick={() => router.push(`/company/${group.id}`)}
              className="w-full flex items-center justify-between hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className={`h-10 w-10 ${group.color}`}>
                  <AvatarFallback className={`${group.color} text-white font-semibold text-sm`}>
                    {group.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium text-sm text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500">{group.followers} followers</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">{group.growth}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-base text-gray-900">Community</h3>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Active Users</span>
            <span className="font-semibold text-gray-900">24.7K</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Posts Today</span>
            <span className="font-semibold text-gray-900">156</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-600">Companies</span>
            <span className="font-semibold text-gray-900">847</span>
          </div>
        </div>
      </div>
    </div>
  );
}