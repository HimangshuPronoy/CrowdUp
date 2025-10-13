"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MessageSquare, Share2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Post, Comment } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (user) fetchUserVote();
  }, [params.id, user]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, full_name),
          companies (name, color, slug)
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setPost(data);
      setVotes(data.votes_count);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error("Post not found");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (username, full_name)
      `)
      .eq('post_id', params.id)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  };

  const fetchUserVote = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (data) setUserVote(data.vote_type as "up" | "down");
  };

  const handleVote = async (voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please sign in to vote");
      router.push("/auth/login");
      return;
    }

    try {
      if (userVote === voteType) {
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', params.id)
          .eq('user_id', user.id);
        
        setUserVote(null);
        setVotes(votes + (voteType === "up" ? -1 : 1));
      } else if (userVote) {
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('post_id', params.id)
          .eq('user_id', user.id);
        
        setVotes(votes + (voteType === "up" ? 2 : -2));
        setUserVote(voteType);
      } else {
        await supabase
          .from('votes')
          .insert({
            post_id: params.id as string,
            user_id: user.id,
            vote_type: voteType
          });
        
        setVotes(votes + (voteType === "up" ? 1 : -1));
        setUserVote(voteType);
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to comment");
      router.push("/auth/login");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: params.id as string,
          user_id: user.id,
          content: newComment
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) return null;

  const typeConfig = {
    "Bug Report": {
      icon: "🐛",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    "Feature Request": {
      icon: "💡",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    "Complaint": {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
  };

  const config = typeConfig[post.type];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        {/* Post */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleVote("up")}
                className={cn(
                  "h-8 w-8 transition-all hover:scale-125",
                  userVote === "up" && "text-orange-500 bg-orange-50"
                )}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className={cn(
                "text-lg font-bold transition-colors",
                userVote === "up" && "text-orange-500",
                userVote === "down" && "text-blue-500"
              )}>
                {votes}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleVote("down")}
                className={cn(
                  "h-8 w-8 transition-all hover:scale-125",
                  userVote === "down" && "text-blue-500 bg-blue-50"
                )}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={cn(config.bgColor, config.textColor, "border", config.borderColor, "font-medium")}>
                  <span className="mr-1">{config.icon}</span>
                  {post.type}
                </Badge>
                <span className="text-orange-500">•</span>
                <span className="text-sm font-medium" style={{ color: post.companies?.color }}>
                  {post.companies?.name}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Avatar className="h-6 w-6 bg-gray-200">
                  <AvatarFallback className="bg-gray-200 text-xs">
                    {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <span>{post.profiles?.full_name || post.profiles?.username}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="mb-2"
              />
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Sign In
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 bg-gray-200">
                      <AvatarFallback className="bg-gray-200 text-xs">
                        {comment.profiles?.full_name?.[0] || comment.profiles?.username?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.profiles?.full_name || comment.profiles?.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
