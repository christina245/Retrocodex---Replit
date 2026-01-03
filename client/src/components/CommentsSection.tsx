import { useState, useEffect, useRef } from "react";
import { Filter, Search, MessageSquare, Heart, Bookmark, Share2, CornerUpLeft, House, MapPin } from "lucide-react";
import { CommentModal } from "./CommentModal";
import bunnyAvatar from "@assets/dall-e bunny_1764050469609.png";
import alienAvatar from "@assets/space alien_1764050477567.png";
import unicornAvatar from "@assets/cartoon unicorn_1764050606457.png";
import "./CommentsSection.css";

interface Comment {
  id: string;
  username: string;
  isAdmin: boolean;
  avatar: string;
  date: string;
  userHometowns?: string[];
  userLocation?: string;
  body: string[];
  likes: number;
  replyTo?: string;
}

const sampleComments: Comment[] = [
  {
    id: "1",
    username: "retrocodex.admin",
    isAdmin: true,
    avatar: bunnyAvatar,
    date: "Nov 12",
    userHometowns: ["Los Angeles, California, US", "Utrecht, Netherlands"],
    userLocation: "San Francisco, California, US",
    body: [
      "Commenting is currently unavailable in the beta. When user accounts and comments are available, you'll be able to weigh in with your thoughts and learn what other users from other parts of the world have to say. Were they taught differently or similarly relative to your experiences? What consequences of this disinformation did they personally witness?",
      "You probably already know that formal and informal education varies all throughout the world due to several factors, such as disparity in the overall availability of resources, local history, and cultural superstitions.",
      "You'll be able to filter for comments by users from a specific location or a certain graduation date to learn about their unique experiences and compare them to yours!",
      "With enabled comments, you'll also be able to point out any updates, nuances, or inaccuracies within the factual information above. This helps keep all information presented on the website factually accurate, inclusive of diverse backgrounds, and mindful of the fact that knowledge is constantly evolving."
    ],
    likes: 9
  },
  {
    id: "2",
    username: "randomusername",
    isAdmin: false,
    avatar: alienAvatar,
    date: "Nov 14",
    userHometowns: ["New York City, New York, US"],
    body: [
      "Here's what a reply to this comment will look like from another user who has either lived in New York City their entire lives or only selected a hometown of New York City. When creating user profiles, users will be able to select a city, state, and country for each location they've previously lived in and where they currently reside. This is entirely optional for privacy."
    ],
    likes: 5
  },
  {
    id: "3",
    username: "randomusername2",
    isAdmin: false,
    avatar: unicornAvatar,
    date: "Nov 14",
    userLocation: "Rio de Janeiro, Brazil",
    replyTo: "randomusername",
    body: [
      "@randomusername Here's what a reply to the above comment will look like from another user who currently lives in Rio de Janeiro, Brazil."
    ],
    likes: 2
  }
];

export function CommentsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFloatingInput, setShowFloatingInput] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowFloatingInput(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show floating input when comments section is in view
          setShowFloatingInput(entry.isIntersecting);
        });
      },
      { threshold: 0.05, rootMargin: '-50px 0px 0px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile]);

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="comments-section" ref={sectionRef}>
      <div className="comment-input-container" onClick={handleInputClick}>
        <textarea
          placeholder="Share your knowledge about this fact"
          className="comment-input"
          readOnly
          data-testid="input-comment"
        />
      </div>

      <div className="comments-controls">
        <div className="filter-control disabled-action" onClick={handleActionClick}>
          <Filter size={14} />
          <span className="filter-label">Filter by:</span>
          <span className="filter-value">View all comments</span>
          <span className="filter-dropdown">▼</span>
        </div>
        <div className="search-control disabled-action" onClick={handleActionClick}>
          <Search size={14} />
          <span>Search comments</span>
        </div>
      </div>

      <div className="comments-list">
        {sampleComments.map((comment) => (
          <div key={comment.id} className="comment" data-testid={`comment-${comment.id}`}>
            <div className="comment-avatar">
              <img src={comment.avatar} alt={comment.username} />
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-username">{comment.username}</span>
                {comment.isAdmin && <span className="admin-badge">ADMIN</span>}
                <span className="comment-separator">•</span>
                <span className="comment-date">{comment.date}</span>
              </div>
              <div className="comment-user-info">
                {comment.userHometowns && comment.userHometowns.length > 0 && (
                  <span className="user-info-item">
                    <House size={12} />
                    {comment.userHometowns.map((hometown, index) => (
                      <span key={index}>
                        {hometown}
                        {index < comment.userHometowns!.length - 1 && (
                          <span className="info-separator">•</span>
                        )}
                      </span>
                    ))}
                  </span>
                )}
                {comment.userHometowns && comment.userHometowns.length > 0 && comment.userLocation && (
                  <span className="info-separator">•</span>
                )}
                {comment.userLocation && (
                  <span className="user-info-item">
                    <MapPin size={12} />
                    {comment.userLocation}
                  </span>
                )}
              </div>
              <div className="comment-body">
                {comment.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="comment-actions">
                <button className="comment-action disabled-action" onClick={handleActionClick} data-testid={`button-reply-${comment.id}`}>
                  <CornerUpLeft size={14} />
                  <span>Reply</span>
                </button>
                <button className="comment-action disabled-action" onClick={handleActionClick} data-testid={`button-like-${comment.id}`}>
                  <Heart size={14} />
                  <span>{comment.likes} likes</span>
                </button>
                <button className="comment-action disabled-action" onClick={handleActionClick} data-testid={`button-save-comment-${comment.id}`}>
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>
                <button className="comment-action disabled-action" onClick={handleActionClick} data-testid={`button-share-comment-${comment.id}`}>
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CommentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating comment input for mobile */}
      {showFloatingInput && (
        <div className="floating-comment-input" onClick={handleInputClick} data-testid="floating-comment-input">
          <textarea
            placeholder="Share your knowledge..."
            className="floating-input"
            readOnly
          />
        </div>
      )}
    </div>
  );
}
