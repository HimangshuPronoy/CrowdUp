"use client";

import Header from "@/components/Header";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "post" | "user" | "company";
  data: any;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { name: "Productivity", icon: "📦", gradient: "from-blue-400 to-cyan-500" },
    { name: "Social", icon: "👥", gradient: "from-pink-400 to-rose-500" },
    { name: "Entertainment", icon: "🎮", gradient: "from-purple-400 to-violet-500" },
    { name: "Communication", icon: "💬", gradient: "from-yellow-400 to-orange-500" },
    { name: "Music", icon: "🎵", gradient: "from-green-400 to-emerald-500" },
    { name: "Photo & Video", icon: "📸", gradient: "from-red-400 to-pink-500" },
    { name: "Shopping", icon: "🛍️", gradient: "from-indigo-400 to-purple-500" },
    { name: "Business", icon: "📊", gradient: "from-teal-400 to-cyan-500" },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    const query = searchQuery.toLowerCase().trim();
    const allResults: SearchResult[] = [];

    // Search posts
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%`)
      .limit(10);

    if (posts) {
      posts.forEach((post: any) => {
        allResults.push({ type: "post", data: post });
      });
    }

    // Search users
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(5);

    if (users) {
      users.forEach((user: any) => {
        allResults.push({ type: "user", data: user });
      });
    }

    // Get unique companies from posts
    const { data: companies } = await supabase
      .from("posts")
      .select("company, company_color")
      .ilike("company", `%${query}%`)
      .limit(5);

    if (companies) {
      const uniqueCompanies = Array.from(
        new Map(companies.map((c: any) => [c.company, c])).values()
      );
      uniqueCompanies.forEach((company: any) => {
        allResults.push({ type: "company", data: company });
      });
    }

    setResults(allResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Search Everything
          </h1>
          <p className="text-gray-600">Discover posts, users, and companies</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for posts, users, or companies..."
            className="pl-10 h-12 rounded-xl border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600">No results found for "{searchQuery}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, index) => {
              if (result.type === "post") {
                const post = result.data;
                return (
                  <PostCard
                    key={`post-${index}`}
                    postId={post.id}
                    type={post.type}
                    company={post.company}
                    companyColor={post.company_color}
                    title={post.title}
                    description={post.description}
                    votes={post.votes}
                    author={post.users.display_name}
                    authorInitial={post.users.display_name.charAt(0).toUpperCase()}
                    timestamp={formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                    comments={0}
                  />
                );
              }

              if (result.type === "user") {
                const user = result.data;
                return (
                  <button
                    key={`user-${index}`}
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="w-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xl font-bold">
                          {user.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold">{user.display_name}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              }

              if (result.type === "company") {
                const company = result.data;
                return (
                  <button
                    key={`company-${index}`}
                    onClick={() => router.push(`/company/${company.company.toLowerCase()}`)}
                    className="w-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: company.company_color }}
                      >
                        {company.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{company.company}</h3>
                        <p className="text-sm text-gray-600">View all posts</p>
                      </div>
                    </div>
                  </button>
                );
              }

              return null;
            })}
          </div>
        )}

        {!searchQuery && (
          <>
            {/* Popular Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-br from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSearchQuery(category.name)}
                    className={`h-24 flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${category.gradient} text-white border-2 border-white/30 hover:scale-105 hover:shadow-lg transition-all shadow-md hover:border-white/50`}
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center py-12 bg-white rounded-2xl border">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Start typing to search or click a category above</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
