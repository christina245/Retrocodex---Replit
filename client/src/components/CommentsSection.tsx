import { useState, useRef, useCallback } from "react";
import { Filter, Search, MapPin, House, CornerUpLeft, ArrowUp, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { CommentWithUser } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import "./CommentsSection.css";

interface CommentsSectionProps {
  factId: string;
  onLoginClick?: (msg: string) => void;
}

function getDiceBearUrl(username: string) {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(username)}&radius=8`;
}

function getAvatarSrc(avatarUrl: string, username: string) {
  if (avatarUrl && avatarUrl.startsWith("data:")) return avatarUrl;
  return getDiceBearUrl(username);
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildTree(comments: CommentWithUser[]) {
  const map: Record<string, CommentWithUser & { children: (CommentWithUser & { children: any[] })[] }> = {};
  const roots: (CommentWithUser & { children: any[] })[] = [];
  comments.forEach(c => { map[c.id] = { ...c, children: [] }; });
  comments.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

type TreeComment = CommentWithUser & { children: TreeComment[] };

interface CommentNodeProps {
  comment: TreeComment;
  depth: number;
  factId: string;
  userId?: string;
  isAdmin?: boolean;
  onReply: (parentId: string, username: string) => void;
  onDelete: (id: string) => void;
  onUpvote: (id: string) => void;
  pendingUpvote: string | null;
  pendingDelete: string | null;
}

function CommentNode({ comment, depth, factId, userId, isAdmin, onReply, onDelete, onUpvote, pendingUpvote, pendingDelete }: CommentNodeProps) {
  const canDelete = isAdmin || comment.userId === userId;
  const isUpvoting = pendingUpvote === comment.id;
  const isDeleting = pendingDelete === comment.id;

  const hasCurrentLocation = comment.showCurrentLocation && comment.currentLocation;
  const hasPlacesLived = comment.showPlacesLived && comment.placesLived && comment.placesLived.length > 0;
  const showLocationRow = hasCurrentLocation || hasPlacesLived;

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
            <span className="comment-username">{comment.username}</span>
            {comment.isAdmin && <span className="admin-badge">ADMIN</span>}
            <span className="comment-separator">•</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
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

          <div className="comment-body">
            <ReactMarkdown>{comment.body}</ReactMarkdown>
          </div>

          <div className="comment-actions">
            {userId && (
              <button
                className="comment-action"
                onClick={() => onReply(comment.id, comment.username)}
                data-testid={`button-reply-${comment.id}`}
              >
                <CornerUpLeft size={14} />
                <span>Reply</span>
              </button>
            )}
            <button
              className={`comment-action upvote-action ${comment.isUpvotedByMe ? "upvoted" : ""}`}
              onClick={() => onUpvote(comment.id)}
              disabled={isUpvoting || !userId}
              data-testid={`button-upvote-${comment.id}`}
            >
              <ArrowUp size={14} />
              <span>{comment.upvotes}</span>
            </button>
            {canDelete && (
              <button
                className="comment-action delete-action"
                onClick={() => onDelete(comment.id)}
                disabled={isDeleting}
                data-testid={`button-delete-${comment.id}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map(child => (
            <CommentNode
              key={child.id}
              comment={child}
              depth={depth + 1}
              factId={factId}
              userId={userId}
              isAdmin={isAdmin}
              onReply={onReply}
              onDelete={onDelete}
              onUpvote={onUpvote}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ factId, onLoginClick }: CommentsSectionProps) {
  const { user, isLoggedIn } = useAuth();
  const [inputBody, setInputBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ parentId: string; username: string } | null>(null);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [pendingUpvote, setPendingUpvote] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comments = [], isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/facts", factId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/facts/${factId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: { body: string; parentId?: string }) => {
      return apiRequest("POST", `/api/facts/${factId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      setInputBody("");
      setReplyTo(null);
      setIsInputExpanded(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      setPendingDelete(commentId);
      return apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      setPendingDelete(null);
    },
    onError: () => setPendingDelete(null),
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

  const handleReply = useCallback((parentId: string, username: string) => {
    setReplyTo({ parentId, username });
    setIsInputExpanded(true);
    setInputBody(`@${username} `);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleCancel = () => {
    setIsInputExpanded(false);
    setReplyTo(null);
    setInputBody("");
  };

  const handleSubmit = () => {
    const trimmed = inputBody.trim();
    if (!trimmed) return;
    postMutation.mutate({ body: trimmed, parentId: replyTo?.parentId });
  };

  const handleInputFocus = () => {
    if (!isLoggedIn) {
      onLoginClick?.("Sign in to leave a comment");
      return;
    }
    setIsInputExpanded(true);
  };

  const tree = buildTree(comments);

  return (
    <div className="comments-section">
      <div className="comment-input-area">
        {!isInputExpanded ? (
          <div
            className="comment-input-collapsed"
            onClick={handleInputFocus}
            data-testid="input-comment-collapsed"
          >
            <div className="collapsed-avatar">
              {isLoggedIn && user ? (
                <img
                  src={getAvatarSrc(user.profilePhoto || "", user.username)}
                  alt={user.username}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="collapsed-avatar-placeholder" />
              )}
            </div>
            <div className="collapsed-placeholder">
              {replyTo ? `Replying to @${replyTo.username}…` : "Share your knowledge about this fact"}
            </div>
          </div>
        ) : (
          <div className="comment-input-expanded">
            <p className="markdown-hint">Markdown is supported.</p>
            <textarea
              ref={textareaRef}
              className="comment-textarea"
              placeholder={replyTo ? `Replying to @${replyTo.username}…` : "Share your knowledge about this fact"}
              value={inputBody}
              onChange={e => setInputBody(e.target.value)}
              rows={4}
              data-testid="input-comment"
            />
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
                disabled={!inputBody.trim() || postMutation.isPending}
                data-testid="button-submit-comment"
              >
                {postMutation.isPending ? "Posting…" : "Comment"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="comments-controls">
        <div className="filter-control">
          <Filter size={14} />
          <span className="filter-label">Filter by:</span>
          <span className="filter-value">View all comments</span>
          <span className="filter-dropdown">▼</span>
        </div>
        <div className="search-control">
          <Search size={14} />
          <span>Search comments</span>
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
              factId={factId}
              userId={user?.id}
              isAdmin={user?.isAdmin}
              onReply={handleReply}
              onDelete={id => deleteMutation.mutate(id)}
              onUpvote={id => {
                if (!isLoggedIn) { onLoginClick?.("Sign in to upvote comments"); return; }
                upvoteMutation.mutate(id);
              }}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
