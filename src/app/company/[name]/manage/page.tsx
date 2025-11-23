"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Plus,
  FileText,
  Settings,
  ArrowLeft
} from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";

interface CompanyMember {
  id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  users: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function ManageCompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<"admin" | "member">("member");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [postFormData, setPostFormData] = useState({
    type: "Feature Request" as "Bug Report" | "Feature Request" | "Complaint",
    title: "",
    description: "",
  });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");

  useEffect(() => {
    fetchCompany();
  }, [name]);

  useEffect(() => {
    if (company) {
      checkOwnership();
      fetchMembers();
      fetchPosts();
    }
  }, [company]);

  const fetchCompany = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("name", name.toLowerCase())
      .single();

    if (data) {
      setCompany(data);
    }
    setLoading(false);
  };

  const checkOwnership = async () => {
    const userId = getCurrentUserId();
    if (!userId || !company) return;

    const { data } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", company.id)
      .eq("user_id", userId)
      .single();

    if (data && data.role === "owner") {
      setIsOwner(true);
    } else {
      // Not owner, redirect to company page
      router.push(`/company/${name}`);
    }
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("company_members")
      .select(`
        *,
        users (id, username, display_name, avatar_url)
      `)
      .eq("company_id", company.id)
      .order("created_at", { ascending: true });

    if (data) {
      setMembers(data as CompanyMember[]);
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `)
      .ilike("company", name)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setPosts(data);
    }
  };

  const handleAddMember = async () => {
    setAddMemberError("");
    setAddMemberLoading(true);

    if (!addMemberEmail) {
      setAddMemberError("Please enter a username or email");
      setAddMemberLoading(false);
      return;
    }

    // Find user by username or email
    const { data: user } = await supabase
      .from("users")
      .select("id, username, email")
      .or(`username.eq.${addMemberEmail},email.eq.${addMemberEmail}`)
      .single();

    if (!user) {
      setAddMemberError("User not found");
      setAddMemberLoading(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", company.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      setAddMemberError("User is already a member");
      setAddMemberLoading(false);
      return;
    }

    // Add member
    const { error } = await supabase
      .from("company_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: addMemberRole,
      });

    if (error) {
      setAddMemberError("Failed to add member");
      setAddMemberLoading(false);
      return;
    }

    setAddMemberEmail("");
    setAddMemberRole("member");
    setAddMemberDialogOpen(false);
    setAddMemberLoading(false);
    fetchMembers();
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase
      .from("company_members")
      .delete()
      .eq("id", memberId);

    if (!error) {
      fetchMembers();
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: "admin" | "member") => {
    const { error } = await supabase
      .from("company_members")
      .update({ role: newRole })
      .eq("id", memberId);

    if (!error) {
      fetchMembers();
    }
  };

  const handleCreatePost = async () => {
    setPostError("");
    setPostLoading(true);

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (!postFormData.title || !postFormData.description) {
      setPostError("Title and description are required");
      setPostLoading(false);
      return;
    }

    const { error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        type: postFormData.type,
        company: company.display_name,
        company_color: "#f97316",
        title: postFormData.title,
        description: postFormData.description,
      });

    if (error) {
      setPostError("Failed to create post");
      setPostLoading(false);
      return;
    }

    setPostFormData({
      type: "Feature Request",
      title: "",
      description: "",
    });
    setCreatePostDialogOpen(false);
    setPostLoading(false);
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!company || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600 mb-4">You don't have permission to manage this company</p>
            <Button onClick={() => router.push(`/company/${name}`)} variant="outline">
              Back to Company Page
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/company/${name}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage {company.display_name}</h1>
              <p className="text-gray-600">Company settings and team management</p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/company/${name}`)}
            variant="outline"
          >
            View Public Page
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Members */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-bold">Team Members</h2>
                  <Badge variant="secondary">{members.length}</Badge>
                </div>
                <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                      <UserPlus className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new admin or member to manage this company page
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {addMemberError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                          {addMemberError}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="member_email">Username or Email</Label>
                        <Input
                          id="member_email"
                          value={addMemberEmail}
                          onChange={(e) => setAddMemberEmail(e.target.value)}
                          placeholder="username or email@example.com"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="member_role">Role</Label>
                        <Select
                          value={addMemberRole}
                          onValueChange={(value: "admin" | "member") => setAddMemberRole(value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span>Admin - Can edit and manage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="member">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Member - Can view only</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setAddMemberDialogOpen(false)}
                          disabled={addMemberLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddMember}
                          disabled={addMemberLoading}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                        >
                          {addMemberLoading ? "Adding..." : "Add Member"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {member.users.avatar_url ? (
                          <img src={member.users.avatar_url} alt={member.users.display_name} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.users.display_name}</p>
                        <p className="text-sm text-gray-500">@{member.users.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === "owner" ? (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      ) : (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value: "admin" | "member") =>
                              handleUpdateMemberRole(member.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.users.display_name} from this company?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-bold">Recent Posts</h2>
                  <Badge variant="secondary">{posts.length}</Badge>
                </div>
                <Dialog open={createPostDialogOpen} onOpenChange={setCreatePostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
                      <Plus className="h-4 w-4" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Post for {company.display_name}</DialogTitle>
                      <DialogDescription>
                        Create an official post on behalf of your company
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {postError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                          {postError}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="post_type">Type</Label>
                        <Select
                          value={postFormData.type}
                          onValueChange={(value: any) =>
                            setPostFormData({ ...postFormData, type: value })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Feature Request">Feature Request</SelectItem>
                            <SelectItem value="Bug Report">Bug Report</SelectItem>
                            <SelectItem value="Complaint">Complaint</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="post_title">Title</Label>
                        <Input
                          id="post_title"
                          value={postFormData.title}
                          onChange={(e) =>
                            setPostFormData({ ...postFormData, title: e.target.value })
                          }
                          placeholder="What's this about?"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="post_description">Description</Label>
                        <Textarea
                          id="post_description"
                          value={postFormData.description}
                          onChange={(e) =>
                            setPostFormData({ ...postFormData, description: e.target.value })
                          }
                          placeholder="Provide details..."
                          className="mt-2 resize-none"
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCreatePostDialogOpen(false)}
                          disabled={postLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePost}
                          disabled={postLoading}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                        >
                          {postLoading ? "Creating..." : "Create Post"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No posts yet
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => router.push(`/post/${post.id}`)}
                      className="w-full p-4 border rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{post.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>👍 {post.votes}</span>
                        <span>by {post.users.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push(`/company/${name}`)}
                >
                  <Settings className="h-4 w-4" />
                  Edit Company Info
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push(`/company/${name}/analytics`)}
                >
                  <FileText className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/apps/create")}
                >
                  <Plus className="h-4 w-4" />
                  Create App Page
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Company Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-semibold">{members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-semibold">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold">{company.category || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
