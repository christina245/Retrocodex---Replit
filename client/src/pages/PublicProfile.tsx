import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MapPin, Home, MessageSquare, ArrowUp, CornerUpLeft } from "lucide-react";
import scrungyAtWork from "@assets/scrungy_at_work_painted_1775522114338.png";
import { SingleFactHeader } from "@/components/SingleFactHeader";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { FactCard } from "@/components/FactCard";
import type { Fact as FactCardFact } from "@/components/FactCard";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { AdminBadge } from "@/components/AdminBadge";
import { getCountryFlag } from "@/lib/countryFlags";
import placeholderPhoto from "@assets/elementor-placeholder-image_1770884094599.png";
import "../components/ExtendedFactCard.css";
import "../components/HomepageTabs.css";
import "../components/CommentsSection.css";
import "../pages/UserDashboard.css";
import "./PublicProfile.css";

type PublicProfileTab = "submissions" | "edits" | "comments";

const PUBLIC_PROFILE_TABS: { id: PublicProfileTab; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "edits", label: "Edits" },
  { id: "comments", label: "Comments" },
];

const getCategoryColor = (categories: string[]) => {
  const cat = (categories[0] || "").toLowerCase();
  if (cat.includes("history")) return "#C26E4B";
  if (cat.includes("life sci")) return "#5B8C5A";
  if (cat.includes("health")) return "#A74A8B";
  if (cat.includes("social")) return "#4A7FB5";
  if (cat.includes("gender")) return "#D4A843";
  if (cat.includes("everyday")) return "#7B68AE";
  return "#878787";
};

export default function PublicProfile() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username || "";
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PublicProfileTab>("submissions");
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isOwnProfile = user?.username === username;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [username]);

  const { data: apiProfile } = useQuery<{
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    currentLocation: string | null;
    showCurrentLocation: boolean | null;
    placesLived: string[] | null;
    showPlacesLived: boolean | null;
    favoriteTags: string[] | null;
    misinfoSource: string | null;
    allowFollows: boolean | null;
    isAdmin: boolean | null;
    followerCount: number;
    followingCount: number;
  }>({
    queryKey: ["/api/users", username],
    enabled: !!username,
  });

  const targetUserId = apiProfile?.id ?? "";
  const allowFollows = apiProfile?.allowFollows ?? true;

  const { data: followStatus } = useQuery<{ isFollowing: boolean; allowFollows: boolean }>({
    queryKey: ["/api/follow/status", targetUserId],
    enabled: !!user && !isOwnProfile && !!targetUserId,
  });

  const isFollowing = followStatus?.isFollowing ?? false;
  const [optimisticFollowerCount, setOptimisticFollowerCount] = useState<number | null>(null);
  const followerCount = optimisticFollowerCount ?? apiProfile?.followerCount ?? 0;
  const followingCount = apiProfile?.followingCount ?? 0;

  const followMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/follow/${targetUserId}`),
    onMutate: () => setOptimisticFollowerCount((followerCount) + 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow/status", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", username] });
      if (user?.username) queryClient.invalidateQueries({ queryKey: ["/api/users", user.username] });
      setOptimisticFollowerCount(null);
    },
    onError: () => setOptimisticFollowerCount(null),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/follow/${targetUserId}`),
    onMutate: () => setOptimisticFollowerCount(Math.max(0, followerCount - 1)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow/status", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", username] });
      if (user?.username) queryClient.invalidateQueries({ queryKey: ["/api/users", user.username] });
      setOptimisticFollowerCount(null);
    },
    onError: () => setOptimisticFollowerCount(null),
  });

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const profileData = {
    username: username,
    profilePhoto: isOwnProfile
      ? (user?.profilePhoto || "")
      : (apiProfile?.avatarUrl || ""),
    currentLocation: isOwnProfile
      ? (user?.currentLocation || "")
      : (apiProfile?.currentLocation || ""),
    showCurrentLocation: isOwnProfile
      ? (user?.showCurrentLocation || false)
      : (apiProfile?.showCurrentLocation ?? false),
    placesLived: isOwnProfile
      ? (user?.placesLived || [])
      : (apiProfile?.placesLived || []),
    showPlacesLived: isOwnProfile
      ? (user?.showPlacesLived || false)
      : (apiProfile?.showPlacesLived ?? false),
    favoriteTags: isOwnProfile
      ? (user?.favoriteTags || [])
      : (apiProfile?.favoriteTags || []),
    misinfoSource: isOwnProfile
      ? (user?.misinfoSource || "")
      : (apiProfile?.misinfoSource || ""),
    bio: isOwnProfile
      ? (user?.bio || "")
      : (apiProfile?.bio || ""),
    isAdmin: isOwnProfile
      ? (user?.isAdmin ?? false)
      : (apiProfile?.isAdmin ?? false),
  };

  const MAX_VISIBLE_TAGS = 5;
  const MAX_VISIBLE_PLACES = 2;
  const visibleTags = showAllTags
    ? profileData.favoriteTags
    : profileData.favoriteTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = profileData.favoriteTags.length > MAX_VISIBLE_TAGS;
  const visiblePlaces = showAllPlaces
    ? profileData.placesLived
    : profileData.placesLived.slice(0, MAX_VISIBLE_PLACES);
  const hasMorePlaces = profileData.placesLived.length > MAX_VISIBLE_PLACES;

  const getTagSlug = (tag: string) => tag.toLowerCase().replace(/\s+/g, "-");

  type SubmissionRow = {
    id: string;
    slug: string;
    mythHeader: string;
    truthHeader: string;
    coverPhoto: string | null;
    categories: string[];
    factFilters: string[];
    betaOnly: boolean;
  };

  type CommentRow = {
    id: string;
    body: string;
    createdAt: string;
    upvotes: number;
    isUpvotedByMe?: boolean;
    factTitle: string | null;
    factSlug: string | null;
    factCoverPhoto: string | null;
    pageSlug: string | null;
    pageTitle: string | null;
  };

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery<SubmissionRow[]>({
    queryKey: ["/api/users", username, "submissions"],
    enabled: !!username && activeTab === "submissions",
    staleTime: 0,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery<CommentRow[]>({
    queryKey: ["/api/users", username, "comments"],
    enabled: !!username && activeTab === "comments",
    staleTime: 0,
  });

  const [commentUpvoteStates, setCommentUpvoteStates] = useState<Record<string, { upvotes: number; isUpvotedByMe: boolean }>>({});
  const [pendingProfileUpvote, setPendingProfileUpvote] = useState<string | null>(null);

  const profileUpvoteMutation = useMutation({
    mutationFn: (commentId: string) => {
      setPendingProfileUpvote(commentId);
      return apiRequest("POST", `/api/comments/${commentId}/upvote`);
    },
    onSuccess: async (res, commentId) => {
      const data = await res.json();
      setCommentUpvoteStates(prev => ({
        ...prev,
        [commentId]: { upvotes: data.upvotes, isUpvotedByMe: data.isUpvoted },
      }));
      setPendingProfileUpvote(null);
    },
    onError: () => setPendingProfileUpvote(null),
  });

  function getCommentUpvotes(c: CommentRow) {
    return commentUpvoteStates[c.id]?.upvotes ?? c.upvotes;
  }
  function getCommentIsUpvoted(c: CommentRow) {
    return commentUpvoteStates[c.id]?.isUpvotedByMe ?? (c.isUpvotedByMe ?? false);
  }

  function formatRelativeTime(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const submissionFacts: FactCardFact[] = (submissionsData ?? []).map((s) => ({
    id: s.id,
    category: (s.categories?.[0] || "Everyday Life").toUpperCase(),
    categoryColor: getCategoryColor(s.categories ?? []),
    myth: s.mythHeader,
    truth: s.truthHeader,
    factFilters: s.factFilters ?? [],
    link: `/fact/${s.slug}`,
    coverPhoto: s.coverPhoto ?? "",
    betaOnly: s.betaOnly ?? false,
  }));

  return (
    <div className="public-profile-page">
      <SEO
        title={`${username}'s Profile | Retrocodex`}
        description={`View ${username}'s public profile on Retrocodex.`}
      />
      <SingleFactHeader onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="public-profile-container">
        <div className="public-profile-banner" data-testid="public-profile-banner">
          <div className="user-profile-banner">
            {!isOwnProfile && user && allowFollows && !!targetUserId && (
              <button
                className={`profile-banner-primary-btn profile-banner-corner-btn${isFollowing ? " profile-banner-following-btn" : ""}`}
                onClick={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                data-testid="button-follow-user"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            <div className="user-profile-photo-wrapper">
              <img
                src={profileData.profilePhoto || placeholderPhoto}
                alt={`${profileData.username}'s profile photo`}
                className="user-profile-photo"
                data-testid="img-public-profile-photo"
              />
            </div>
            <div className="user-profile-details">
              <h2 className="user-profile-username" data-testid="text-public-username">
                {profileData.username}
                {profileData.isAdmin && <AdminBadge className="ml-2" />}
              </h2>

              <div className="user-profile-follow-counts" data-testid="public-profile-follow-counts">
                <span data-testid="text-follower-count">
                  <strong>{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}
                </span>
                <span className="user-profile-follow-sep">·</span>
                <span data-testid="text-following-count">
                  <strong>{followingCount}</strong> following
                </span>
              </div>

              <div className="user-profile-locations-wrapper" data-testid="public-profile-locations">
                {profileData.showCurrentLocation && profileData.currentLocation ? (
                  <div className="user-profile-current-location">
                    <span className="user-profile-location-item" data-testid="text-public-current-location">
                      <MapPin size={14} />
                      {(() => { const f = getCountryFlag(profileData.currentLocation); return f ? <span className="location-flag" aria-hidden="true">{f}</span> : null; })()}
                      {profileData.currentLocation}
                    </span>
                  </div>
                ) : null}
                {profileData.showPlacesLived && profileData.placesLived.length > 0 ? (
                  <div className="user-profile-places-lived">
                    <Home size={14} className="user-profile-places-icon" />
                    {visiblePlaces.map((loc, index) => (
                      <span key={loc}>
                        {index > 0 && (
                          <span className="user-profile-separator">  {"\u00B7"}  </span>
                        )}
                        <span className="user-profile-place-item" data-testid={`text-public-place-lived-${index}`}>
                          {(() => { const f = getCountryFlag(loc); return f ? <span className="location-flag" aria-hidden="true">{f}</span> : null; })()}
                          {loc}
                        </span>
                      </span>
                    ))}
                    {hasMorePlaces && (
                      <button
                        type="button"
                        className="user-profile-view-more"
                        onClick={() => setShowAllPlaces(!showAllPlaces)}
                        data-testid="button-public-view-more-places"
                      >
                        {showAllPlaces ? "Show less" : "+View more"}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="user-profile-section" data-testid="public-profile-tags-section">
                <h3 className="user-profile-section-label">FAVORITE SUBJECTS</h3>
                {profileData.favoriteTags.length > 0 ? (
                  <div className="user-profile-tags-row" data-testid="public-profile-tags">
                    {visibleTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${getTagSlug(tag)}`}
                        className="user-profile-tag-chip"
                        data-testid={`public-profile-tag-${getTagSlug(tag)}`}
                      >
                        {tag.toLowerCase()}
                      </Link>
                    ))}
                    {hasMoreTags && (
                      <button
                        type="button"
                        className="user-profile-view-more"
                        onClick={() => setShowAllTags(!showAllTags)}
                        data-testid="button-public-view-more-tags"
                      >
                        {showAllTags ? "Show less" : "+View more"}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="user-profile-empty-text" data-testid="text-public-tags-empty">--</span>
                )}
              </div>

              {profileData.misinfoSource && (
                <div className="user-profile-section" data-testid="public-profile-misinfo-section">
                  <h3 className="user-profile-section-label">
                    THE #1 SOURCE OF MISINFORMATION IN MY LIFE IS
                  </h3>
                  <p className="user-profile-misinfo-answer" data-testid="text-public-misinfo-answer">
                    {profileData.misinfoSource}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

      {profileData.bio && (
        <div className="public-profile-about-section" data-testid="public-profile-about-section">
          <h3 className="user-profile-section-label">ABOUT</h3>
          <div className="profile-bio-text" data-testid="text-public-about">
            <ReactMarkdown>{profileData.bio}</ReactMarkdown>
          </div>
        </div>
      )}

        <div className="public-profile-tabs-section">
          <div className="notifications-tabs-wrapper">
            <nav className="notifications-tabs" data-testid="public-profile-tabs">
              {PUBLIC_PROFILE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`notifications-tab${activeTab === tab.id ? " notifications-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`button-public-tab-${tab.id}`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="public-profile-tab-content" data-testid="public-profile-tab-content">

            {activeTab === "submissions" && (
              <div className="public-submissions-content" data-testid="public-submissions-content">
                {submissionsLoading ? (
                  <div className="profile-activity-empty" data-testid="public-submissions-loading">
                    <p className="profile-activity-empty-desc">Loading submissions...</p>
                  </div>
                ) : submissionFacts.length > 0 ? (
                  <div className="saved-facts-row" data-testid="public-submissions-grid">
                    {submissionFacts.map((fact) => (
                      <FactCard
                        key={fact.id}
                        fact={fact}
                        onSave={() => {}}
                        onShare={() => {}}
                        onComment={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="profile-activity-empty" data-testid="public-submissions-empty">
                    <p className="profile-activity-empty-desc">This user doesn't have any approved submissions yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "edits" && (
              <div className="public-edits-content" data-testid="public-edits-content">
                <div className="edit-requests-beta-state" data-testid="public-edits-beta-empty">
                  <img src={scrungyAtWork} alt="Scrungy the squirrel" className="edit-requests-beta-squirrel" />
                  <p className="edit-requests-beta-text">Editing content is currently unavailable in the beta. Scrungy is working on it!</p>
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="public-comments-content" data-testid="public-comments-content">
                {commentsLoading ? (
                  <div className="profile-activity-empty" data-testid="public-comments-loading">
                    <p className="profile-activity-empty-desc">Loading comments...</p>
                  </div>
                ) : (commentsData ?? []).length > 0 ? (
                  <div className="following-feed">
                    {(commentsData ?? []).map((c) => (
                      <div className="public-comment-entry" key={c.id} data-testid={`public-comment-${c.id}`}>
                        <div className="following-post-body-content">
                          <div className="following-post-body-left">
                            <Link href={c.pageSlug ? `/${c.pageSlug}` : `/fact/${c.factSlug}`} className="following-post-link">
                              <p className="fact-myth">{c.pageSlug ? (c.pageTitle ?? c.factTitle) : `"${c.factTitle}"`}</p>
                            </Link>
                            <div className="following-plain-comment" data-testid={`public-comment-text-${c.id}`}><ReactMarkdown>{c.body}</ReactMarkdown></div>
                            <span className="public-comment-timestamp" data-testid={`public-comment-time-${c.id}`}>{formatRelativeTime(c.createdAt)}</span>
                          </div>
                          {c.factCoverPhoto && (
                            <Link href={c.pageSlug ? `/${c.pageSlug}` : `/fact/${c.factSlug}`} className="following-post-cover-link" data-testid={`cover-link-public-comment-${c.id}`}>
                              <img src={c.factCoverPhoto} alt="" className="following-post-cover-photo" />
                            </Link>
                          )}
                        </div>
                        <div className="comment-actions">
                          <Link
                            href={c.pageSlug ? `/${c.pageSlug}#comments` : `/fact/${c.factSlug}#comments`}
                            className="comment-action"
                            data-testid={`link-profile-reply-${c.id}`}
                          >
                            <CornerUpLeft size={14} />
                            <span>Reply</span>
                          </Link>
                          <button
                            className={`comment-action upvote-action${getCommentIsUpvoted(c) ? " upvoted" : ""}`}
                            onClick={() => {
                              if (!isLoggedIn) return;
                              profileUpvoteMutation.mutate(c.id);
                            }}
                            disabled={pendingProfileUpvote === c.id}
                            data-testid={`button-profile-upvote-${c.id}`}
                          >
                            <ArrowUp size={14} />
                            <span>{getCommentUpvotes(c)}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-activity-empty" data-testid="public-comments-empty">
                    <MessageSquare size={40} className="profile-activity-empty-icon" />
                    <p className="profile-activity-empty-title">No comments yet.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

