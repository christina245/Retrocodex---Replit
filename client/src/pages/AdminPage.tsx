import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Lock } from "lucide-react";
import "./AdminPage.css";

interface EmailSubscription {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const { data: emails, isLoading, error } = useQuery<EmailSubscription[]>({
    queryKey: ["/api/emails"],
    queryFn: async () => {
      const response = await fetch("/api/emails", {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        }
      });

      if (response.status === 401) {
        throw new Error("Invalid password");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setAuthError("Please enter a password");
      return;
    }
    setAuthError("");
    setIsAuthenticated(true);
  };

  const exportToCSV = () => {
    if (!emails) return;
    
    const headers = ["Email", "Source", "Date Submitted"];
    const rows = emails.map(sub => [
      sub.email,
      sub.source,
      new Date(sub.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retrocodex-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-container">
          <div className="login-card">
            <div className="login-icon">
              <Lock size={48} />
            </div>
            <h1 className="login-title">Admin Access</h1>
            <p className="login-subtitle">Enter password to view email subscriptions</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                data-testid="input-admin-password"
                autoFocus
              />
              {authError && <div className="login-error" data-testid="text-error">{authError}</div>}
              <button 
                type="submit" 
                className="login-button"
                data-testid="button-login"
              >
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-message" data-testid="text-loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="error-message" data-testid="text-error">
            {error instanceof Error ? error.message : "Failed to load emails"}
          </div>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword("");
            }}
            className="retry-button"
            data-testid="button-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Email Subscriptions</h1>
            <p className="admin-subtitle" data-testid="text-count">
              {emails?.length || 0} {emails?.length === 1 ? 'subscription' : 'subscriptions'}
            </p>
          </div>
          <button 
            onClick={exportToCSV}
            className="export-button"
            data-testid="button-export-csv"
            disabled={!emails || emails.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
        </header>

        <div className="emails-table-container">
          {emails && emails.length > 0 ? (
            <table className="emails-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((subscription) => (
                  <tr key={subscription.id} data-testid={`row-email-${subscription.id}`}>
                    <td className="email-cell" data-testid={`text-email-${subscription.id}`}>
                      {subscription.email}
                    </td>
                    <td className="source-cell">
                      <span className="source-badge" data-testid={`text-source-${subscription.id}`}>
                        {subscription.source === 'signup-banner' ? 'Signup Banner' : 'Save Modal'}
                      </span>
                    </td>
                    <td className="date-cell" data-testid={`text-date-${subscription.id}`}>
                      {new Date(subscription.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p data-testid="text-empty">No email subscriptions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
