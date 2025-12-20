import { useState } from "react";
import { Filter, Search, MessageSquare, Heart, Bookmark, Share2, CornerUpLeft } from "lucide-react";
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
  highSchoolInfo?: string;
  universityInfo?: string;
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
    highSchoolInfo: "High school class of 2011 in California, US",
    universityInfo: "University class of 2015 in California, US",
    body: [
      "Commenting is currently unavailable in the beta. When user accounts and comments are available, you'll be able to weigh in with your thoughts and learn what other users from other parts of the world have to say. Were they taught differently or similarly relative to your experiences? What consequences of this disinformation did they personally witness?",
      "You probably already know that formal and informal education varies all throughout the world due to several factors, such as disparity in the overall availability of resources, local history, and cultural superstitions.",
      "You'll be able to filter for comments by users from a specific location or a certain graduation date to learn about their unique experiences and compare them to yours!",
      "With enabled comments, you'll also be able to point out any updates, nuances, or inaccuracies within the factual information above. This helps keep all information presented on the website factually accurate, inclusive of diverse backgrounds, and mindful of the fact that knowledge is constantly evolving."
    ],
    likes: 0
  },
  {
    id: "2",
    username: "randomusername",
    isAdmin: false,
    avatar: alienAvatar,
    date: "Nov 14",
    highSchoolInfo: "High school class of 2006 in California, US",
    universityInfo: "University class of 2011 and 2015 in New York, US and Texas, US",
    body: [
      "Here's what a reply to this comment will look like from another user who graduated high school in Los Angeles County, then completed undergrad at Columbia University and a masters at University of Houston. When creating user profiles, users will be able to select the state and country where they attended school and school type (high school, university, trade school, etc).",
      "This makes it possible for you to search for comments from users of a certain geographical region to learn how this particular fact was taught there.",
      "Publicly displaying this information is completely optional for privacy reasons. You'll be able to keep this info private or just not report it at all."
    ],
    likes: 0
  },
  {
    id: "3",
    username: "randomusername2",
    isAdmin: false,
    avatar: unicornAvatar,
    date: "Nov 14",
    highSchoolInfo: "High school class of 2010 in Brazil",
    universityInfo: "University class of 2016 in Japan",
    replyTo: "randomusername",
    body: [
      "@randomusername Here's what a reply to the above comment will look like from another user who grew up in Brazil and moved to Japan for university.",
      "Even within countries, education and culture isn't monolithic. For privacy reasons, Retrocodex won't ask you to share or privately input where you grew up and went to school beyond the state level. Again, sharing any info on where you went to school is totally optional!"
    ],
    likes: 0
  }
];

export function CommentsSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="comments-section">
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
                {comment.highSchoolInfo && (
                  <span>{comment.highSchoolInfo}</span>
                )}
                {comment.highSchoolInfo && comment.universityInfo && (
                  <span className="info-separator">•</span>
                )}
                {comment.universityInfo && (
                  <span>{comment.universityInfo}</span>
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
    </div>
  );
}
