import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MapPin, Home, CornerUpLeft, Heart, Bookmark, Check, BookOpen, MessageCircleMore, GitCommitHorizontal, MessageSquare, FileText, FilePenLine } from "lucide-react";
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
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isOwnProfile = user?.username === username;

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

  const demoFacts: FactCardFact[] = [
    {
      id: "aa5b0b21-1ee7-4996-88ef-ad0c4490adc7",
      category: "HISTORY",
      categoryColor: getCategoryColor(["History"]),
      myth: "When the Mexica first met Spanish explorer Hernán Cortés, they believed he was a god.",
      truth: "They might have assumed that the Spanish were representatives of their own god, which was misinterpreted by the Spanish.",
      factFilters: [],
      link: "/fact/mesoamericans-and-europeans-gods",
      coverPhoto: "/uploads/1764719426643-922952402.png",
      betaOnly: false,
    },
    {
      id: "b1b9f88b-3d4e-4eaa-ad36-0380266ec46c",
      category: "HEALTH & FITNESS",
      categoryColor: getCategoryColor(["Health & Fitness"]),
      myth: "You can burn belly fat by doing crunches and other ab workouts.",
      truth: "Any exercise targeting a specific part of the body only builds muscle. These exercises cannot directly accelerate fat loss in the targeted area.",
      factFilters: [],
      link: "/fact/belly-fat-by-doing-ab-workouts",
      coverPhoto: "/uploads/1764752045366-476242776.png",
      betaOnly: false,
    },
  ];

  const dummyEdits = [
    {
      id: "edit-1",
      factTitle: "Breakfast is the most important meal of the day.",
      factLink: "/fact/breakfast-most-important-meal-of-the-day",
      coverPhoto: "/uploads/1765021400264-394912154.png",
      sectionType: "truth" as const,
      revision: "While eating breakfast can be beneficial for certain lifestyles, research shows that its importance varies widely based on individual metabolism, cultural norms, and overall diet. The phrase was originally popularized by cereal companies in the early 20th century as a marketing strategy.",
      timestamp: "2 weeks ago",
    },
    {
      id: "edit-2",
      factTitle: "Pluto is a planet.",
      factLink: "/fact/is-pluto-a-planet",
      coverPhoto: "/objects/uploads/0c6481cd-9156-4d02-a7c1-db51995f9432.png",
      sectionType: "timeline" as const,
      timelineYear: "2026",
      revision: "New Horizons data continued to reveal Pluto's geological complexity, including evidence of a subsurface ocean beneath its icy crust.",
      timestamp: "1 month ago",
    },
    {
      id: "edit-3",
      factTitle: "Humans only have five senses.",
      factLink: "/fact/do-humans-only-have-five-senses",
      coverPhoto: "/uploads/1764732977459-366971984.png",
      sectionType: "sources" as const,
      revision: "Added peer-reviewed study from Nature Neuroscience (2025) on interoceptive awareness as a distinct sensory modality.",
      timestamp: "1 month ago",
    },
    {
      id: "edit-4",
      factTitle: "Cracking your knuckles will give you arthritis.",
      factLink: "/fact/cracking-your-knuckles-arthritis",
      coverPhoto: "/uploads/1764735935195-591724829.png",
      sectionType: "considerations" as const,
      revision: "While cracking does not cause arthritis, some studies suggest habitual cracking may lead to reduced grip strength over time, though evidence is limited and inconclusive.",
      timestamp: "2 months ago",
    },
  ];

  const dummyComments = [
    {
      id: "pub-comment-1",
      factTitle: "Christopher Columbus discovered the Americas in 1492",
      factLink: "/fact/christopher-columbus-discovered-americas",
      coverPhoto: "/uploads/1764719426643-922952402.png",
      comment: "This is one of the most persistent myths I grew up with. It wasn't until college that I learned about the Norse expeditions and the millions of Indigenous peoples who had been living there for thousands of years. History education really needs an overhaul.",
      timestamp: "3 hours ago",
    },
    {
      id: "pub-comment-2",
      factTitle: "Men and women have very different brains.",
      factLink: "/fact/men-women-different-brains",
      coverPhoto: "/uploads/1764752045366-476242776.png",
      comment: "I was told this so many times by everybody growing up! I just thought it made sense because I saw so many differences in how men and women behaved. But the evidence is actually very clear that a lot of these distinctions come from socialization and not innate differences.",
      timestamp: "1 day ago",
    },
  ];

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case "truth":
        return <Check size={16} className="activity-revision-check" />;
      case "timeline":
        return <GitCommitHorizontal size={16} className="activity-revision-icon activity-revision-timeline" />;
      case "sources":
        return <BookOpen size={16} className="activity-revision-icon activity-revision-sources" />;
      case "considerations":
        return <MessageCircleMore size={16} className="activity-revision-icon activity-revision-considerations" />;
      default:
        return <Check size={16} className="activity-revision-check" />;
    }
  };

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
            {!isOwnProfile && user && allowFollows && (
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

              {allowFollows && (
                <div className="user-profile-follow-counts" data-testid="public-profile-follow-counts">
                  <span data-testid="text-follower-count">
                    <strong>{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}
                  </span>
                  <span className="user-profile-follow-sep">·</span>
                  <span data-testid="text-following-count">
                    <strong>{followingCount}</strong> following
                  </span>
                </div>
              )}

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
                {demoFacts.length > 0 ? (
                  <div className="saved-facts-row" data-testid="public-submissions-grid">
                    {demoFacts.map((fact) => (
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
                    <FileText size={40} className="profile-activity-empty-icon" />
                    <p className="profile-activity-empty-title">No approved submissions yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "edits" && (
              <div className="public-edits-content" data-testid="public-edits-content">
                {dummyEdits.length > 0 ? (
                  <div className="following-feed">
                    {dummyEdits.map((edit) => (
                      <div className="activity-post" key={edit.id} data-testid={`public-edit-${edit.id}`}>
                        <div className="activity-post-icon-col">
                          <PlusCircleIcon size={40} />
                        </div>
                        <div className="activity-post-main">
                          <div className="activity-post-header">
                            <div className="activity-post-header-text">
                              <Link href={edit.factLink} className="following-post-link">
                                <p className="fact-myth">"{edit.factTitle}"</p>
                              </Link>
                            </div>
                            <span className="following-post-timestamp">{edit.timestamp}</span>
                          </div>
                          <div className="activity-post-body">
                            <div className="following-post-body-content">
                              <div className="following-post-body-left">
                                <p className="activity-submitted-label">Revision:</p>
                                <div className="activity-submitted-revision">
                                  {getSectionIcon(edit.sectionType)}
                                  {edit.sectionType === "timeline" ? (
                                    <div className="activity-timeline-revision">
                                      <p className="activity-timeline-year">{edit.timelineYear}</p>
                                      <p className="activity-truth-text">{edit.revision}</p>
                                    </div>
                                  ) : (
                                    <p className="activity-truth-text">{edit.revision}</p>
                                  )}
                                </div>
                              </div>
                              <Link href={edit.factLink} className="following-post-cover-link" data-testid={`cover-link-public-edit-${edit.id}`}>
                                <img src={edit.coverPhoto} alt="" className="following-post-cover-photo" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="profile-activity-empty" data-testid="public-edits-empty">
                    <FilePenLine size={40} className="profile-activity-empty-icon" />
                    <p className="profile-activity-empty-title">No approved edits yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="public-comments-content" data-testid="public-comments-content">
                {dummyComments.length > 0 ? (
                  <div className="following-feed">
                    {dummyComments.map((c) => (
                      <div className="public-comment-entry" key={c.id} data-testid={`public-comment-${c.id}`}>
                        <div className="following-post-body-content">
                          <div className="following-post-body-left">
                            <Link href={c.factLink} className="following-post-link">
                              <p className="fact-myth">"{c.factTitle}"</p>
                            </Link>
                            <p className="following-plain-comment" data-testid={`public-comment-text-${c.id}`}>{c.comment}</p>
                            <div className="comment-actions" data-testid={`public-comment-actions-${c.id}`}>
                              <button className="comment-action" onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)} data-testid={`button-reply-public-${c.id}`}>
                                <CornerUpLeft size={14} />
                                <span>Reply</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid={`button-like-public-${c.id}`}>
                                <Heart size={14} />
                                <span>0 likes</span>
                              </button>
                              <button className="comment-action disabled-action" data-testid={`button-save-public-${c.id}`}>
                                <Bookmark size={14} />
                                <span>Save</span>
                              </button>
                            </div>
                            {activeReplyId === c.id && (
                              <div className="inline-reply-box" data-testid={`inline-reply-public-${c.id}`}>
                                <textarea placeholder="Write a reply..." data-testid={`input-reply-public-${c.id}`} />
                                <div className="inline-reply-actions">
                                  <button className="inline-reply-btn" data-testid={`button-submit-reply-public-${c.id}`}>Reply</button>
                                </div>
                              </div>
                            )}
                            <span className="public-comment-timestamp" data-testid={`public-comment-time-${c.id}`}>{c.timestamp}</span>
                          </div>
                          <Link href={c.factLink} className="following-post-cover-link" data-testid={`cover-link-public-comment-${c.id}`}>
                            <img src={c.coverPhoto} alt="" className="following-post-cover-photo" />
                          </Link>
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

function PlusCircleIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#878787" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
