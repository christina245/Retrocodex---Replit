import { useState, useRef, useCallback } from "react";
import { Filter, Search, MapPin, House, CornerUpLeft, ArrowUp, Trash2, LogIn } from "lucide-react";
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

function getAvatarSrc(_avatarUrl: string, username: string) {
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

interface CommentNodeProps {
  comment: TreeComment;
  depth: number;
  factId: string;
  isLoggedIn: boolean;
  userId?: string;
  isAdmin?: boolean;
  onDelete: (id: string) => void;
  onUpvote: (id: string) => void;
  onLoginClick?: (msg: string) => void;
  pendingUpvote: string | null;
  pendingDelete: string | null;
  postReply: (parentId: string, body: string) => Promise<void>;
  replyPending: boolean;
}

function CommentNode({
  comment, depth, factId, isLoggedIn, userId, isAdmin,
  onDelete, onUpvote, onLoginClick, pendingUpvote, pendingDelete,
  postReply, replyPending
}: CommentNodeProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const canDelete = isAdmin || comment.userId === userId;
  const isUpvoting = pendingUpvote === comment.id;
  const isDeleting = pendingDelete === comment.id;

  const hasCurrentLocation = comment.showCurrentLocation && comment.currentLocation;
  const hasPlacesLived = comment.showPlacesLived && comment.placesLived && comment.placesLived.length > 0;
  const showLocationRow = hasCurrentLocation || hasPlacesLived;

  const handleReply = () => {
    if (!isLoggedIn) { onLoginClick?.("Sign in to reply to comments"); return; }
    setReplyOpen(true);
  };

  const handleReplySubmit = async (body: string) => {
    await postReply(comment.id, body);
    setReplyOpen(false);
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

          {replyOpen && (
            <InlineReplyComposer
              parentUsername={comment.username}
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyOpen(false)}
              isPending={replyPending}
            />
          )}
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
              isLoggedIn={isLoggedIn}
              userId={userId}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onUpvote={onUpvote}
              onLoginClick={onLoginClick}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
              postReply={postReply}
              replyPending={replyPending}
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
  const [inputError, setInputError] = useState<string | null>(null);
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
    enabled: !!factId,
  });

  const postMutation = useMutation({
    mutationFn: async (data: { body: string; parentId?: string }) =>
      apiRequest("POST", `/api/facts/${factId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facts", factId, "comments"] });
      setInputBody("");
      setInputError(null);
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

  const postReply = useCallback(async (parentId: string, body: string) => {
    await postMutation.mutateAsync({ body, parentId });
  }, [postMutation]);

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
            onClick={() => onLoginClick?.("Sign in to leave a comment")}
            data-testid="button-sign-in-to-comment"
          >
            <LogIn size={16} />
            <span>Sign in to comment</span>
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
              isLoggedIn={isLoggedIn}
              userId={user?.id}
              isAdmin={user?.isAdmin}
              onDelete={id => deleteMutation.mutate(id)}
              onUpvote={id => upvoteMutation.mutate(id)}
              onLoginClick={onLoginClick}
              pendingUpvote={pendingUpvote}
              pendingDelete={pendingDelete}
              postReply={postReply}
              replyPending={postMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
