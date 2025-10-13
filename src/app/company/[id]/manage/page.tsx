"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Users, Mail, Trash2, Shield, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CompanyMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    username: string;
    full_name: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function ManageCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to manage companies");
      router.push("/auth/login");
      return;
    }
    fetchCompanyData();
  }, [user, params.id]);

  const fetchCompanyData = async () => {
    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', params.id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Check user's role
      const { data: memberData } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', companyData.id)
        .eq('user_id', user!.id)
        .single();

      if (!memberData) {
        toast.error("You don't have permission to manage this company");
        router.push(`/company/${params.id}`);
        return;
      }

      setUserRole(memberData.role);

      // Fetch members
      const { data: membersData } = await supabase
        .from('company_members')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .eq('company_id', companyData.id)
        .order('joined_at', { ascending: false });

      setMembers(membersData || []);

      // Fetch invitations
      const { data: invitationsData } = await supabase
        .from('company_invitations')
        .select('*')
        .eq('company_id', companyData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast.error("Failed to load company data");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail || !company) return;

    setInviting(true);
    try {
      const { error } = await supabase
        .from('company_invitations')
        .insert({
          company_id: company.id,
          email: inviteEmail,
          role: inviteRole,
          invited_by: user!.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("An invitation already exists for this email");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchCompanyData();
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberRole: string) => {
    if (memberRole === 'owner') {
      toast.error("Cannot remove the company owner");
      return;
    }

    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success("Member removed successfully");
      fetchCompanyData();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('company_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success("Invitation cancelled");
      fetchCompanyData();
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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

  if (!company || !userRole) return null;

  const canInvite = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: company.color }}
              >
                {company.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{company.name}</h1>
                <p className="text-gray-600">Company Management</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/company/${params.id}`)}
            >
              View Public Page
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full justify-start bg-white border rounded-lg p-1 mb-6">
            <TabsTrigger value="members" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              <Building2 className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {canInvite && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-500" />
                  Invite Team Member
                </h3>
                <form onSubmit={handleInvite} className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={inviting}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {inviting ? "Sending..." : "Send Invite"}
                  </Button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="font-bold text-lg">Team Members ({members.length})</h3>
              </div>
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-orange-500">
                        <AvatarFallback className="bg-orange-500 text-white">
                          {member.profiles.full_name?.[0] || member.profiles.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {member.profiles.full_name || member.profiles.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{member.profiles.username} • Joined{' '}
                          {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                      {canInvite && member.role !== 'owner' && member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id, member.role)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="font-bold text-lg">Pending Invitations ({invitations.length})</h3>
              </div>
              {invitations.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <div className="divide-y">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="p-6 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })} •
                          Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleBadgeColor(invitation.role)}>
                          {invitation.role}
                        </Badge>
                        {canInvite && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-bold text-lg mb-4">Company Settings</h3>
              <p className="text-gray-600">
                Company settings management coming soon...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
