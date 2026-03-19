import "./CommentsSection.css";

export function AdminBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`admin-badge ${className}`.trim()} data-testid="badge-admin">
      ADMIN
    </span>
  );
}
