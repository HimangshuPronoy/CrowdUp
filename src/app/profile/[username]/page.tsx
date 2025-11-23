"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PostCard from "@/components/PostCard";
import { Calendar, Settings, Edit2, BarChart3, Share2, Search, Filter, Trophy, MessageSquare, ThumbsUp, Bookmark } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, updateProfile } from "@/lib/auth";
import { formatDistanceToNow, format } from "date-fns";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Post {
  id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  posts: {
    id: string;
    title: string;
    type: string;
  };
}

interface Vote {
  id: string;
  post_id: string;
  vote_type: "up" | "down";
  created_at: string;
  posts: {
    id: string;
    title: string;
    type: string;
    company: string;
    votes: number;
  };
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.username === username;
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "votes">("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile && activeTab === "comments" && comments.length === 0) {
      fetchComments();
    } else if (profile && activeTab === "votes" && votes.length === 0) {
      fetchVotes();
    }
  }, [activeTab, profile]);

  useEffect(() => {
    if (profile && editDialogOpen) {
      setEditFormData({
        display_name: profile.display_name,
        username: profile.username,
        bio: profile.bio || "",
      });
    }
  }, [profile, editDialogOpen]);

  const fetchProfile = async () => {
    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, username, display_name, bio, avatar_url, created_at")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      setLoading(false);
      return;
    }

    setProfile(userData);

    // Fetch user posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (!postsError && postsData) {
      setPosts(postsData);
      
      // Fetch comment counts
      const postIds = postsData.map(p => p.id);
      if (postIds.length > 0) {
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (commentsData) {
          const counts: Record<string, number> = {};
          commentsData.forEach((comment: { post_id: string }) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          setCommentCounts(counts);
        }
      }
    }

    setLoading(false);
  };

  const fetchComments = async () => {
    if (!profile) return;
    
    setTabLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        post_id,
        content,
        created_at,
        posts (
          id,
          title,
          type
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as any);
    }
    setTabLoading(false);
  };

  const fetchVotes = async () => {
    if (!profile) return;
    
    setTabLoading(true);
    const { data, error } = await supabase
      .from("votes")
      .select(`
        id,
        post_id,
        vote_type,
        created_at,
        posts (
          id,
          title,
          type,
          company,
          votes
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVotes(data as any);
    }
    setTabLoading(false);
  };

  const handleEditProfile = async () => {
    setEditError("");
    setEditLoading(true);

    if (!editFormData.display_name || !editFormData.username) {
      setEditError("Display name and username are required");
      setEditLoading(false);
      return;
    }

    const result = await updateProfile({
      display_name: editFormData.display_name,
      username: editFormData.username,
      bio: editFormData.bio,
    });

    if (result.error) {
      setEditError(result.error);
      setEditLoading(false);
      return;
    }

    // Refresh profile and redirect if username changed
    if (editFormData.username !== username) {
      router.push(`/profile/${editFormData.username}`);
    } else {
      await fetchProfile();
      setEditDialogOpen(false);
    }
    setEditLoading(false);
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name}'s Profile`,
          text: `Check out ${profile?.display_name}'s profile on CrowdUp`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600 mb-4">User not found</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "" || post.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Calculate detailed stats
  const stats = {
    totalPosts: posts.length,
    totalVotes: posts.reduce((sum, post) => sum + post.votes, 0),
    bugReports: posts.filter(p => p.type === "Bug Report").length,
    featureRequests: posts.filter(p => p.type === "Feature Request").length,
    complaints: posts.filter(p => p.type === "Complaint").length,
    avgVotes: posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + post.votes, 0) / posts.length) : 0,
  };

  const formattedPosts = filteredPosts.map((post) => ({
    postId: post.id,
    type: post.type,
    company: post.company,
    companyColor: post.company_color,
    title: post.title,
    description: post.description,
    votes: post.votes,
    author: profile.display_name,
    authorInitial: profile.display_name.charAt(0).toUpperCase(),
    timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    comments: commentCounts[post.id] || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.display_name}</h1>
                <p className="text-gray-500 mb-3">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/profile/${username}/analytics`)}
                  variant="outline"
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                <Button
                  onClick={handleShareProfile}
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {shareSuccess ? "Copied!" : "Share"}
                </Button>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your profile information. Changes to username will redirect you to the new profile URL.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {editError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                          {editError}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="edit_display_name">Display Name</Label>
                        <Input
                          id="edit_display_name"
                          value={editFormData.display_name}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, display_name: e.target.value })
                          }
                          className="mt-2"
                          placeholder="Your display name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit_username">Username</Label>
                        <Input
                          id="edit_username"
                          value={editFormData.username}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                          }
                          className="mt-2"
                          placeholder="username"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Only lowercase letters, numbers, and underscores allowed
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="edit_bio">Bio</Label>
                        <Textarea
                          id="edit_bio"
                          value={editFormData.bio}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, bio: e.target.value })
                          }
                          className="mt-2 resize-none"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          disabled={editLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEditProfile}
                          disabled={editLoading}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                        >
                          {editLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!isOwnProfile && (
              <Button
                onClick={handleShareProfile}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {shareSuccess ? "Link Copied!" : "Share Profile"}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {stats.totalPosts}
              </p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {stats.totalVotes}
              </p>
              <p className="text-sm text-gray-600">Total Votes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {stats.avgVotes}
              </p>
              <p className="text-sm text-gray-600">Avg Votes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl">🐛</span>
                <span className="text-xs">{stats.bugReports}</span>
                <span className="text-xl">💡</span>
                <span className="text-xs">{stats.featureRequests}</span>
                <span className="text-xl">⚠️</span>
                <span className="text-xs">{stats.complaints}</span>
              </div>
              <p className="text-sm text-gray-600">By Type</p>
            </div>
          </div>
        </div>

        {/* Tabs with Search */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6">
          <div className="flex items-center justify-between px-6 py-3 border-b flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "posts"
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Posts ({posts.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "comments"
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("votes")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "votes"
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Votes ({votes.length})
                </div>
              </button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          {activeTab === "posts" && posts.length > 0 && (
            <div className="px-6 py-4 border-b bg-gray-50 flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-50 cursor-pointer h-9"
              >
                <option value="">All Types</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="Feature Request">💡 Feature Request</option>
                <option value="Complaint">⚠️ Complaint</option>
              </select>
              {(searchQuery || selectedType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("");
                  }}
                  className="text-xs h-9"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* User Posts */}
        <div className="space-y-4">
          {activeTab === "posts" && (
            <>
              {formattedPosts.length === 0 && posts.length > 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <p className="text-gray-600 mb-4">No posts match your filters</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
              {formattedPosts.length === 0 && posts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <p className="text-gray-600 mb-4">No posts yet</p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => router.push("/create")}
                      className="rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                    >
                      Create Your First Post
                    </Button>
                  )}
                </div>
              )}
              {formattedPosts.length > 0 && formattedPosts.map((post) => (
                <PostCard key={post.postId} {...post} />
              ))}
            </>
          )}
          {activeTab === "comments" && (
            <>
              {tabLoading ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <p className="text-gray-600">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No comments yet</p>
                  <p className="text-sm text-gray-500">
                    {isOwnProfile ? "Your comments on posts will appear here" : "This user hasn't commented yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/post/${comment.post_id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <MessageSquare className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 mb-2 break-words">{comment.content}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-medium text-orange-600 hover:text-orange-700">
                              On: {comment.posts.title}
                            </span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeTab === "votes" && (
            <>
              {tabLoading ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <p className="text-gray-600">Loading votes...</p>
                </div>
              ) : votes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No votes yet</p>
                  <p className="text-sm text-gray-500">
                    {isOwnProfile ? "Posts you vote on will appear here" : "This user hasn't voted on any posts yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {votes.map((vote) => (
                    <div
                      key={vote.id}
                      className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/post/${vote.post_id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 ${vote.vote_type === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {vote.vote_type === 'up' ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xl">👍</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xl">👎</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium mb-2 break-words">{vote.posts.title}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">{vote.posts.company}</span>
                            <span>•</span>
                            <span>{vote.posts.votes} votes</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(vote.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
