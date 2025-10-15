"use client";

import { ChevronUp, ChevronDown, MessageSquare, Share2, Flag, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePostView } from "@/hooks/usePostView";

interface PostCardProps {
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  companyColor: string;
  title: string;
  description: string;
  votes: number;
  author: string;
  authorInitial: string;
  timestamp: string;
  comments: number;
  postId?: string;
  images?: string[] | null;
}

export default function PostCard({
  type,
  company,
  companyColor,
  title,
  description,
  votes: initialVotes,
  author,
  authorInitial,
  timestamp,
  comments,
  postId = "1",
  images,
}: PostCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { trackClick } = usePostView(postId);

  useEffect(() => {
    if (user) {
      fetchUserVote();
      checkBookmark();
    }
  }, [user, postId]);

  const fetchUserVote = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserVote(data.vote_type as "up" | "down");
      }
    } catch (error) {
      // No vote found
    }
  };

  const checkBookmark = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // Not bookmarked
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to bookmark posts");
      router.push("/auth/login");
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        setIsBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

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

  const config = typeConfig[type];

  const handleVote = async (voteType: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to vote");
      router.push("/auth/login");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        setUserVote(null);
        setVotes(votes + (voteType === "up" ? -1 : 1));
      } else if (userVote) {
        // Update vote
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        setVotes(votes + (voteType === "up" ? 2 : -2));
        setUserVote(voteType);
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });
        
        setVotes(votes + (voteType === "up" ? 1 : -1));
        setUserVote(voteType);
      }
    } catch (error: any) {
      toast.error("Failed to vote");
      console.error('Vote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = () => {
    trackClick();
    router.push(`/post/${postId}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle share functionality
  };

  return (
    <div 
      onClick={handlePostClick}
      className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => handleVote("up", e)}
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
            onClick={(e) => handleVote("down", e)}
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
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn(config.bgColor, config.textColor, "border", config.borderColor, "font-medium")}>
              <span className="mr-1">{config.icon}</span>
              {type}
            </Badge>
            <span className="text-orange-500">•</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/company/${company.toLowerCase()}`);
              }}
              className="text-sm font-medium hover:underline transition-all"
              style={{ color: companyColor }}
            >
              {company}
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-2 hover:text-orange-500 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

          {/* Images */}
          {images && images.length > 0 && (
            <div className={cn(
              "grid gap-2 mb-4",
              images.length === 1 && "grid-cols-1",
              images.length === 2 && "grid-cols-2",
              images.length >= 3 && "grid-cols-2"
            )}>
              {images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative overflow-hidden rounded-lg",
                    images.length === 1 && "h-48",
                    images.length >= 2 && "h-32"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Could open lightbox here
                  }}
                >
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                  {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${author.toLowerCase().replace(/\s+/g, '')}`);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <Avatar className="h-6 w-6 bg-gray-200">
                <AvatarFallback className="bg-gray-200 text-xs">{authorInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{author}</span>
              <span className="text-sm text-gray-400">• {timestamp}</span>
            </button>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 hover:bg-orange-50 hover:text-orange-500 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostClick();
                }}
              >
                <MessageSquare className="h-4 w-4" />
                {comments}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-orange-50 hover:text-orange-500 transition-all"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 transition-all",
                  isBookmarked 
                    ? "text-orange-500 bg-orange-50 hover:bg-orange-100" 
                    : "hover:bg-orange-50 hover:text-orange-500"
                )}
                onClick={handleBookmark}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Flag Icon */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:text-red-500 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <Flag className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}