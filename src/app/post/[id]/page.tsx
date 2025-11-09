"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, Share2, Flag, Send } from "lucide-react";
import { use, useState } from "react";
import { cn } from "@/lib/utils";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [votes, setVotes] = useState(47);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [commentText, setCommentText] = useState("");

  const post = {
    type: "Bug Report" as const,
    company: "Instagram",
    companyColor: "#E1306C",
    title: "Instagram stories loading incredibly slowly",
    description: "The stories feature has been taking 10+ seconds to load on my iPhone 14. This started happening after the latest update. It's making the app basically unusable for stories. I've tried reinstalling the app, clearing cache, and even resetting my phone but nothing works. Anyone else experiencing this?",
    author: "Sarah Chen",
    authorInitial: "S",
    timestamp: "2h ago",
  };

  const typeConfig = {
    "Bug Report": {
      icon: "🐛",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
  };

  const config = typeConfig[post.type];

  const comments = [
    {
      id: 1,
      author: "Mike Rodriguez",
      authorInitial: "M",
      timestamp: "1h ago",
      text: "I'm having the same issue! It's been frustrating. Seems like a server-side problem.",
      votes: 12,
    },
    {
      id: 2,
      author: "Alex Thompson",
      authorInitial: "A",
      timestamp: "30m ago",
      text: "Try switching to a different network connection. Worked for me temporarily.",
      votes: 8,
    },
  ];

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null);
      setVotes(votes + (type === "up" ? -1 : 1));
    } else {
      if (userVote) {
        setVotes(votes + (type === "up" ? 2 : -2));
      } else {
        setVotes(votes + (type === "up" ? 1 : -1));
      }
      setUserVote(type);
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      // Handle comment submission
      setCommentText("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        {/* Post Card */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm mb-6">
          <div className="flex items-start gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("up")}
                className={cn(
                  "h-10 w-10 transition-all hover:scale-110",
                  userVote === "up" && "text-orange-500 bg-orange-50"
                )}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              <span className="text-2xl font-bold">{votes}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("down")}
                className={cn(
                  "h-10 w-10 transition-all hover:scale-110",
                  userVote === "down" && "text-blue-500 bg-blue-50"
                )}
              >
                <ChevronDown className="h-6 w-6" />
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
                <span className="text-sm font-medium" style={{ color: post.companyColor }}>
                  {post.company}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-700 mb-6 leading-relaxed">{post.description}</p>

              {/* Author Info */}
              <div className="flex items-center justify-between pb-6 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gray-200">
                    <AvatarFallback className="bg-gray-200">{post.authorInitial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">{comments.length} Comments</h2>

          {/* Add Comment */}
          <div className="flex items-start gap-4 mb-8 pb-8 border-b">
            <Avatar className="h-10 w-10 bg-orange-500">
              <AvatarFallback className="bg-orange-500 text-white">L</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-3 resize-none"
                rows={3}
              />
              <Button onClick={handleComment} className="bg-orange-500 hover:bg-orange-600 gap-2">
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                <Avatar className="h-10 w-10 bg-gray-200">
                  <AvatarFallback className="bg-gray-200">{comment.authorInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{comment.author}</p>
                    <span className="text-sm text-gray-500">• {comment.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.text}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <ChevronUp className="h-4 w-4" />
                      {comment.votes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}