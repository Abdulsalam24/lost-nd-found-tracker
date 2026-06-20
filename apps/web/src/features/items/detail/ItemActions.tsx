"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Modal } from "@/components/global/Modal";

const claimSchema = z.object({
  evidence_description: z.string().min(10, "Provide at least 10 characters of evidence"),
});

type ClaimFormData = z.infer<typeof claimSchema>;

interface Props {
  itemId: string;
  itemStatus: string;
  reportedBy: string;
  itemTitle: string;
  reporterPhone?: string | null;
}

export function ItemActions({ itemId, itemStatus, reportedBy, itemTitle, reporterPhone }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [claimOpen, setClaimOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  }, []);

  if (itemStatus === "RECOVERED" || itemStatus === "DISPOSED") return null;

  const isOwner = user?.id === reportedBy;

  const onClaimSubmit = async (data: ClaimFormData) => {
    setError("");
    try {
      let evidence_image_url: string | undefined;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const { url } = await api.upload<{ url: string }>("/items/upload", formData);
        evidence_image_url = url;
      }

      const claim = await api.post<{ id: string }>("/claims", {
        item_report_id: itemId,
        evidence_description: data.evidence_description,
        evidence_image_url,
      });

      setClaimOpen(false);
      router.push(`/claims/${claim.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim");
    }
  };

  const onChatSubmit = async () => {
    const content = chatMessage.trim();
    if (!content || chatSending) return;

    setChatSending(true);
    setError("");
    try {
      const conv = await api.post<{ id: string }>("/chat/conversations", {
        item_report_id: itemId,
        recipient_id: reportedBy,
        message: content,
      });
      setChatOpen(false);
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    } finally {
      setChatSending(false);
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="text-xs text-text-muted">Log in to claim or contact the reporter.</p>
        <a
          href={`/auth/login?redirect=/items/${itemId}`}
          className="btn-primary mt-4 inline-flex text-xs"
        >
          Login
        </a>
      </div>
    );
  }

  // Owner view
  if (isOwner) {
    return <OwnerPanel itemId={itemId} />;
  }

  // Other user view — can claim + chat
  return (
    <>
      <div className="card p-6 space-y-3">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setClaimOpen(true)}
        >
          Claim This Item
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-xs font-medium text-text transition-colors hover:bg-bg-hover"
            onClick={() => setChatOpen(true)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
          {reporterPhone && (
            <a
              href={`https://wa.me/${reporterPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm reaching out about "${itemTitle}" on UniLorin Lost & Found.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>
        <p className="text-xs text-center text-text-ghost">
          You&apos;ll need to provide evidence of ownership to claim.
        </p>
      </div>

      {/* Claim Modal */}
      <Modal open={claimOpen} onClose={() => setClaimOpen(false)} title="Claim This Item">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onClaimSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="evidence" className="label">Evidence of Ownership</label>
            <textarea
              id="evidence"
              rows={4}
              className="input-field"
              placeholder="Describe unique details only the owner would know..."
              {...register("evidence_description")}
              aria-invalid={errors.evidence_description ? "true" : undefined}
              aria-describedby={errors.evidence_description ? "evidence-error" : undefined}
            />
            {errors.evidence_description && (
              <p id="evidence-error" className="error-text">{errors.evidence_description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="evidence-image" className="label">Evidence Image (optional)</label>
            <input
              id="evidence-image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/20"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setClaimOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Chat Modal */}
      <Modal open={chatOpen} onClose={() => setChatOpen(false)} title={`Message about "${itemTitle}"`}>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="chat-message" className="label">Your Message</label>
            <textarea
              id="chat-message"
              rows={3}
              className="input-field"
              placeholder="Hi, I think I found your item..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setChatOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              disabled={chatSending || !chatMessage.trim()}
              onClick={onChatSubmit}
            >
              {chatSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// --- Owner Panel with claims management ---

interface ClaimItem {
  id: string;
  claimant: { id: string; name: string } | null;
  evidence_description: string;
  evidence_image_url?: string | null;
  status: string;
  created_at: string;
}

function OwnerPanel({ itemId }: { itemId: string }) {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    api.get<ClaimItem[]>(`/claims/item/${itemId}`)
      .then(setClaims)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleAction = async (claimId: string, action: "approve" | "reject") => {
    setActionLoading(claimId);
    try {
      await api.patch(`/claims/${claimId}/${action}`);
      setClaims((prev) =>
        prev.map((c) =>
          c.id === claimId ? { ...c, status: action === "approve" ? "APPROVED" : "REJECTED" } : c
        )
      );
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const pendingClaims = claims.filter((c) => c.status === "PENDING");
  const reviewedClaims = claims.filter((c) => c.status !== "PENDING");

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-text">Your Report</span>
        </div>
        <Link
          href={`/chat?item=${itemId}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-light bg-bg-elevated px-4 py-2.5 text-xs font-medium text-text transition-colors hover:bg-bg-hover"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          View Messages
        </Link>
      </div>

      {/* Claims section */}
      <div className="card p-5">
        <h3 className="text-xs font-bold text-text">
          Claims {!loading && `(${claims.length})`}
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : claims.length === 0 ? (
          <p className="mt-2 text-xs text-text-ghost">No one has claimed this item yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {/* Pending claims first */}
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="rounded-xl border-2 border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                      {(claim.claimant?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-text">{claim.claimant?.name ?? "_"}</span>
                  </div>
                  <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                    PENDING
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{claim.evidence_description}</p>
                {claim.evidence_image_url && (
                  <img src={claim.evidence_image_url} alt="Evidence" className="mt-2 h-20 rounded-lg object-cover" />
                )}
                <p className="mt-2 text-[10px] text-text-ghost">
                  {claim.created_at ? new Date(claim.created_at).toLocaleString() : "_"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading === claim.id}
                    onClick={() => handleAction(claim.id, "approve")}
                    className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    {actionLoading === claim.id ? "..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === claim.id}
                    onClick={() => handleAction(claim.id, "reject")}
                    className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {actionLoading === claim.id ? "..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}

            {/* Reviewed claims */}
            {reviewedClaims.map((claim) => (
              <div key={claim.id} className="rounded-xl border border-border-light bg-bg-elevated/50 p-4 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-secondary">{claim.claimant?.name ?? "_"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                    claim.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {claim.status}
                  </span>
                </div>
                <p className="text-xs text-text-ghost truncate">{claim.evidence_description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
