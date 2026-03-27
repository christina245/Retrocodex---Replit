import { useState } from "react";
import { ExternalLink, CircleDollarSign, MessageSquare, Bookmark, Share2, Clipboard } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SignInModal } from '@/components/SignInModal';
import './BlogCard.css';

interface SavedArticle {
  id: string;
  articleKey: string;
}

interface BlogCardProps {
  id: string;
  image: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  tags: string[];
  isExternal?: boolean;
  externalUrl?: string | null;
  publicationName?: string | null;
  isPaywalled?: boolean;
  originalPublishedAt?: string | null;
}

export default function BlogCard({
  id,
  image,
  date,
  category,
  title,
  summary,
  tags,
  isExternal = false,
  externalUrl,
  publicationName,
  isPaywalled = false,
  originalPublishedAt,
}: BlogCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSignIn, setShowSignIn] = useState(false);

  const articleKey = isExternal && externalUrl ? externalUrl : id;
  const articleUrl = isExternal && externalUrl ? externalUrl : `${window.location.origin}/articles/${id}`;

  const { data: savedArticles = [] } = useQuery<SavedArticle[]>({
    queryKey: ['/api/user/saved-articles'],
    enabled: !!user,
  });

  const savedRecord = savedArticles.find(a => a.articleKey === articleKey);
  const isSaved = !!savedRecord;

  const saveMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/user/saved-articles', {
      articleKey,
      articleType: isExternal ? 'external' : 'internal',
      title,
      summary,
      coverImage: image,
      category,
      slug: isExternal ? '' : id,
      externalUrl: isExternal ? (externalUrl || '') : '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-articles'] });
    },
    onError: () => {
      toast({
        description: 'Could not save article. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (key: string) => apiRequest('DELETE', `/api/user/saved-articles/${encodeURIComponent(key)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-articles'] });
    },
    onError: () => {
      toast({
        description: 'Could not unsave article. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowSignIn(true);
      return;
    }
    if (isSaved && savedRecord) {
      unsaveMutation.mutate(savedRecord.articleKey);
    } else {
      saveMutation.mutate();
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(articleUrl).then(() => {
      toast({
        description: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clipboard size={15} />
            Article link copied to clipboard
          </span>
        ),
        style: { background: '#2c2c2c', color: '#fff', border: 'none' },
      });
    }).catch(() => {
      toast({
        description: 'Could not copy link.',
        variant: 'destructive',
      });
    });
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isSavePending = saveMutation.isPending || unsaveMutation.isPending;

  const cardContent = (
    <article className="blog-card" data-testid={`blog-card-${id}`}>
      <div className="blog-card-image-container">
        {image ? (
          <img
            src={image}
            alt={title}
            className="blog-card-image"
            data-testid={`blog-card-image-${id}`}
          />
        ) : (
          <div className="blog-card-image-placeholder" data-testid={`blog-card-image-${id}`} />
        )}
        {tags.length > 0 && (
          <div className="blog-card-image-tags">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="blog-card-tag"
                data-testid={`blog-card-tag-${id}-${index}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {isExternal && (
          <div className="blog-card-badges">
            <span
              className="blog-card-badge blog-card-badge--external"
              title={`View article on ${publicationName || 'external site'}`}
              data-testid={`badge-external-${id}`}
            >
              <ExternalLink size={11} />
              {publicationName && <span className="blog-card-badge-text">{publicationName}</span>}
            </span>
            {isPaywalled && (
              <span
                className="blog-card-badge blog-card-badge--paywall"
                title="This article may be behind a paywall"
                data-testid={`badge-paywall-${id}`}
              >
                <CircleDollarSign size={11} />
              </span>
            )}
          </div>
        )}
      </div>

      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-card-date" data-testid={`blog-card-date-${id}`}>
            {date}
          </span>
          <span
            className="blog-card-category"
            data-testid={`blog-card-category-${id}`}
          >
            {category}
          </span>
        </div>

        <h3 className="blog-card-title" data-testid={`blog-card-title-${id}`}>
          {title}
        </h3>

        {summary && (
          <p className="blog-card-summary" data-testid={`blog-card-summary-${id}`}>
            {summary}
          </p>
        )}

        {isExternal && originalPublishedAt && (
          <div className="blog-card-tags" data-testid={`text-original-date-${id}`}>
            Originally published on {originalPublishedAt}
          </div>
        )}
      </div>
    </article>
  );

  const actionRow = (
    <div className="blog-card-actions" data-testid={`blog-card-actions-${id}`}>
      <button
        className="blog-card-action blog-card-action--disabled"
        onClick={handleComment}
        disabled
        aria-disabled="true"
        data-testid={`button-comment-${id}`}
        title="Comments coming soon"
      >
        <MessageSquare size={13} />
        <span>Comment</span>
      </button>
      <button
        className={`blog-card-action${isSaved ? ' blog-card-action--saved' : ''}${isSavePending ? ' blog-card-action--pending' : ''}`}
        onClick={handleSave}
        disabled={isSavePending}
        data-testid={`button-save-${id}`}
        title={isSaved ? 'Remove from saved' : 'Save article'}
      >
        <Bookmark size={13} className={isSaved ? 'blog-card-action-icon--filled' : ''} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
      <button
        className="blog-card-action"
        onClick={handleShare}
        data-testid={`button-share-${id}`}
        title="Copy article link"
      >
        <Share2 size={13} />
        <span>Share</span>
      </button>
    </div>
  );

  if (isExternal && externalUrl) {
    return (
      <div className="blog-card-wrapper">
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-card-link"
          data-testid={`link-blog-card-${id}`}
        >
          {cardContent}
        </a>
        {actionRow}
        <SignInModal
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          contextMessage="Sign in to save articles to your profile."
        />
      </div>
    );
  }

  return (
    <div className="blog-card-wrapper">
      <Link href={`/articles/${id}`} className="blog-card-link" data-testid={`link-blog-card-${id}`}>
        {cardContent}
      </Link>
      {actionRow}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        contextMessage="Sign in to save articles to your profile."
      />
    </div>
  );
}
