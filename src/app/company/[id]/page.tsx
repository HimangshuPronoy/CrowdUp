"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Company, Post } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchCompany();
    fetchCompanyPosts();
    if (user) {
      checkFollowing();
      checkMembership();
    }
  }, [params.id, user]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', params.id)
        .single();

      if (error) throw error;
      setCompany(data);

      // Get followers count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', data.id);

      setFollowersCount(count || 0);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyPosts = async () => {
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', params.id)
        .single();

      if (!companyData) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, full_name),
          companies (name, color, slug)
        `)
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching company posts:', error);
    }
  };

  const checkFollowing = async () => {
    if (!user || !company) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .single();

    setIsFollowing(!!data);
  };

  const checkMembership = async () => {
    if (!user) return;

    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', params.id)
        .single();

      if (!companyData) return;

      const { data } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyData.id)
        .single();

      setIsMember(!!data);
    } catch (error) {
      // Not a member
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow");
      router.push("/auth/login");
      return;
    }

    if (!company) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('company_id', company.id);

        setIsFollowing(false);
        setFollowersCount(followersCount - 1);
        toast.success(`Unfollowed ${company.name}`);
      } else {
        await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            company_id: company.id
          });

        setIsFollowing(true);
        setFollowersCount(followersCount + 1);
        toast.success(`Following ${company.name}`);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600">Company not found</p>
          </div>
        </main>
      </div>
    );
  }

  const stats = [
    { label: "Followers", value: followersCount, icon: Users },
    { label: "Posts", value: posts.length, icon: MessageSquare },
    { label: "Trending", value: posts.filter(p => p.votes_count > 10).length, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Company Header */}
        <div className="bg-white rounded-lg border p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: company.color }}
              >
                {company.name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{company.name}</h1>
                {company.description && (
                  <p className="text-gray-600">{company.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isMember && (
                <Button
                  onClick={() => router.push(`/company/${params.id}/manage`)}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                >
                  Manage Company
                </Button>
              )}
              <Button
                onClick={handleFollow}
                className={isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-orange-500 hover:bg-orange-600"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Feedback</h2>
            <Button
              onClick={() => router.push('/create')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Share Feedback
            </Button>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-600 mb-4">No feedback yet for {company.name}</p>
              <Button
                onClick={() => router.push('/create')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Be the first to share
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
      </main>
    </div>
  );
}
