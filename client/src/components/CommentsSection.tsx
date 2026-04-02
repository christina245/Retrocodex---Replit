import { useState, useRef, useCallback, useEffect } from "react";
import { Search, MapPin, House, CornerUpLeft, ArrowUp, Trash2, MoreHorizontal, Bookmark, Flag, Bell, Pencil, X } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { CommentWithUser } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import exclamationImg from "@assets/exclaimation_mark_1774947906423.jpg";
import "./CommentsSection.css";

interface CommentsSectionProps {
  factId: string;
  onLoginClick?: (msg: string) => void;
}

function getDiceBearUrl(username: string | null) {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(username ?? "deleted")}&radius=8`;
}

function getAvatarSrc(avatarUrl: string, username: string | null) {
  if (avatarUrl && avatarUrl.trim() !== "") return avatarUrl;
  return getDiceBearUrl(username);
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type TreeComment = CommentWithUser & { children: TreeComment[] };

function buildTree(flatComments: CommentWithUser[]): TreeComment[] {
  const map: Record<string, TreeComment> = {};
  const roots: TreeComment[] = [];
  flatComments.forEach(c => { map[c.id] = { ...c, children: [] }; });
  flatComments.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

// ─── Report reasons ─────────────────────────────────────────────────────────

const REPORT_REASONS = [
  "Harassment",
  "Inappropriate content",
  "Promoting hate",
  "Impersonation",
  "Spam",
  "May be a bot",
  "Other",
];

// ─── Report modal ────────────────────────────────────────────────────────────

function ReportModal({ onClose }: { onClose: () => void }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState("");
  const anyChecked = checked.size > 0;

  const toggle = (reason: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(reason)) next.delete(reason);
      else next.add(reason);
      return next;
    });
  };

  return (
    <div className="report-modal-overlay" onClick={onClose} data-testid="report-modal-overlay">
      <div className="report-modal" onClick={e => e.stopPropagation()} data-testid="report-modal">
        <button className="report-modal-close" onClick={onClose} data-testid="button-close-report">
          <X size={16} />
        </button>
        <img src={exclamationImg} alt="Report" className="report-modal-icon" />
        <h2 className="report-modal-title">Report Comment</h2>
        <p className="report-modal-subtitle">Select all reasons that apply</p>
        <div className="report-reasons">
          {REPORT_REASONS.map(reason => (
            <label key={reason} className="report-reason-label">
              <input
                type="checkbox"
                checked={checked.has(reason)}
                onChange={() => toggle(reason)}
                className="report-reason-checkbox"
                data-testid={`checkbox-report-${reason.toLowerCase().replace(/\s+/g, "-")}`}
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>
        <textarea
          className="report-detail-input"
          placeholder="Describe reason"
          value={detail}
          onChange={e => setDetail(e.target.value)}
          disabled={!anyChecked}
          rows={2}
          data-testid="input-report-detail"
        />
        <button
          className="btn-submit-report"
          disabled={!anyChecked}
          onClick={() => onClose()}
          data-testid="button-submit-report"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
}

// ─── Inline reply composer ────────────────────────────────────────────────────

interface InlineReplyComposerProps {
  parentUsername: string;
  onSubmit: (body: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

function InlineReplyComposer({ parentUsername, onSubmit, onCancel, isPending }: InlineReplyComposerProps) {
  const [body, setBody] = useState(`@${parentUsername} `);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="inline-reply-composer">
      <p className="markdown-hint">Markdown is supported.</p>
      <textarea
        ref={ref}
        className="comment-textarea"
        placeholder={`Replying to @${parentUsername}…`}
        value={body}
        onChange={e => { setBody(e.target.value); if (error) setError(null); }}
        rows={3}
        autoFocus
        data-testid="input-reply"
      />
      {error && <p className="comment-error" data-testid="error-reply">{error}</p>}
      <div className="comment-input-buttons">
        <button
          className="btn-cancel-comment"
          onClick={onCancel}
          data-testid="button-cancel-reply"
        >
          Cancel
        </button>
        <button
          className="btn-submit-comment"
          onClick={handleSubmit}
          disabled={isPending}
          data-testid="button-submit-reply"
        >
          {isPending ? "Posting…" : "Comment"}
        </button>
      </div>
    </div>
  );
}

// ─── Comment node ────────────────────────────────────────────────────────────

interface CommentNodeProps {
  comment: TreeComment;
  depth: number;
  isLoggedIn: boolean;
  userId?: string;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, body: string) => Promise<void>;
  onUpvote: (id: string) => void;
  onSaveComment: (commentId: string, isSaved: boolean) => void;
  onLoginClick?: (msg: string) => void;
  pendingUpvote: string | null;
  pendingDelete: string | null;
  pendingEdit: string | null;
  postReply: (parentId: string, body: string) => Promise<void>;
  replyPending: boolean;
}

function CommentNode({
  comment, depth, isLoggedIn, userId, isAdmin,
  onDelete, onEdit, onUpvote, onSaveComment, onLoginClick,
  pendingUpvote, pendingDelete, pendingEdit,
  postReply, replyPending
}: CommentNodeProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [reportOpen, setReportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwnComment = isLoggedIn && !!comment.userId && comment.userId === userId;
  const canDelete = isAdmin || isOwnComment;
  const isUpvoting = pendingUpvote === comment.id;
  const isDeleting = pendingDelete === comment.id;
  const isSavingEdit = pendingEdit === comment.id;

  const hasCurrentLocation = comment.showCurrentLocation && comment.currentLocation;
  const hasPlacesLived = comment.showPlacesLived && comment.placesLived && comment.placesLived.length > 0;
  const showLocationRow = hasCurrentLocation || hasPlacesLived;

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen]);

  const handleReply = () => {
    if (!isLoggedIn) { onLoginClick?.("Sign in to reply to comments"); return; }
    setReplyOpen(true);
  };

  const handleReplySubmit = async (body: string) => {
    await postReply(comment.id, body);
    setReplyOpen(false);
  };

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setConfirmDeleteOpen(true);
  };

  const handleEditClick = () => {
    setDropdownOpen(false);
    setEditBody(comment.body);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const trimmed = editBody.trim();
    if (!trimmed) return;
    try {
      await onEdit(comment.id, trimmed);
      setEditOpen(false);
    } catch {
      // keep edit open on error
    }
  };

  return (
    <div className={`comment-thread-node ${depth > 0 ? "comment-reply" : ""}`} data-testid={`comment-${comment.id}`}>
      {depth > 0 && <div className="comment-thread-line" />}
      <div className="comment-inner">
        <div className="comment-avatar">
          <img
            src={getAvatarSrc(comment.avatarUrl, comment.username)}
            alt={comment.username}
            width={40}
            height={40}
          />
        </div>
        <div className="comment-content">
          <div className="comment-header">
            {comment.userId === null ? (
              <span className="comment-username comment-username--deleted">[Deleted profile]</span>
            ) : !comment.allowPublicProfile ? (
              <span className="comment-username-private-wrapper">
                <span className="comment-username">{comment.username}</span>
                <span className="comment-username-tooltip">Profile unavailable</span>
              </span>
            ) : (
              <Link href={`/user/${comment.username}`} className="comment-username comment-username--link">
                {comment.username}
              </Link>
            )}
            {comment.isAdmin && <span className="admin-badge">ADMIN</span>}
            <span className="comment-separator">•</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
            {comment.editedAt && !comment.deletedByAdmin && (
              <span className="comment-edited-label">• edited</span>
            )}
          </div>

          {showLocationRow && (
            <div className="comment-user-info">
              {hasCurrentLocation && (
                <span className="user-info-item">
                  <MapPin size={12} />
                  <span>{comment.currentLocation}</span>
                </span>
              )}
              {hasPlacesLived && (
                <span className={`user-info-item ${hasCurrentLocation ? "user-info-hometowns" : ""}`}>
                  <House size={12} />
                  {comment.placesLived.map((place, i) => (
                    <span key={i}>
                      {place}
                      {i < comment.placesLived.length - 1 && <span className="info-separator">•</span>}
                    </span>
                  ))}
                </span>
              )}
            </div>
          )}

          {comment.deletedByAdmin ? (
            <div className="comment-body">
              <p className="comment-removed-by-admin">This comment was removed by an admin.</p>
            </div>
          ) : editOpen ? (
            <div className="comment-edit-state">
              <textarea
                className="comment-textarea"
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                rows={3}
                autoFocus
                data-testid={`input-edit-${comment.id}`}
              />
              <div className="comment-input-buttons">
                <button
                  className="btn-cancel-comment"
                  onClick={() => setEditOpen(false)}
                  data-testid={`button-cancel-edit-${comment.id}`}
                >
                  Cancel
                </button>
                <button
                  className="btn-submit-comment"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editBody.trim()}
                  data-testid={`button-save-edit-${comment.id}`}
                >
                  {isSavingEdit ? "Saving…" : "Save Edits"}
                </button>
              </div>
            </div>
          ) : (
            <div className="comment-body">
              <ReactMarkdown>{comment.body}</ReactMarkdown>
            </div>
          )}

          <div className="comment-actions">
            <button
              className="comment-action"
              onClick={handleReply}
              data-testid={`button-reply-${comment.id}`}
            >
              <CornerUpLeft size={14} />
              <span>Reply</span>
            </button>
            <button
              className={`comment-action upvote-action ${comment.isUpvotedByMe ? "upvoted" : ""}`}
              onClick={() => {
                if (!isLoggedIn) { onLoginClick?.("Sign in to upvote comments"); return; }
                onUpvote(comment.id);
              }}
              disabled={isUpvoting}
              data-testid={`button-upvote-${comment.id}`}
            >
              <ArrowUp size={14} />
              <span>{comment.upvotes}</span>
            </button>

            {isLoggedIn && (
              <div className="comment-ellipsis-wrapper" ref={dropdownRef}>
                <button
                  className="comment-action"
                  onClick={() => setDropdownOpen(p => !p)}
                  data-testid={`button-more-${comment.id}`}
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>

                {dropdownOpen && (
                  <div className="comment-dropdown" data-testid={`dropdown-${comment.id}`}>
                    {isOwnComment ? (
                      <>
                        <button
                          className="comment-dropdown-item"
                          onClick={handleEditClick}
                          data-testid={`dropdown-edit-${comment.id}`}
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="comment-dropdown-item comment-dropdown-delete"
                          onClick={handleDeleteClick}
                          data-testid={`dropdown-delete-${comment.id}`}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`comment-dropdown-item${comment.isSavedByMe ? " comment-dropdown-item--saved" : ""}`}
                          onClick={() => { setDropdownOpen(false); onSaveComment(comment.id, comment.isSavedByMe); }}
                          data-testid={`dropdown-save-${comment.id}`}
                        >
                          <Bookmark size={14} className={comment.isSavedByMe ? "bookmark-icon--saved" : ""} />
                          <span>{comment.isSavedByMe ? "Unsave" : "Save"}</span>
                        </button>
                        <button
                          className="comment-dropdown-item"
                          onClick={() => { setDropdownOpen(false); setReportOpen(true); }}
                          data-testid={`dropdown-report-${comment.id}`}
                        >
                          <Flag size={14} />
                          <span>Report</span>
                        </button>
                        <div
                          className="comment-dropdown-item comment-dropdown-item--disabled"
                          data-testid={`dropdown-follow-${comment.id}`}
                        >
                          <Bell size={14} />
                          <span>Follow</span>
                          <span className="unavailable-tooltip">Unavailable in beta</span>
                        </div>
                        {isAdmin && (
                          <button
                            className="comment-dropdown-item comment-dropdown-delete"
                            onClick={handleDeleteClick}
                            data-testid={`dropdown-admin-delete-${comment.id}`}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {confirmDeleteOpen && (
            <div className="delete-confirm-modal" data-testid={`delete-confirm-${comment.id}`}>
              <Trash2 size={30} className="delete-confirm-icon" />
              <p className="delete-confirm-text">
                {isOwnComment
                  ? "Are you sure you want to delete your comment?"
                  : "Remove this comment? It will be marked as removed by an admin."}
              </p>
              <div className="delete-confirm-buttons">
                <button
                  className="btn-cancel-comment"
                  onClick={() => setConfirmDeleteOpen(false)}
                  data-testid={`button-cancel-delete-${comment.id}`}
                >
                  Cancel
                </button>
                <button
                  className="btn-submit-comment"
                  onClick={() => { setConfirmDeleteOpen(false); onDelete(comment.id); }}
                  disabled={isDeleting}
                  data-testid={`button-confirm-delete-${comment.id}`}
                >
                  {isDeleting ? "Removing…" : isOwnComment ? "Delete Comment" : "Remove Comment"}
                </button>
              </div>
            </div>
          )}

          {replyOpen && (
            <InlineReplyComposer
              parentUsername={comment.username ?? "user"}
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyOpen(false)}
              isPending={replyPending}
            />
          )}
        </div>
      </div>

      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}

      {comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map(child => (
            <CommentNode
              key={child.id}
              comment={child}
              depth={depth + 1}
              isLoggedIn={isLoggedIn}
              userId={userId}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onEdit={onEdit}
              onUpvote={onUpvote}
              onSaveComment={onSaveComment}
              onLoginClick={onLoginClick}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
              pendingEdit={pendingEdit}
              postReply={postReply}
              replyPending={replyPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comments section (root) ──────────────────────────────────────────────────

export function CommentsSection({ factId, onLoginClick }: CommentsSectionProps) {
  const { user, isLoggedIn } = useAuth();
  const [inputBody, setInputBody] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [pendingUpvote, setPendingUpvote] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingEdit, setPendingEdit] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/facts", factId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/facts/${factId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: !!factId,
  });

  const postMutation = useMutation({
    mutationFn: async (data: { body: string; parentId?: string }) =>
      apiRequest("POST", `/api/facts/${factId}/comments`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/facts/popular"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
      if (!variables.parentId) {
        setInputBody("");
        setInputError(null);
        setIsInputExpanded(false);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      setPendingDelete(commentId);
      return apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/facts/popular"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-facts"] });
      setPendingDelete(null);
    },
    onError: () => setPendingDelete(null),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      setPendingEdit(id);
      return apiRequest("PATCH", `/api/comments/${id}`, { body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      setPendingEdit(null);
    },
    onError: () => setPendingEdit(null),
  });

  const upvoteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      setPendingUpvote(commentId);
      return apiRequest("POST", `/api/comments/${commentId}/upvote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      setPendingUpvote(null);
    },
    onError: () => setPendingUpvote(null),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ commentId, isSaved }: { commentId: string; isSaved: boolean }) =>
      apiRequest(isSaved ? "DELETE" : "POST", `/api/comments/${commentId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
    },
  });

  const onSaveComment = useCallback((commentId: string, isSaved: boolean) => {
    saveMutation.mutate({ commentId, isSaved });
  }, [saveMutation]);

  const postReply = useCallback(async (parentId: string, body: string) => {
    await postMutation.mutateAsync({ body, parentId });
  }, [postMutation]);

  const onEdit = useCallback(async (id: string, body: string) => {
    await editMutation.mutateAsync({ id, body });
  }, [editMutation]);

  const handleCancel = () => {
    setIsInputExpanded(false);
    setInputBody("");
    setInputError(null);
  };

  const handleSubmit = () => {
    const trimmed = inputBody.trim();
    if (!trimmed) {
      setInputError("Comment cannot be empty.");
      return;
    }
    setInputError(null);
    postMutation.mutate({ body: trimmed });
  };

  const tree = buildTree(comments);

  return (
    <div className="comments-section">
      <div className="comment-input-area">
        {!isLoggedIn ? (
          <button
            className="sign-in-to-comment"
            onClick={() => onLoginClick?.("")}
            data-testid="button-sign-in-to-comment"
          >
            <span><span className="sign-in-to-comment-link">Log in</span> to comment</span>
          </button>
        ) : !isInputExpanded ? (
          <textarea
            className="comment-textarea comment-textarea-inactive"
            placeholder="Share your knowledge about this fact"
            readOnly
            onClick={() => setIsInputExpanded(true)}
            rows={2}
            data-testid="input-comment-collapsed"
          />
        ) : (
          <div className="comment-input-expanded">
            <p className="markdown-hint">Markdown is supported.</p>
            <textarea
              ref={textareaRef}
              className="comment-textarea"
              placeholder="Share your knowledge about this fact"
              value={inputBody}
              onChange={e => { setInputBody(e.target.value); if (inputError) setInputError(null); }}
              rows={4}
              autoFocus
              data-testid="input-comment"
            />
            {inputError && <p className="comment-error" data-testid="error-comment">{inputError}</p>}
            <div className="comment-input-buttons">
              <button
                className="btn-cancel-comment"
                onClick={handleCancel}
                data-testid="button-cancel-comment"
              >
                Cancel
              </button>
              <button
                className="btn-submit-comment"
                onClick={handleSubmit}
                disabled={postMutation.isPending}
                data-testid="button-submit-comment"
              >
                {postMutation.isPending ? "Posting…" : "Comment"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="comments-controls">
        <div className="comment-control-disabled">
          <span>Sort comments by</span>
          <span className="comment-control-arrow">▼</span>
          <span className="comment-control-tooltip">Unavailable in beta</span>
        </div>
        <div className="comment-control-disabled">
          <Search size={12} />
          <span>Search comments</span>
          <span className="comment-control-tooltip">Unavailable in beta</span>
        </div>
      </div>

      {isLoading ? (
        <div className="comments-loading" data-testid="comments-loading">Loading comments…</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty" data-testid="comments-empty">
          Be the first to leave a comment.
        </div>
      ) : (
        <div className="comments-list">
          {tree.map(comment => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              isLoggedIn={isLoggedIn}
              userId={user?.id}
              isAdmin={user?.isAdmin}
              onDelete={id => deleteMutation.mutate(id)}
              onEdit={onEdit}
              onUpvote={id => upvoteMutation.mutate(id)}
              onSaveComment={onSaveComment}
              onLoginClick={onLoginClick}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
              pendingEdit={pendingEdit}
              postReply={postReply}
              replyPending={postMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
