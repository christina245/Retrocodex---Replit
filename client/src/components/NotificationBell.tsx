import { Bell } from "lucide-react";
import "./NotificationBell.css";

interface NotificationBellProps {
  count: number;
  size?: number;
  onClick?: () => void;
  className?: string;
  testId?: string;
}

export function NotificationBell({ count, size = 20, onClick, className = "", testId }: NotificationBellProps) {
  return (
    <button
      className={`notification-bell ${className}`}
      onClick={onClick}
      data-testid={testId || "button-notification-bell"}
      aria-label={count > 0 ? `${count} notifications` : "No notifications"}
    >
      <Bell size={size} />
      {count > 0 && (
        <span className="notification-bell-badge" data-testid="notification-badge">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
