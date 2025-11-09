"use client";

import Header from "@/components/Header";
import { Search, TrendingUp, ChevronDown, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SearchPage() {
  const categories = [
    { name: "Productivity", icon: "📦", gradient: "from-blue-400 to-cyan-500" },
    { name: "Social", icon: "👥", gradient: "from-pink-400 to-rose-500" },
    { name: "Education", icon: "💬", gradient: "from-yellow-400 to-orange-500" },
    { name: "AI Apps", icon: "🤖", gradient: "from-purple-400 to-violet-500" },
    { name: "Health", icon: "❤️", gradient: "from-red-400 to-pink-500" },
    { name: "Finance", icon: "💰", gradient: "from-green-400 to-emerald-500" },
    { name: "Beauty", icon: "💄", gradient: "from-pink-400 to-fuchsia-500" },
    { name: "Business", icon: "📊", gradient: "from-teal-400 to-cyan-500" },
  ];

  const companies = [
    {
      name: "Discord | Groupchat and Friends",
      description: "Discord is a free communication app that enables users to engage in voice, video, and text chat with friends and communities",
      reviews: 156,
      votes: "35k",
      voteTrend: "up",
      initial: "D",
      color: "bg-indigo-500",
    },
    {
      name: "Guilded | Chat for gaming communities",
      description: "Guilded is the best app for gaming chat. Guilded is perfect for gaming with friends, clans, guilds, communities, esports, LFG and teams.",
      reviews: 23,
      votes: "8k",
      voteTrend: "down",
      initial: "G",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Search Everything
          </h1>
          <p className="text-gray-600">Discover apps, connect with users, and explore posts</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for anything..."
            className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-gray-300 transition-colors"
          />
        </div>

        {/* Filters Container with Strokes */}
        <div className="mb-8 p-4 rounded-xl border-2 border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium shadow-sm"
            >
              Sort By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium shadow-sm"
            >
              Price
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium shadow-sm"
            >
              Date
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium shadow-sm"
            >
              Ratio
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Popular Categories
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${category.gradient} text-white border-2 border-white/30 hover:scale-105 hover:shadow-lg transition-all shadow-md hover:border-white/50`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Company Results */}
        <div className="space-y-4">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start gap-4">
                <Avatar className={`h-16 w-16 ${company.color} flex-shrink-0 ring-2 ring-gray-200`}>
                  <AvatarFallback className={`${company.color} text-white text-xl font-bold`}>
                    {company.initial}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{company.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{company.description}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={company.voteTrend === "up" ? "default" : "destructive"}
                        size="sm"
                        className={`rounded-full ${
                          company.voteTrend === "up" 
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-md shadow-orange-500/30" 
                            : ""
                        }`}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {company.votes}
                      </Button>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-gray-200 bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">{company.reviews} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200"
                  >
                    <span className="text-xl">💬</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="rounded-full border-2 border-gray-200 bg-gray-50 hover:bg-gradient-to-br hover:from-yellow-400 hover:to-orange-500 hover:text-white hover:border-gray-300 transition-all shadow-sm hover:shadow-md px-8"
          >
            More...
          </Button>
        </div>
      </main>
    </div>
  );
}