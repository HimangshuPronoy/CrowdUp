"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Building2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [params.token]);

  const fetchInvitation = async () => {
    try {
      const { data: inviteData, error } = await supabase
        .from('company_invitations')
        .select(`
          *,
          companies (*)
        `)
        .eq('token', params.token)
        .eq('status', 'pending')
        .single();

      if (error || !inviteData) {
        toast.error("Invalid or expired invitation");
        router.push("/");
        return;
      }

      // Check if invitation is expired
      if (new Date(inviteData.expires_at) < new Date()) {
        toast.error("This invitation has expired");
        router.push("/");
        return;
      }

      setInvitation(inviteData);
      setCompany(inviteData.companies);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      toast.error("Failed to load invitation");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      toast.error("Please sign in to accept this invitation");
      router.push(`/auth/login?redirect=/invite/${params.token}`);
      return;
    }

    setProcessing(true);
    try {
      // Add user as company member
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: invitation.company_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
        });

      if (memberError) {
        if (memberError.code === '23505') {
          toast.error("You are already a member of this company");
        } else {
          throw memberError;
        }
        return;
      }

      // Update invitation status
      await supabase
        .from('company_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      toast.success(`Welcome to ${company.name}!`);
      router.push(`/company/${company.slug}/manage`);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await supabase
        .from('company_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      toast.success("Invitation declined");
      router.push("/");
    } catch (error) {
      toast.error("Failed to decline invitation");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-2xl px-6 pt-24 pb-8">
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!invitation || !company) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-lg p-8 text-center">
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
            style={{ backgroundColor: company.color }}
          >
            {company.name[0]}
          </div>

          <h1 className="text-3xl font-bold mb-2">You're Invited!</h1>
          <p className="text-gray-600 mb-6">
            You've been invited to join <span className="font-semibold">{company.name}</span> as a{' '}
            <span className="font-semibold">{invitation.role}</span>
          </p>

          {company.description && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700">{company.description}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
              size="lg"
            >
              <Check className="h-5 w-5" />
              {processing ? "Accepting..." : "Accept Invitation"}
            </Button>
            <Button
              onClick={handleDecline}
              disabled={processing}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <X className="h-5 w-5" />
              Decline
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-gray-500 mt-6">
              You need to sign in to accept this invitation
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
