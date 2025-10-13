"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, MessageSquare, ThumbsUp, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  type: 'vote' | 'comment' | 'post' | 'follow';
  user: {
    username: string;
    full_name: string | null;
  };
  post?: {
    id: string;
    title: string;
  };
  company?: {
    name: string;
  };
  created_at: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view activity");
      router.push("/auth/login");
      return;
    }
    fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    if (!user) return;

    try {
      // Fetch recent votes on user's posts
      const { data: votes } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          vote_type,
          profiles!votes_user_id_fkey (username, full_name),
          posts!votes_post_id_fkey (id, title, user_id)
        `)
        .eq('posts.user_id', user.id)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent comments on user's posts
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          profiles!comments_user_id_fkey (username, full_name),
          posts!comments_post_id_fkey (id, title, user_id)
        `)
        .eq('posts.user_id', user.id)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Combine and sort activities
      const allActivities: ActivityItem[] = [
        ...(votes?.map((v: any) => ({
          id: v.id,
          type: 'vote' as const,
          user: v.profiles,
          post: v.posts,
          created_at: v.created_at
        })) || []),
        ...(comments?.map((c: any) => ({
          id: c.id,
          type: 'comment' as const,
          user: c.profiles,
          post: c.posts,
          created_at: c.created_at
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(allActivities.slice(0, 20));
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote':
        return <ThumbsUp className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'follow':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const userName = activity.user.full_name || activity.user.username;
    switch (activity.type) {
      case 'vote':
        return (
          <>
            <span className="font-semibold">{userName}</span> upvoted your post{' '}
            <span className="font-semibold">"{activity.post?.title}"</span>
          </>
        );
      case 'comment':
        return (
          <>
            <span className="font-semibold">{userName}</span> commented on{' '}
            <span className="font-semibold">"{activity.post?.title}"</span>
          </>
        );
      default:
        return `${userName} interacted with your content`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
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
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
            <p className="text-gray-600">Recent interactions with your posts</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No recent activity</p>
            <p className="text-sm text-gray-500">
              Activity will appear here when others interact with your posts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => activity.post && router.push(`/post/${activity.post.id}`)}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    ${activity.type === 'vote' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
                  `}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-1">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
