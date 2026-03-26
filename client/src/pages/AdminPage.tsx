import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Download, Lock, Plus, FileText, Mail, X, Check, GripVertical, Eye, Edit2, ChevronLeft, ChevronRight, Newspaper, Search, Shield, Inbox, Ban, AlertCircle, SearchCheck, ClipboardCheck, Link, Loader2 } from "lucide-react";
import { CATEGORIES, OTHER_SUBCATEGORIES, BLOG_TAGS, AUTHOR_TYPES, DECADES, type Source, type TimelineEntry, type Nuance, type Fact, type BlogPost } from "@shared/schema";
import TiptapEditor from "@/components/TiptapEditor";
import "@/components/TiptapEditor.css";
import "./AdminPage.css";
import logoIcon from "@assets/line_logo_white_background_1764717128944.png";
import adminAvatar from "@assets/favicon_round_1764970500110.png";

interface EmailSubscription {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

type AdminView = "add-fact" | "add-blog" | "view-blog" | "emails" | "view-facts" | "manage-admins" | "submissions" | "add-external" | "view-external";

interface FactSubmission {
  id: string;
  userId: string;
  username: string;
  mythHeader: string;
  mythDetails: string;
  truthHeader: string;
  truthDetails: string;
  sources: Source[];
  considerations: string;
  otherDetails: string;
  status: "pending" | "saved" | "rejected" | "published";
  adminNote: string | null;
  draftData: Record<string, any> | null;
  createdAt: string;
  email: string | null;
  submissionBanned: boolean | null;
}

const AVAILABLE_FACT_FILTERS = [
  "Context Matters",
  "Controversial",
  "Regionally Taught",
  "Partially True",
  "Official Revision",
  "Uncertain"
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentView, setCurrentView] = useState<AdminView>("add-fact");
  
  // Admin management state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminActionMessage, setAdminActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit mode state
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  
  // View Facts pagination and search
  const [factsPage, setFactsPage] = useState(1);
  const [factsSearch, setFactsSearch] = useState("");
  const FACTS_PER_PAGE = 10;
  
  // Blog post edit mode
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  
  // Blog post pagination
  const [blogPage, setBlogPage] = useState(1);
  const BLOGS_PER_PAGE = 10;
  
  // Form state for Blog Post
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [blogCoverCaption, setBlogCoverCaption] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [blogContent, setBlogContent] = useState<any>(null);
  const [blogContentHtml, setBlogContentHtml] = useState("");
  const [blogAuthorType, setBlogAuthorType] = useState<"Staff" | "Guest">("Staff");
  const [blogAuthorName, setBlogAuthorName] = useState("Retrocodex Admin");
  const [blogAuthorLink, setBlogAuthorLink] = useState("");
  const [blogHeroFeatured, setBlogHeroFeatured] = useState(false);
  const [blogPublished, setBlogPublished] = useState(false);
  const [blogRelatedIds, setBlogRelatedIds] = useState<string[]>([]);
  const [isBlogSubmitting, setIsBlogSubmitting] = useState(false);
  const [blogSubmitMessage, setBlogSubmitMessage] = useState("");

  // Form state for Add New Fact
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [revisionYear, setRevisionYear] = useState<number | null>(null);
  const [originDecade, setOriginDecade] = useState<string | null>(null);
  const [taughtUntilYear, setTaughtUntilYear] = useState<string | null>(null);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchTagInput, setSearchTagInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [betaOnly, setBetaOnly] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isDebated, setIsDebated] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [mythHeader, setMythHeader] = useState("");
  const [mythDetails, setMythDetails] = useState("");
  const [truthHeader, setTruthHeader] = useState("");
  const [truthDetails, setTruthDetails] = useState("");
  const [sources, setSources] = useState<Source[]>([{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [nuances, setNuances] = useState<Nuance[]>([]);
  const [relatedMythIds, setRelatedMythIds] = useState<string[]>([]);
  const [relatedMythSearch, setRelatedMythSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Submissions state
  const [submissionsTab, setSubmissionsTab] = useState<"pending" | "saved" | "rejected">("pending");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [submissionUsername, setSubmissionUsername] = useState("");
  const [submissionActionMsg, setSubmissionActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // External article form state
  const [extUrl, setExtUrl] = useState("");
  const [extTitle, setExtTitle] = useState("");
  const [extPublication, setExtPublication] = useState("");
  const [extAuthor, setExtAuthor] = useState("");
  const [extSummary, setExtSummary] = useState("");
  const [extPublishedAt, setExtPublishedAt] = useState("");
  const [extCoverImage, setExtCoverImage] = useState("");
  const [extCoverUploading, setExtCoverUploading] = useState(false);
  const [extCategory, setExtCategory] = useState("");
  const [extTags, setExtTags] = useState<string[]>([]);
  const [extIsPaywalled, setExtIsPaywalled] = useState(false);
  const [extPublished, setExtPublished] = useState(false);
  const [extIsParsing, setExtIsParsing] = useState(false);
  const [extParseError, setExtParseError] = useState("");
  const [extSubmitting, setExtSubmitting] = useState(false);
  const [extSubmitMsg, setExtSubmitMsg] = useState("");
  const [editingExtId, setEditingExtId] = useState<string | null>(null);

  interface ExternalArticle {
    id: string;
    title: string;
    externalUrl: string;
    publicationName: string;
    authorName: string;
    summary: string | null;
    publishedAt: string | null;
    coverImage: string | null;
    category: string;
    tags: string[];
    isPaywalled: boolean;
    published: boolean;
    createdAt: string;
  }

  const { data: externalArticles, isLoading: extLoading, refetch: refetchExternal } = useQuery<ExternalArticle[]>({
    queryKey: ["/api/external-articles"],
    queryFn: async () => {
      const response = await fetch("/api/external-articles", {
        headers: { 'Authorization': 'Basic ' + btoa('admin:' + password) },
      });
      if (!response.ok) throw new Error("Failed to fetch external articles");
      return response.json();
    },
    enabled: isAuthenticated && (currentView === "view-external" || currentView === "add-external"),
  });

  const resetExtForm = () => {
    setEditingExtId(null);
    setExtUrl("");
    setExtTitle("");
    setExtPublication("");
    setExtAuthor("");
    setExtSummary("");
    setExtPublishedAt("");
    setExtCoverImage("");
    setExtCategory("");
    setExtTags([]);
    setExtIsPaywalled(false);
    setExtPublished(false);
    setExtParseError("");
    setExtSubmitMsg("");
  };

  const loadExtForEdit = (article: ExternalArticle) => {
    setEditingExtId(article.id);
    setExtUrl(article.externalUrl);
    setExtTitle(article.title);
    setExtPublication(article.publicationName);
    setExtAuthor(article.authorName || "");
    setExtSummary(article.summary || "");
    setExtPublishedAt(article.publishedAt || "");
    setExtCoverImage(article.coverImage || "");
    setExtCategory(article.category);
    setExtTags(article.tags || []);
    setExtIsPaywalled(article.isPaywalled || false);
    setExtPublished(article.published || false);
    setExtParseError("");
    setExtSubmitMsg("");
    setCurrentView("add-external");
  };

  const handleParseUrl = async () => {
    if (!extUrl) return;
    setExtIsParsing(true);
    setExtParseError("");
    try {
      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify({ url: extUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        setExtParseError(data.message || "Failed to parse URL");
        return;
      }
      if (data.title && !extTitle) setExtTitle(data.title);
      if (data.image && !extCoverImage) setExtCoverImage(data.image);
      if (data.publication && !extPublication) setExtPublication(data.publication);
      if (data.author && !extAuthor) setExtAuthor(data.author);
    } catch (err) {
      setExtParseError("Failed to fetch URL metadata");
    } finally {
      setExtIsParsing(false);
    }
  };

  const handleExtSubmit = async (publishOverride?: boolean) => {
    setExtSubmitting(true);
    setExtSubmitMsg("");
    const published = publishOverride !== undefined ? publishOverride : extPublished;
    const payload = {
      title: extTitle,
      externalUrl: extUrl,
      publicationName: extPublication,
      authorName: extAuthor || undefined,
      summary: extSummary || undefined,
      publishedAt: extPublishedAt || undefined,
      coverImage: extCoverImage || undefined,
      category: extCategory,
      tags: extTags,
      isPaywalled: extIsPaywalled,
      published,
    };
    try {
      const url = editingExtId ? `/api/external-articles/${editingExtId}` : "/api/external-articles";
      const method = editingExtId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save");
      setExtPublished(published);
      setExtSubmitMsg(published
        ? (editingExtId ? "Article updated and published!" : "Article saved and published!")
        : (editingExtId ? "Draft updated!" : "Article saved as draft!"));
      queryClient.invalidateQueries({ queryKey: ["/api/external-articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      if (!editingExtId) resetExtForm();
    } catch (err) {
      setExtSubmitMsg(err instanceof Error ? err.message : "Failed to save external article");
    } finally {
      setExtSubmitting(false);
    }
  };

  useEffect(() => {
    if (!extSubmitMsg) return;
    const timer = setTimeout(() => setExtSubmitMsg(""), 4000);
    return () => clearTimeout(timer);
  }, [extSubmitMsg]);

  const deleteExternalArticle = async (id: string) => {
    if (!confirm("Delete this external article?")) return;
    try {
      const response = await fetch(`/api/external-articles/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': 'Basic ' + btoa('admin:' + password) },
      });
      if (!response.ok) throw new Error("Failed to delete");
      queryClient.invalidateQueries({ queryKey: ["/api/external-articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    } catch (err) {
      alert("Failed to delete external article");
    }
  };

  const uploadExtCoverPhoto = async (file: File) => {
    setExtCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { 'Authorization': 'Basic ' + btoa('admin:' + password) },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setExtCoverImage(data.url);
    } catch (err) {
      alert("Failed to upload cover photo");
    } finally {
      setExtCoverUploading(false);
    }
  };

  const { data: emails, isLoading: emailsLoading, error: emailsError } = useQuery<EmailSubscription[]>({
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
    enabled: isAuthenticated && currentView === "emails",
  });

  const { data: facts, isLoading: factsLoading, error: factsError } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
    queryFn: async () => {
      const response = await fetch("/api/facts", {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        }
      });

      if (response.status === 401) {
        throw new Error("Invalid password");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch facts");
      }

      return response.json();
    },
    enabled: isAuthenticated && (currentView === "view-facts" || currentView === "add-fact"),
  });

  const { data: blogPosts, isLoading: blogPostsLoading, error: blogPostsError } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog-posts", {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        }
      });

      if (response.status === 401) {
        throw new Error("Invalid password");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }

      return response.json();
    },
    enabled: isAuthenticated && (currentView === "view-blog" || currentView === "add-blog"),
  });

  const { data: adminsList, isLoading: adminsLoading, refetch: refetchAdmins } = useQuery<{ username: string; createdAt: string }[]>({
    queryKey: ["/api/admin/admins"],
    queryFn: async () => {
      const response = await fetch("/api/admin/admins", {
        headers: { 'Authorization': 'Basic ' + btoa('admin:' + password) },
      });
      if (!response.ok) throw new Error("Failed to fetch admins");
      return response.json();
    },
    enabled: isAuthenticated && currentView === "manage-admins",
  });

  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery<FactSubmission[]>({
    queryKey: ["/api/submissions"],
    queryFn: async () => {
      const response = await fetch("/api/submissions", {
        headers: { 'Authorization': 'Basic ' + btoa('admin:' + password) },
      });
      if (!response.ok) throw new Error("Failed to fetch submissions");
      return response.json();
    },
    enabled: isAuthenticated && currentView === "submissions",
  });

  const patchSubmissionMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; adminNote?: string; draftData?: any }) => {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update submission");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/admin/toggle-submission-ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to toggle ban");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });

  const grantAdminMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/admin/grant-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to grant admin");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAdminActionMessage({ type: "success", text: data.message });
      setAdminUsername("");
      refetchAdmins();
    },
    onError: (err: Error) => {
      setAdminActionMessage({ type: "error", text: err.message });
    },
  });

  const revokeAdminMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/admin/revoke-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': 'Basic ' + btoa('admin:' + password),
        },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to revoke admin");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAdminActionMessage({ type: "success", text: data.message });
      refetchAdmins();
    },
    onError: (err: Error) => {
      setAdminActionMessage({ type: "error", text: err.message });
    },
  });

  // Reset form when switching to add mode
  const resetForm = () => {
    setEditingFactId(null);
    setTitle("");
    setSlug("");
    setCoverPhoto("");
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setRevisionYear(null);
    setOriginDecade(null);
    setTaughtUntilYear(null);
    setSearchTags([]);
    setSearchTagInput("");
    setFeatured(false);
    setBetaOnly(false);
    setIsTrending(false);
    setIsDebated(false);
    setIsPopular(false);
    setMythHeader("");
    setMythDetails("");
    setTruthHeader("");
    setTruthDetails("");
    setSources([{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
    setTimeline([]);
    setNuances([]);
    setRelatedMythIds([]);
    setRelatedMythSearch("");
    setSubmitMessage("");
    setEditingSubmissionId(null);
    setSubmissionUsername("");
    setSubmissionActionMsg(null);
  };

  // Reset blog form
  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle("");
    setBlogSlug("");
    setBlogSummary("");
    setBlogCoverImage("");
    setBlogCoverCaption("");
    setBlogCategory("");
    setBlogTags([]);
    setBlogContent(null);
    setBlogContentHtml("");
    setBlogAuthorType("Staff");
    setBlogAuthorName("Retrocodex Admin");
    setBlogAuthorLink("");
    setBlogHeroFeatured(false);
    setBlogPublished(false);
    setBlogRelatedIds([]);
    setBlogSubmitMessage("");
  };

  // Load blog post for editing
  const loadBlogForEdit = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogTitle(post.title);
    setBlogSlug(post.slug);
    setBlogSummary(post.summary);
    setBlogCoverImage(post.coverImage || "");
    setBlogCoverCaption(post.coverImageCaption || "");
    setBlogCategory(post.category);
    setBlogTags(post.tags || []);
    setBlogContent(post.content);
    setBlogContentHtml(post.contentHtml || "");
    setBlogAuthorType((post.authorType as "Staff" | "Guest") || "Staff");
    setBlogAuthorName(post.authorName || "Retrocodex Admin");
    setBlogAuthorLink(post.authorLink || "");
    setBlogHeroFeatured(post.heroFeatured || false);
    setBlogPublished(post.published || false);
    setBlogRelatedIds(post.relatedManualIds || []);
    setCurrentView("add-blog");
  };

  const handleBlogTitleChange = (value: string) => {
    setBlogTitle(value);
    if (!editingBlogId) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setBlogSlug(generatedSlug);
    }
  };

  const handleBlogTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setBlogTags([...blogTags, tag]);
    } else {
      setBlogTags(blogTags.filter(t => t !== tag));
    }
  };

  // Blog cover image upload
  const uploadBlogCoverImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      setBlogCoverImage(data.url);
    } catch (error) {
      console.error("Failed to upload cover image:", error);
      alert("Failed to upload cover image");
    }
  };

  // Blog content image upload (for Tiptap)
  const uploadBlogContentImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        'Authorization': 'Basic ' + btoa('admin:' + password)
      },
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed");
    
    const data = await response.json();
    return data.url;
  };

  // Blog form submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBlogSubmitting(true);
    setBlogSubmitMessage("");

    const blogData = {
      title: blogTitle,
      slug: blogSlug,
      summary: blogSummary,
      coverImage: blogCoverImage || undefined,
      coverImageCaption: blogCoverCaption || undefined,
      category: blogCategory,
      tags: blogTags,
      content: blogContent,
      contentHtml: blogContentHtml,
      authorName: blogAuthorType === "Staff" ? "Retrocodex Admin" : blogAuthorName,
      authorType: blogAuthorType,
      authorLink: blogAuthorType === "Guest" ? blogAuthorLink : undefined,
      authorPhoto: blogAuthorType === "Staff" ? adminAvatar : undefined,
      heroFeatured: blogHeroFeatured,
      published: blogPublished,
      relatedManualIds: blogRelatedIds.filter(id => id),
    };

    try {
      const url = editingBlogId ? `/api/blog-posts/${editingBlogId}` : "/api/blog-posts";
      const method = editingBlogId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingBlogId ? 'update' : 'create'} blog post`);
      }

      setBlogSubmitMessage(`Blog post ${editingBlogId ? 'updated' : 'created'} successfully!`);
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      
      if (!editingBlogId) {
        resetBlogForm();
      }
    } catch (error) {
      setBlogSubmitMessage(error instanceof Error ? error.message : `Failed to ${editingBlogId ? 'update' : 'create'} blog post`);
    } finally {
      setIsBlogSubmitting(false);
    }
  };

  // Delete blog post
  const deleteBlogPost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        }
      });

      if (!response.ok) throw new Error("Failed to delete blog post");
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
    } catch (error) {
      console.error("Failed to delete blog post:", error);
      alert("Failed to delete blog post");
    }
  };

  // Load fact data for editing
  const loadFactForEdit = (fact: Fact) => {
    setEditingFactId(fact.id);
    setTitle(fact.title);
    setSlug(fact.slug);
    setCoverPhoto(fact.coverPhoto || "");
    setSelectedCategories(fact.categories);
    setSelectedSubcategories(fact.subcategories || []);
    setSelectedTags(fact.factFilters || []);
    setRevisionYear(fact.revisionYear ?? null);
    setOriginDecade(fact.originDecade ?? null);
    setTaughtUntilYear(fact.taughtUntilYear ?? null);
    setSearchTags(fact.searchTags || []);
    setSearchTagInput("");
    setFeatured(fact.featured || false);
    setBetaOnly(fact.betaOnly || false);
    setIsTrending(fact.isTrending || false);
    setIsDebated(fact.isDebated || false);
    setIsPopular(fact.isPopular || false);
    setMythHeader(fact.mythHeader ?? "");
    setMythDetails(fact.mythDetails ?? "");
    setTruthHeader(fact.truthHeader ?? "");
    setTruthDetails(fact.truthDetails ?? "");
    setSources(fact.sources && fact.sources.length > 0 
      ? fact.sources 
      : [{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
    setTimeline(fact.timeline || []);
    setNuances(fact.nuances || []);
    setRelatedMythIds(fact.relatedMythIds || []);
    setCurrentView("add-fact");
  };

  const loadSubmissionForEdit = (sub: FactSubmission) => {
    const d = sub.draftData || {};
    resetForm();
    setEditingSubmissionId(sub.id);
    setSubmissionUsername(sub.username);
    setMythHeader(d.mythHeader ?? sub.mythHeader ?? "");
    setMythDetails(d.mythDetails ?? sub.mythDetails ?? "");
    setTruthHeader(d.truthHeader ?? sub.truthHeader ?? "");
    setTruthDetails(d.truthDetails ?? sub.truthDetails ?? "");
    setTitle(d.title ?? "");
    setSlug(d.slug ?? "");
    setCoverPhoto(d.coverPhoto ?? "");
    setSelectedCategories(d.categories ?? []);
    setSelectedSubcategories(d.subcategories ?? []);
    setSelectedTags(d.tags ?? []);
    setSearchTags(d.searchTags ?? []);
    setFeatured(d.featured ?? false);
    setBetaOnly(d.betaOnly ?? false);
    setIsTrending(d.isTrending ?? false);
    setIsDebated(d.isDebated ?? false);
    setIsPopular(d.isPopular ?? false);
    setRevisionYear(d.revisionYear ?? null);
    setOriginDecade(d.originDecade ?? null);
    setTaughtUntilYear(d.taughtUntilYear ?? null);
    const rawSources = d.sources ?? sub.sources;
    setSources(rawSources && rawSources.length > 0
      ? rawSources.map((s: any) => {
          if (typeof s === "string") {
            return { id: generateId(), citation: s, link: s, logoUrl: undefined };
          }
          return { id: s.id || generateId(), citation: s.citation || "", link: s.link || "", logoUrl: s.logoUrl };
        })
      : [{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
    setTimeline(d.timeline ?? []);
    setNuances(d.nuances ?? []);
    setRelatedMythIds(d.relatedMythIds ?? []);
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = async () => {
    if (!editingSubmissionId) return;
    setIsDraftSaving(true);
    setSubmissionActionMsg(null);
    try {
      const draftData = {
        title, slug, coverPhoto,
        categories: selectedCategories, subcategories: selectedSubcategories,
        tags: selectedTags, searchTags, featured, betaOnly,
        isTrending, isDebated, isPopular,
        revisionYear, originDecade, taughtUntilYear,
        mythHeader, mythDetails, truthHeader, truthDetails,
        sources, timeline, nuances, relatedMythIds,
      };
      await patchSubmissionMutation.mutateAsync({ id: editingSubmissionId, draftData });
      setSubmissionActionMsg({ type: "success", text: "Draft saved." });
    } catch (err) {
      setSubmissionActionMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save draft." });
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handlePublishSubmission = async () => {
    if (!editingSubmissionId) return;
    setIsPublishing(true);
    setSubmissionActionMsg(null);
    try {
      const validSources = sources.filter(s => s.citation && s.link).map(s => ({ id: s.id, citation: s.citation, link: s.link, logoUrl: s.logoUrl || undefined }));
      const factData = {
        title, slug, coverPhoto: coverPhoto || undefined,
        categories: selectedCategories,
        subcategories: selectedCategories.includes("Other") ? selectedSubcategories : [],
        factFilters: selectedTags, searchTags, featured, betaOnly,
        isTrending, isDebated, isPopular,
        revisionYear: selectedTags.includes("Official Revision") ? revisionYear : null,
        originDecade: originDecade || null, taughtUntilYear: taughtUntilYear || null,
        mythHeader, mythDetails, truthHeader, truthDetails,
        sources: validSources, timeline: timeline.filter(t => t.year && t.description),
        nuances: nuances.filter(n => n.type && n.body), relatedMythIds: relatedMythIds.filter(id => id),
      };
      const factRes = await fetch("/api/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': 'Basic ' + btoa('admin:' + password) },
        body: JSON.stringify(factData),
      });
      if (!factRes.ok) {
        const err = await factRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create fact");
      }
      await patchSubmissionMutation.mutateAsync({ id: editingSubmissionId, status: "published" });
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      setShowPublishModal(false);
      resetForm();
      setCurrentView("submissions");
    } catch (err) {
      setSubmissionActionMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to publish." });
      setShowPublishModal(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRejectSubmission = async () => {
    if (!rejectingSubmissionId || !rejectNote.trim()) return;
    try {
      await patchSubmissionMutation.mutateAsync({ id: rejectingSubmissionId, status: "rejected", adminNote: rejectNote.trim() });
      setShowRejectModal(false);
      setRejectingSubmissionId(null);
      setRejectNote("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject submission.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setAuthError("Please enter a password");
      return;
    }
    setAuthError("");
    setIsAuthenticated(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Only auto-generate slug for new facts
    if (!editingFactId) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
      if (category === "Other") {
        setSelectedSubcategories([]);
      }
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  // Cover photo upload
  const uploadCoverPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      setCoverPhoto(data.url);
    } catch (error) {
      console.error("Failed to upload cover photo:", error);
      alert("Failed to upload cover photo");
    }
  };

  // Source handlers
  const addSource = () => {
    setSources([...sources, { id: generateId(), citation: "", link: "", logoUrl: undefined }]);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: keyof Source, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const uploadSourceLogo = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      const updated = [...sources];
      updated[index] = { ...updated[index], logoUrl: data.url };
      setSources(updated);
    } catch (error) {
      console.error("Failed to upload logo:", error);
      alert("Failed to upload logo");
    }
  };

  // Timeline handlers
  const addTimelineEntry = () => {
    setTimeline([...timeline, { 
      id: generateId(), 
      year: "", 
      description: "", 
      imageUrl: undefined,
      imageCaption: undefined,
      order: timeline.length 
    }]);
  };

  const removeTimelineEntry = (index: number) => {
    const updated = timeline.filter((_, i) => i !== index).map((entry, i) => ({ ...entry, order: i }));
    setTimeline(updated);
  };

  const updateTimelineEntry = (index: number, field: keyof TimelineEntry, value: string | number) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };

  const uploadTimelineImage = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      const updated = [...timeline];
      updated[index] = { ...updated[index], imageUrl: data.url };
      setTimeline(updated);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    }
  };

  // Drag and drop handlers for timeline
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTimeline = [...timeline];
    const draggedItem = newTimeline[draggedIndex];
    newTimeline.splice(draggedIndex, 1);
    newTimeline.splice(index, 0, draggedItem);
    
    // Update order numbers
    const reordered = newTimeline.map((entry, i) => ({ ...entry, order: i }));
    setTimeline(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Nuance handlers
  const addNuance = () => {
    setNuances([...nuances, { id: generateId(), type: "", body: "" }]);
  };

  const removeNuance = (index: number) => {
    setNuances(nuances.filter((_, i) => i !== index));
  };

  const updateNuance = (index: number, field: keyof Nuance, value: string) => {
    const updated = [...nuances];
    updated[index] = { ...updated[index], [field]: value };
    setNuances(updated);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // Validate sources - filter out empty ones, preserve logoUrl
    const validSources = sources
      .filter(s => s.citation && s.link)
      .map(s => ({
        id: s.id,
        citation: s.citation,
        link: s.link,
        logoUrl: s.logoUrl || undefined
      }));
    
    // Validate timeline entries
    const validTimeline = timeline.filter(t => t.year && t.description);
    
    // Validate nuances
    const validNuances = nuances.filter(n => n.type && n.body);

    const factData = {
      title,
      slug,
      coverPhoto: coverPhoto || undefined,
      categories: selectedCategories,
      subcategories: selectedCategories.includes("Other") ? selectedSubcategories : [],
      factFilters: selectedTags,
      searchTags,
      featured,
      betaOnly,
      isTrending,
      isDebated,
      isPopular,
      mythHeader,
      mythDetails,
      truthHeader,
      truthDetails,
      sources: validSources,
      timeline: validTimeline,
      nuances: validNuances,
      relatedMythIds: relatedMythIds.filter(id => id),
      revisionYear: selectedTags.includes("Official Revision") ? revisionYear : null,
      originDecade: originDecade || null,
      taughtUntilYear: taughtUntilYear || null,
    };

    try {
      const url = editingFactId ? `/api/facts/${editingFactId}` : "/api/facts";
      const method = editingFactId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:' + password)
        },
        body: JSON.stringify(factData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingFactId ? 'update' : 'create'} fact`);
      }

      setSubmitMessage(`Fact ${editingFactId ? 'updated' : 'created'} successfully!`);
      
      // Invalidate facts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/facts"] });
      
      // Reset form and redirect to View Facts page
      resetForm();
      setCurrentView('view-facts');
      setFactsPage(1);
      window.scrollTo(0, 0);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : `Failed to ${editingFactId ? 'update' : 'create'} fact`);
    } finally {
      setIsSubmitting(false);
    }
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

  // Get the category color for fact cards (matching frontend colors)
  const getCategoryColor = (categories: string[]): string => {
    if (categories.includes("History")) return "#F5D547";
    if (categories.includes("Life Sciences")) return "#6FCF97";
    if (categories.includes("Health & Fitness")) return "#F2994A";
    if (categories.includes("Social Sciences")) return "#9B51E0";
    if (categories.includes("Gender & Sexuality")) return "#FC5AA8";
    if (categories.includes("Everyday Life")) return "#2A9BEC";
    return "#2C2C2C";
  };

  // Filter and Pagination for View Facts
  const filteredFacts = facts ? facts.filter((fact) => {
    if (!factsSearch.trim()) return true;
    const searchLower = factsSearch.toLowerCase().trim();
    const searchableText = [
      fact.title,
      fact.mythHeader,
      fact.mythDetails,
      fact.truthHeader,
      fact.truthDetails,
      ...fact.categories,
      ...(fact.factFilters || []),
      ...(fact.searchTags || [])
    ].filter(Boolean).join(" ").toLowerCase();
    return searchableText.includes(searchLower);
  }) : [];
  const totalPages = Math.ceil(filteredFacts.length / FACTS_PER_PAGE);
  const paginatedFacts = filteredFacts.slice((factsPage - 1) * FACTS_PER_PAGE, factsPage * FACTS_PER_PAGE);

  // Pagination for View Blog Posts
  const totalBlogPages = blogPosts ? Math.ceil(blogPosts.length / BLOGS_PER_PAGE) : 0;
  const paginatedBlogPosts = blogPosts ? blogPosts.slice((blogPage - 1) * BLOGS_PER_PAGE, blogPage * BLOGS_PER_PAGE) : [];

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-login-container">
          <div className="login-card">
            <div className="login-icon">
              <Lock size={48} />
            </div>
            <h1 className="login-title">Admin Access</h1>
            <p className="login-subtitle">Enter password to access admin panel</p>
            
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

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logoIcon} alt="Retrocodex" className="sidebar-logo" />
          <span className="sidebar-subtitle">Admin Panel</span>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${currentView === 'add-fact' ? 'active' : ''}`}
            onClick={() => { resetForm(); setCurrentView('add-fact'); }}
            data-testid="nav-add-fact"
          >
            <Plus size={18} />
            <span>Add New Fact</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${currentView === 'view-facts' ? 'active' : ''}`}
            onClick={() => setCurrentView('view-facts')}
            data-testid="nav-view-facts"
          >
            <Eye size={18} />
            <span>View Facts</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${currentView === 'add-blog' ? 'active' : ''}`}
            onClick={() => { resetBlogForm(); setCurrentView('add-blog'); }}
            data-testid="nav-add-blog"
          >
            <FileText size={18} />
            <span>Add New Blog Post</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${currentView === 'view-blog' ? 'active' : ''}`}
            onClick={() => setCurrentView('view-blog')}
            data-testid="nav-view-blog"
          >
            <Newspaper size={18} />
            <span>View Blog Posts</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${currentView === 'emails' ? 'active' : ''}`}
            onClick={() => setCurrentView('emails')}
            data-testid="nav-emails"
          >
            <Mail size={18} />
            <span>View Email Signups</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentView === 'manage-admins' ? 'active' : ''}`}
            onClick={() => { setAdminActionMessage(null); setCurrentView('manage-admins'); }}
            data-testid="nav-manage-admins"
          >
            <Shield size={18} />
            <span>Manage Admins</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentView === 'submissions' ? 'active' : ''}`}
            onClick={() => setCurrentView('submissions')}
            data-testid="nav-submissions"
          >
            <Inbox size={18} />
            <span>Submissions</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentView === 'add-external' ? 'active' : ''}`}
            onClick={() => { resetExtForm(); setCurrentView('add-external'); }}
            data-testid="nav-add-external"
          >
            <Link size={18} />
            <span>Add External Article</span>
          </button>

          <button
            className={`sidebar-nav-item ${currentView === 'view-external' ? 'active' : ''}`}
            onClick={() => setCurrentView('view-external')}
            data-testid="nav-view-external"
          >
            <Newspaper size={18} />
            <span>External Articles</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {(currentView === 'add-fact' || (currentView === 'submissions' && !!editingSubmissionId)) && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h1 className="content-title">
                  {editingSubmissionId ? 'Edit User Fact Submission' : editingFactId ? 'Edit Fact' : 'Add New Fact'}
                </h1>
                {editingSubmissionId && (
                  <p className="content-subtitle">Submitted by <strong>{submissionUsername}</strong></p>
                )}
                {!editingSubmissionId && editingFactId && (
                  <p className="content-subtitle">Editing: {title || 'Untitled'}</p>
                )}
              </div>
              {editingSubmissionId ? (
                <button
                  onClick={() => { resetForm(); setCurrentView('submissions'); }}
                  className="cancel-edit-button"
                  data-testid="button-back-to-submissions"
                >
                  Back to Submissions
                </button>
              ) : editingFactId ? (
                <button 
                  onClick={resetForm}
                  className="cancel-edit-button"
                  data-testid="button-cancel-edit"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
            
            <form onSubmit={handleSubmit} className="fact-form">
              {/* Section 1: Basic Info */}
              <section className="form-section">
                <h2 className="section-title">Section 1 — Basic Info</h2>
                
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <p className="form-hint">This will be the page's title when it appears on search results</p>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="form-input"
                    placeholder="Enter fact title..."
                    data-testid="input-title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Homepage Tabs</label>
                  <p className="form-hint">Select which homepage tabs this fact should appear in</p>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isTrending}
                        onChange={(e) => setIsTrending(e.target.checked)}
                        className="checkbox-input"
                        data-testid="checkbox-current-events"
                      />
                      <span>Current Events</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isDebated}
                        onChange={(e) => setIsDebated(e.target.checked)}
                        className="checkbox-input"
                        data-testid="checkbox-debated"
                      />
                      <span>Debated</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="checkbox-input"
                        data-testid="checkbox-popular"
                      />
                      <span>Popular</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <p className="form-hint">URL-friendly version (auto-generated from title)</p>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="form-input"
                    placeholder="url-friendly-slug"
                    data-testid="input-slug"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Photo</label>
                  <p className="form-hint">This image will display on the fact card</p>
                  <div className="upload-area">
                    {coverPhoto ? (
                      <div className="uploaded-preview">
                        <img src={coverPhoto} alt="Cover photo" className="cover-photo-preview" />
                        <button
                          type="button"
                          onClick={() => setCoverPhoto("")}
                          className="remove-upload-button"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadCoverPhoto(file);
                        }}
                        className="file-input"
                        data-testid="input-cover-photo"
                      />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Categories</label>
                  <div className="checkbox-group">
                    {CATEGORIES.map((category) => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          className="checkbox-input"
                          data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedCategories.includes("Other") && (
                  <div className="form-group">
                    <label className="form-label">Subcategories</label>
                    <div className="checkbox-group">
                      {OTHER_SUBCATEGORIES.map((sub) => (
                        <label key={sub} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedSubcategories.includes(sub)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubcategories([...selectedSubcategories, sub]);
                              } else {
                                setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
                              }
                            }}
                            className="checkbox-input"
                            data-testid={`checkbox-subcategory-${sub.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <span>{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Fact Filters</label>
                  <div className="checkbox-group">
                    {AVAILABLE_FACT_FILTERS.map((filter) => (
                      <label key={filter} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(filter)}
                          onChange={(e) => handleTagChange(filter, e.target.checked)}
                          className="checkbox-input"
                          data-testid={`checkbox-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <span>{filter}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedTags.includes("Official Revision") && (
                  <div className="form-group">
                    <label className="form-label">Revision Year</label>
                    <p className="form-hint">The year this fact was officially revised or corrected.</p>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1985"
                      min={1800}
                      max={2100}
                      value={revisionYear ?? ""}
                      onChange={(e) => setRevisionYear(e.target.value ? parseInt(e.target.value, 10) : null)}
                      data-testid="input-revision-year"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Origin Decade</label>
                  <p className="form-hint">The decade when this belief/myth originated or became widely taught.</p>
                  <select
                    className="form-input"
                    value={originDecade ?? ""}
                    onChange={(e) => setOriginDecade(e.target.value || null)}
                    data-testid="select-origin-decade"
                  >
                    <option value="">— None —</option>
                    {DECADES.map((decade) => (
                      <option key={decade} value={decade}>{decade}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Taught Until Decade</label>
                  <p className="form-hint">The last decade when this was still widely taught or believed.</p>
                  <select
                    className="form-input"
                    value={taughtUntilYear ?? ""}
                    onChange={(e) => setTaughtUntilYear(e.target.value || null)}
                    data-testid="select-taught-until-decade"
                  >
                    <option value="">— None —</option>
                    {DECADES.map((decade) => (
                      <option key={decade} value={decade}>{decade}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Search Tags</label>
                  <p className="form-hint">Press Enter to add tags. These help users find facts via search.</p>
                  <div className="search-tags-container">
                    <div className="search-tags-chips">
                      {searchTags.map((tag) => (
                        <span 
                          key={tag} 
                          className="search-tag-chip"
                          onClick={() => setSearchTags(searchTags.filter(t => t !== tag))}
                          data-testid={`search-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {tag}
                          <X size={14} />
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={searchTagInput}
                      onChange={(e) => setSearchTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmedTag = searchTagInput.trim();
                          if (trimmedTag && !searchTags.includes(trimmedTag)) {
                            setSearchTags([...searchTags, trimmedTag]);
                            setSearchTagInput("");
                          }
                        }
                      }}
                      className="form-input search-tag-input"
                      placeholder="Type a tag and press Enter..."
                      data-testid="input-search-tags"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label featured-toggle">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="checkbox-input"
                      data-testid="checkbox-featured"
                    />
                    <span>Feature this fact on the Featured Facts homepage tab</span>
                  </label>
                </div>
              </section>

              {/* Section 2: Myth & Truth */}
              <section className="form-section">
                <h2 className="section-title">Section 2 — Myth & Truth</h2>
                
                <div className="form-group">
                  <label className="checkbox-label beta-toggle">
                    <input
                      type="checkbox"
                      checked={betaOnly}
                      onChange={(e) => setBetaOnly(e.target.checked)}
                      className="checkbox-input"
                      data-testid="checkbox-beta-only"
                    />
                    <span>Only add fact card for beta</span>
                  </label>
                  <p className="form-hint" style={{ marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                    The fact card will appear on category pages, but clicking it will show "individual fact pages are still under development"
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Myth Header
                    <span className="char-count">{mythHeader.length}/275</span>
                  </label>
                  <p className="form-hint">Quotation marks will be added automatically</p>
                  <input
                    type="text"
                    value={mythHeader}
                    onChange={(e) => setMythHeader(e.target.value.slice(0, 275))}
                    className="form-input"
                    placeholder="Enter the myth..."
                    data-testid="input-myth-header"
                    maxLength={275}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Myth Details</label>
                  <textarea
                    value={mythDetails}
                    onChange={(e) => setMythDetails(e.target.value)}
                    className="form-textarea"
                    placeholder="Explain the myth in detail..."
                    data-testid="input-myth-details"
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Truth Header
                    <span className="char-count">{truthHeader.length}/275</span>
                  </label>
                  <input
                    type="text"
                    value={truthHeader}
                    onChange={(e) => setTruthHeader(e.target.value.slice(0, 275))}
                    className="form-input"
                    placeholder="Enter the truth..."
                    data-testid="input-truth-header"
                    maxLength={275}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Truth Details</label>
                  <textarea
                    value={truthDetails}
                    onChange={(e) => setTruthDetails(e.target.value)}
                    className="form-textarea"
                    placeholder="Explain the truth in detail..."
                    data-testid="input-truth-details"
                    rows={4}
                    required
                  />
                </div>
              </section>

              {/* Section 3: Sources */}
              <section className="form-section">
                <h2 className="section-title">Section 3 — Sources</h2>
                
                {sources.map((source, index) => (
                  <div key={source.id} className="repeatable-item">
                    <div className="repeatable-header">
                      <span className="repeatable-number">Source {index + 1}</span>
                      {sources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSource(index)}
                          className="remove-button"
                          data-testid={`button-remove-source-${index}`}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Citation</label>
                      <input
                        type="text"
                        value={source.citation}
                        onChange={(e) => updateSource(index, 'citation', e.target.value)}
                        className="form-input"
                        placeholder="Enter citation text..."
                        data-testid={`input-source-citation-${index}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Link</label>
                      <input
                        type="url"
                        value={source.link}
                        onChange={(e) => updateSource(index, 'link', e.target.value)}
                        className="form-input"
                        placeholder="https://..."
                        data-testid={`input-source-link-${index}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Logo (Optional)</label>
                      <p className="form-hint">If uploaded, this logo will display as the source. Max height: 4rem</p>
                      <div className="upload-area">
                        {source.logoUrl ? (
                          <div className="uploaded-preview">
                            <img src={source.logoUrl} alt="Source logo" className="source-logo-preview" />
                            <button
                              type="button"
                              onClick={() => updateSource(index, 'logoUrl', '')}
                              className="remove-upload-button"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadSourceLogo(index, file);
                            }}
                            className="file-input"
                            data-testid={`input-source-logo-${index}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSource}
                  className="add-another-button"
                  data-testid="button-add-source"
                >
                  <Plus size={18} />
                  Add Another Source
                </button>
              </section>

              {/* Section 4: Timeline */}
              <section className="form-section">
                <h2 className="section-title">Section 4 — Timeline</h2>
                <p className="section-hint">Drag entries to reorder them</p>
                
                {timeline.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`repeatable-item draggable ${draggedIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="repeatable-header">
                      <div className="drag-handle">
                        <GripVertical size={18} />
                      </div>
                      <span className="repeatable-number">Timeline Entry {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTimelineEntry(index)}
                        className="remove-button"
                        data-testid={`button-remove-timeline-${index}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input
                        type="text"
                        value={entry.year}
                        onChange={(e) => updateTimelineEntry(index, 'year', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 1950"
                        data-testid={`input-timeline-year-${index}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        value={entry.description}
                        onChange={(e) => updateTimelineEntry(index, 'description', e.target.value)}
                        className="form-textarea"
                        placeholder="Describe what happened..."
                        data-testid={`input-timeline-description-${index}`}
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image (Optional)</label>
                      <div className="upload-area">
                        {entry.imageUrl ? (
                          <div className="uploaded-preview">
                            <img src={entry.imageUrl} alt="Timeline image" className="timeline-image-preview" />
                            <button
                              type="button"
                              onClick={() => updateTimelineEntry(index, 'imageUrl', '')}
                              className="remove-upload-button"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadTimelineImage(index, file);
                            }}
                            className="file-input"
                            data-testid={`input-timeline-image-${index}`}
                          />
                        )}
                      </div>
                    </div>

                    {entry.imageUrl && (
                      <div className="form-group">
                        <label className="form-label">Image Caption (Optional)</label>
                        <input
                          type="text"
                          value={entry.imageCaption || ''}
                          onChange={(e) => updateTimelineEntry(index, 'imageCaption', e.target.value)}
                          className="form-input"
                          placeholder="Caption for the image..."
                          data-testid={`input-timeline-caption-${index}`}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTimelineEntry}
                  className="add-another-button"
                  data-testid="button-add-timeline"
                >
                  <Plus size={18} />
                  Add Timeline Entry
                </button>
              </section>

              {/* Section 5: Nuances & Controversies */}
              <section className="form-section">
                <h2 className="section-title">Section 5 — Nuances & Controversies</h2>
                
                {nuances.map((nuance, index) => (
                  <div key={nuance.id} className="repeatable-item">
                    <div className="repeatable-header">
                      <span className="repeatable-number">Nuance {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeNuance(index)}
                        className="remove-button"
                        data-testid={`button-remove-nuance-${index}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <input
                        type="text"
                        value={nuance.type}
                        onChange={(e) => updateNuance(index, 'type', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Semantics, Marketing, Cultural..."
                        data-testid={`input-nuance-type-${index}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Body</label>
                      <textarea
                        value={nuance.body}
                        onChange={(e) => updateNuance(index, 'body', e.target.value)}
                        className="form-textarea"
                        placeholder="Explain the nuance or controversy..."
                        data-testid={`input-nuance-body-${index}`}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNuance}
                  className="add-another-button"
                  data-testid="button-add-nuance"
                >
                  <Plus size={18} />
                  Add Nuance
                </button>
              </section>

              {/* Section 6: Related Myths */}
              <section className="form-section">
                <h2 className="section-title">Section 6 — Related Myths (Optional)</h2>
                <p className="section-description" style={{ color: '#878787', marginBottom: '1rem', fontSize: '14px' }}>
                  Select up to 4 related myths to display on this fact's page. Leave empty to hide the section.
                </p>
                
                <div className="form-group">
                  <label className="form-label">Search Myths</label>
                  <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      value={relatedMythSearch}
                      onChange={(e) => setRelatedMythSearch(e.target.value)}
                      placeholder="Search by title or myth header..."
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      data-testid="input-related-myth-search"
                    />
                    {relatedMythSearch && (
                      <button
                        type="button"
                        onClick={() => setRelatedMythSearch("")}
                        className="search-clear-button"
                        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                        data-testid="button-clear-related-search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {relatedMythSearch && facts && (
                  <div className="related-myth-results" style={{ marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #E5E5E5', borderRadius: '8px' }}>
                    {facts
                      .filter(f => 
                        f.id !== editingFactId &&
                        !relatedMythIds.includes(f.id) &&
                        (f.title.toLowerCase().includes(relatedMythSearch.toLowerCase()) ||
                         f.mythHeader.toLowerCase().includes(relatedMythSearch.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            if (relatedMythIds.length < 4) {
                              setRelatedMythIds([...relatedMythIds, f.id]);
                              setRelatedMythSearch("");
                            }
                          }}
                          disabled={relatedMythIds.length >= 4}
                          className="related-myth-result-item"
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 15px',
                            textAlign: 'left',
                            border: 'none',
                            borderBottom: '1px solid #E5E5E5',
                            background: 'white',
                            cursor: relatedMythIds.length >= 4 ? 'not-allowed' : 'pointer',
                            opacity: relatedMythIds.length >= 4 ? 0.5 : 1
                          }}
                          data-testid={`button-add-related-myth-${f.id}`}
                        >
                          <div style={{ fontWeight: 500, color: '#2C2C2C', fontSize: '14px' }}>{f.title}</div>
                          <div style={{ fontSize: '12px', color: '#878787', marginTop: '2px' }}>{f.mythHeader.substring(0, 80)}...</div>
                        </button>
                      ))
                    }
                    {facts.filter(f => 
                      f.id !== editingFactId &&
                      !relatedMythIds.includes(f.id) &&
                      (f.title.toLowerCase().includes(relatedMythSearch.toLowerCase()) ||
                       f.mythHeader.toLowerCase().includes(relatedMythSearch.toLowerCase()))
                    ).length === 0 && (
                      <div style={{ padding: '15px', color: '#878787', textAlign: 'center' }}>
                        No matching myths found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Myths */}
                {relatedMythIds.length > 0 && (
                  <div className="selected-related-myths" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Selected ({relatedMythIds.length}/4)</label>
                    {relatedMythIds.map((mythId, index) => {
                      const myth = facts?.find(f => f.id === mythId);
                      return (
                        <div 
                          key={mythId} 
                          className="selected-myth-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 15px',
                            background: '#F5F5F5',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500, color: '#2C2C2C', fontSize: '14px' }}>
                              {myth?.title || 'Unknown Myth'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#878787', marginTop: '2px' }}>
                              {myth?.mythHeader?.substring(0, 60) || ''}...
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRelatedMythIds(relatedMythIds.filter(id => id !== mythId))}
                            className="remove-button"
                            data-testid={`button-remove-related-myth-${index}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Submit */}
              <div className="form-actions">
                {editingSubmissionId ? (
                  <>
                    {submissionActionMsg && (
                      <div className={`submit-message ${submissionActionMsg.type === 'success' ? 'success' : 'error'}`}>
                        {submissionActionMsg.text}
                      </div>
                    )}
                    <div className="submission-action-row">
                      <button
                        type="button"
                        className="submit-button submission-draft-btn"
                        onClick={handleSaveDraft}
                        disabled={isDraftSaving || isPublishing}
                        data-testid="button-save-draft"
                      >
                        {isDraftSaving ? "Saving..." : "Save Draft"}
                      </button>
                      <button
                        type="button"
                        className="submit-button"
                        onClick={() => setShowPublishModal(true)}
                        disabled={isDraftSaving || isPublishing}
                        data-testid="button-save-and-publish"
                      >
                        Save and Publish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {submitMessage && (
                      <div className={`submit-message ${submitMessage.includes('success') ? 'success' : 'error'}`}>
                        {submitMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isSubmitting}
                      data-testid="button-submit-fact"
                    >
                      {isSubmitting ? (editingFactId ? "Saving..." : "Creating...") : (editingFactId ? "Save Changes" : "Create Fact")}
                    </button>
                  </>
                )}
              </div>

              {/* Publish confirmation modal */}
              {showPublishModal && (
                <div className="modal-overlay" onClick={() => { handleSaveDraft(); setShowPublishModal(false); }}>
                  <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                    <div className="modal-header">
                      <h3 className="modal-title">Ready to publish?</h3>
                      <button className="modal-close" onClick={() => { handleSaveDraft(); setShowPublishModal(false); }} data-testid="button-close-publish-modal"><X size={18} /></button>
                    </div>
                    <p style={{ margin: "1rem 0", color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                      This will create a live published fact from the current form data and mark the submission as published.
                    </p>
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Notify the submitter:</p>
                      <button
                        type="button"
                        className="export-button"
                        style={{ background: "#1565c0", fontSize: "0.85rem" }}
                        onClick={() => {}}
                        data-testid="button-notify-submitter"
                      >
                        <Mail size={14} />
                        Send notification email to submitter
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                      <button className="cancel-edit-button" onClick={() => { handleSaveDraft(); setShowPublishModal(false); }} data-testid="button-cancel-publish">Cancel (Save Draft)</button>
                      <button
                        className="submit-button"
                        onClick={handlePublishSubmission}
                        disabled={isPublishing}
                        data-testid="button-confirm-publish"
                      >
                        {isPublishing ? "Publishing..." : "Yes, Publish"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {currentView === 'view-facts' && (
          <div className="admin-content admin-content-wide">
            <header className="content-header">
              <div>
                <h1 className="content-title">View Facts</h1>
                <p className="content-subtitle" data-testid="text-facts-count">
                  {factsSearch ? `${filteredFacts.length} of ${facts?.length || 0}` : (facts?.length || 0)} {facts?.length === 1 ? 'fact' : 'facts'}{factsSearch ? ' matching' : ' total'}
                </p>
              </div>
            </header>
            
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={factsSearch}
                  onChange={(e) => {
                    setFactsSearch(e.target.value);
                    setFactsPage(1);
                  }}
                  placeholder="Search facts by text, category, or tags..."
                  className="search-input"
                  data-testid="input-facts-search"
                />
                {factsSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setFactsSearch("");
                      setFactsPage(1);
                    }}
                    className="search-clear-button"
                    data-testid="button-clear-search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {factsLoading ? (
              <div className="loading-message" data-testid="text-loading">Loading facts...</div>
            ) : factsError ? (
              <div className="error-container">
                <div className="error-message" data-testid="text-error">
                  {factsError instanceof Error ? factsError.message : "Failed to load facts"}
                </div>
              </div>
            ) : paginatedFacts.length > 0 ? (
              <>
                <div className="facts-grid" data-testid="facts-grid">
                  {paginatedFacts.map((fact) => (
                    <div 
                      key={fact.id} 
                      className="admin-fact-card"
                      onClick={() => loadFactForEdit(fact)}
                      data-testid={`card-fact-${fact.id}`}
                    >
                      <div className="admin-fact-card-image">
                        {fact.coverPhoto ? (
                          <img src={fact.coverPhoto} alt={fact.title} />
                        ) : (
                          <div className="admin-fact-card-placeholder">
                            <FileText size={32} />
                          </div>
                        )}
                        <div className="admin-fact-card-overlay">
                          <Edit2 size={20} />
                          <span>Edit Fact</span>
                        </div>
                      </div>
                      <div className="admin-fact-card-content">
                        <div className="admin-fact-card-category" style={{ backgroundColor: getCategoryColor(fact.categories) }}>
                          {fact.categories[0] || 'Uncategorized'}
                        </div>
                        <div className="admin-fact-card-section">
                          <div className="admin-fact-card-label myth-label">
                            <X size={14} className="admin-fact-icon myth-icon" />
                            <span>MYTH</span>
                          </div>
                          <p className="admin-fact-card-myth">"{fact.mythHeader}"</p>
                          {fact.mythDetails && (
                            <p className="admin-fact-card-details">{fact.mythDetails}</p>
                          )}
                        </div>
                        <div className="admin-fact-card-section">
                          <div className="admin-fact-card-label truth-label">
                            <Check size={14} className="admin-fact-icon truth-icon" />
                            <span>TRUTH</span>
                          </div>
                          <p className="admin-fact-card-truth">{fact.truthHeader}</p>
                          {fact.truthDetails && (
                            <p className="admin-fact-card-details">{fact.truthDetails}</p>
                          )}
                        </div>
                        <div className="admin-fact-card-meta">
                          {fact.betaOnly && (
                            <span className="beta-badge">Beta Only</span>
                          )}
                          {fact.featured && (
                            <span className="featured-badge">Featured</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setFactsPage(p => Math.max(1, p - 1))}
                      disabled={factsPage === 1}
                      className="pagination-button"
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {factsPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setFactsPage(p => Math.min(totalPages, p + 1))}
                      disabled={factsPage === totalPages}
                      className="pagination-button"
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p data-testid="text-empty">
                  {factsSearch 
                    ? `No facts found matching "${factsSearch}". Try a different search term.`
                    : 'No facts created yet. Click "Add New Fact" to create one.'}
                </p>
              </div>
            )}
          </div>
        )}

        {currentView === 'add-blog' && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h1 className="content-title">{editingBlogId ? 'Edit Blog Post' : 'Add New Blog Post'}</h1>
                {editingBlogId && (
                  <p className="content-subtitle">Editing: {blogTitle || 'Untitled'}</p>
                )}
              </div>
              {editingBlogId && (
                <button 
                  onClick={resetBlogForm}
                  className="cancel-edit-button"
                  data-testid="button-cancel-blog-edit"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleBlogSubmit} className="fact-form">
              <section className="form-section">
                <h2 className="section-title">Section 1 — Basic Info</h2>
                
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => handleBlogTitleChange(e.target.value)}
                    className="form-input"
                    placeholder="Enter blog post title..."
                    data-testid="input-blog-title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <p className="form-hint">URL-friendly version (auto-generated from title)</p>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="form-input"
                    placeholder="url-friendly-slug"
                    data-testid="input-blog-slug"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Summary</label>
                  <p className="form-hint">Brief description shown on article cards</p>
                  <textarea
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                    className="form-textarea"
                    placeholder="Enter a brief summary..."
                    data-testid="input-blog-summary"
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <p className="form-hint">This image will display on the article card and hero</p>
                  <div className="upload-area">
                    {blogCoverImage ? (
                      <div className="uploaded-preview">
                        <img src={blogCoverImage} alt="Cover" className="cover-photo-preview" />
                        <button
                          type="button"
                          onClick={() => setBlogCoverImage("")}
                          className="remove-upload-button"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadBlogCoverImage(file);
                        }}
                        className="file-input"
                        data-testid="input-blog-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image Caption</label>
                  <input
                    type="text"
                    value={blogCoverCaption}
                    onChange={(e) => setBlogCoverCaption(e.target.value)}
                    className="form-input"
                    placeholder="Photo credit or description..."
                    data-testid="input-blog-cover-caption"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="form-select"
                    data-testid="select-blog-category"
                    required
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="checkbox-group">
                    {BLOG_TAGS.map((tag) => (
                      <label key={tag} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={blogTags.includes(tag)}
                          onChange={(e) => handleBlogTagChange(tag, e.target.checked)}
                          className="checkbox-input"
                          data-testid={`checkbox-blog-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h2 className="section-title">Section 2 — Author</h2>
                
                <div className="form-group">
                  <label className="form-label">Author Type</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="authorType"
                        value="Staff"
                        checked={blogAuthorType === "Staff"}
                        onChange={() => {
                          setBlogAuthorType("Staff");
                          setBlogAuthorName("Retrocodex Admin");
                        }}
                        className="radio-input"
                        data-testid="radio-author-staff"
                      />
                      <span>Retrocodex Admin (Staff)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="authorType"
                        value="Guest"
                        checked={blogAuthorType === "Guest"}
                        onChange={() => {
                          setBlogAuthorType("Guest");
                          setBlogAuthorName("");
                        }}
                        className="radio-input"
                        data-testid="radio-author-guest"
                      />
                      <span>Guest Author</span>
                    </label>
                  </div>
                </div>

                {blogAuthorType === "Staff" && (
                  <div className="author-preview">
                    <img src={adminAvatar} alt="Retrocodex Admin" className="author-avatar" />
                    <span className="author-name">Retrocodex Admin</span>
                  </div>
                )}

                {blogAuthorType === "Guest" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Guest Author Name</label>
                      <input
                        type="text"
                        value={blogAuthorName}
                        onChange={(e) => setBlogAuthorName(e.target.value)}
                        className="form-input"
                        placeholder="Enter guest author's name..."
                        data-testid="input-guest-author-name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn URL (optional)</label>
                      <input
                        type="url"
                        value={blogAuthorLink}
                        onChange={(e) => setBlogAuthorLink(e.target.value)}
                        className="form-input"
                        placeholder="https://linkedin.com/in/..."
                        data-testid="input-guest-author-linkedin"
                      />
                    </div>
                  </>
                )}
              </section>

              <section className="form-section">
                <h2 className="section-title">Section 3 — Content</h2>
                <p className="form-hint">Use the toolbar to format text, add headings (H3), insert links, and add images with captions.</p>
                
                <div className="form-group">
                  <TiptapEditor
                    content={blogContent}
                    onChange={(content, html) => {
                      setBlogContent(content);
                      setBlogContentHtml(html);
                    }}
                    onImageUpload={uploadBlogContentImage}
                  />
                </div>
              </section>

              <section className="form-section">
                <h2 className="section-title">Section 4 — Publishing Options</h2>
                
                <div className="form-group">
                  <label className="checkbox-label toggle-checkbox">
                    <input
                      type="checkbox"
                      checked={blogHeroFeatured}
                      onChange={(e) => setBlogHeroFeatured(e.target.checked)}
                      className="checkbox-input"
                      data-testid="checkbox-hero-featured"
                    />
                    <span>Feature on Hero Section</span>
                  </label>
                  <p className="form-hint">This article will appear in the homepage hero carousel</p>
                </div>

                <div className="form-group">
                  <label className="checkbox-label toggle-checkbox">
                    <input
                      type="checkbox"
                      checked={blogPublished}
                      onChange={(e) => setBlogPublished(e.target.checked)}
                      className="checkbox-input"
                      data-testid="checkbox-published"
                    />
                    <span>Published</span>
                  </label>
                  <p className="form-hint">Only published articles will be visible to the public</p>
                </div>

                {blogPosts && blogPosts.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Related Articles (optional, select up to 4)</label>
                    <p className="form-hint">Manually select related articles to display, or leave empty for auto-selection</p>
                    <div className="related-articles-selector">
                      {blogPosts
                        .filter(post => post.id !== editingBlogId && post.published)
                        .map(post => (
                          <label key={post.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={blogRelatedIds.includes(post.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (blogRelatedIds.length < 4) {
                                    setBlogRelatedIds([...blogRelatedIds, post.id]);
                                  }
                                } else {
                                  setBlogRelatedIds(blogRelatedIds.filter(id => id !== post.id));
                                }
                              }}
                              disabled={!blogRelatedIds.includes(post.id) && blogRelatedIds.length >= 4}
                              className="checkbox-input"
                            />
                            <span>{post.title}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </section>

              <div className="form-actions">
                {blogSubmitMessage && (
                  <div className={`submit-message ${blogSubmitMessage.includes('success') ? 'success' : 'error'}`}>
                    {blogSubmitMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isBlogSubmitting}
                  data-testid="button-submit-blog"
                >
                  {isBlogSubmitting ? (editingBlogId ? "Saving..." : "Creating...") : (editingBlogId ? "Save Changes" : "Create Blog Post")}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentView === 'view-blog' && (
          <div className="admin-content admin-content-wide">
            <header className="content-header">
              <div>
                <h1 className="content-title">View Blog Posts</h1>
                <p className="content-subtitle" data-testid="text-blog-count">
                  {blogPosts?.length || 0} {blogPosts?.length === 1 ? 'post' : 'posts'} total
                </p>
              </div>
            </header>

            {blogPostsLoading ? (
              <div className="loading-message" data-testid="text-loading">Loading blog posts...</div>
            ) : blogPostsError ? (
              <div className="error-container">
                <div className="error-message" data-testid="text-error">
                  {blogPostsError instanceof Error ? blogPostsError.message : "Failed to load blog posts"}
                </div>
              </div>
            ) : paginatedBlogPosts.length > 0 ? (
              <>
                <div className="blog-posts-grid" data-testid="blog-posts-grid">
                  {paginatedBlogPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="admin-blog-card"
                      onClick={() => loadBlogForEdit(post)}
                      data-testid={`card-blog-${post.id}`}
                    >
                      <div className="admin-blog-card-image">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} />
                        ) : (
                          <div className="admin-blog-card-placeholder">
                            <FileText size={32} />
                          </div>
                        )}
                        <div className="admin-blog-card-overlay">
                          <Edit2 size={20} />
                          <span>Edit Post</span>
                        </div>
                      </div>
                      <div className="admin-blog-card-content">
                        <div className="admin-blog-card-meta">
                          <span className="admin-blog-card-category">{post.category}</span>
                          {post.heroFeatured && <span className="featured-badge">Hero Featured</span>}
                          {!post.published && <span className="draft-badge">Draft</span>}
                        </div>
                        <h3 className="admin-blog-card-title">{post.title}</h3>
                        <p className="admin-blog-card-summary">{post.summary}</p>
                        <div className="admin-blog-card-author">
                          <span>By {post.authorName}</span>
                          {post.publishedAt && (
                            <span className="admin-blog-card-date">
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalBlogPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setBlogPage(p => Math.max(1, p - 1))}
                      disabled={blogPage === 1}
                      className="pagination-button"
                      data-testid="button-prev-blog-page"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {blogPage} of {totalBlogPages}
                    </span>
                    <button
                      onClick={() => setBlogPage(p => Math.min(totalBlogPages, p + 1))}
                      disabled={blogPage === totalBlogPages}
                      className="pagination-button"
                      data-testid="button-next-blog-page"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p data-testid="text-empty">No blog posts created yet. Click "Add New Blog Post" to create one.</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'emails' && (
          <div className="admin-content">
            <header className="content-header">
              <div>
                <h1 className="content-title">Email Subscriptions</h1>
                <p className="content-subtitle" data-testid="text-count">
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

            {emailsLoading ? (
              <div className="loading-message" data-testid="text-loading">Loading...</div>
            ) : emailsError ? (
              <div className="error-container">
                <div className="error-message" data-testid="text-error">
                  {emailsError instanceof Error ? emailsError.message : "Failed to load emails"}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
        {currentView === 'manage-admins' && (
          <div className="admin-content">
            <header className="content-header">
              <div>
                <h1 className="content-title">Manage Admins</h1>
                <p className="content-subtitle">
                  {adminsLoading ? "Loading..." : `${adminsList?.length ?? 0} admin${adminsList?.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </header>

            <div style={{ maxWidth: 520 }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Grant Admin Access</h2>
              {adminActionMessage && (
                <div
                  className={adminActionMessage.type === "success" ? "success-message" : "error-message"}
                  style={{ marginBottom: "0.75rem" }}
                  data-testid="text-admin-action-message"
                >
                  {adminActionMessage.text}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={adminUsername}
                  onChange={(e) => { setAdminUsername(e.target.value); setAdminActionMessage(null); }}
                  data-testid="input-admin-username"
                  style={{ flex: 1 }}
                />
                <button
                  className="export-button"
                  disabled={!adminUsername.trim() || grantAdminMutation.isPending}
                  onClick={() => grantAdminMutation.mutate(adminUsername.trim())}
                  data-testid="button-grant-admin"
                >
                  <Shield size={16} />
                  {grantAdminMutation.isPending ? "Granting..." : "Grant Admin"}
                </button>
              </div>

              <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Current Admins</h2>
              {adminsLoading ? (
                <div className="loading-message" data-testid="text-admins-loading">Loading...</div>
              ) : adminsList && adminsList.length > 0 ? (
                <table className="emails-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Admin Since</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminsList.map((admin) => (
                      <tr key={admin.username} data-testid={`row-admin-${admin.username}`}>
                        <td className="email-cell" data-testid={`text-admin-username-${admin.username}`}>
                          {admin.username}
                        </td>
                        <td className="date-cell" data-testid={`text-admin-since-${admin.username}`}>
                          {new Date(admin.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => revokeAdminMutation.mutate(admin.username)}
                            disabled={revokeAdminMutation.isPending}
                            data-testid={`button-revoke-admin-${admin.username}`}
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p data-testid="text-admins-empty">No admins found.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {currentView === 'submissions' && !editingSubmissionId && (
          <div className="admin-content admin-content-wide">
            <div className="content-header">
              <div>
                <h1 className="content-title">Fact Submissions</h1>
                <p className="content-subtitle">Review and moderate user-submitted facts</p>
              </div>
              <button
                className="cancel-edit-button"
                onClick={() => refetchSubmissions()}
                data-testid="button-refresh-submissions"
              >
                Refresh
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
              {(["pending", "saved", "rejected"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSubmissionsTab(tab)}
                  data-testid={`tab-submissions-${tab}`}
                  style={{
                    padding: "0.5rem 1rem",
                    fontWeight: submissionsTab === tab ? 700 : 400,
                    background: "none",
                    border: "none",
                    borderBottom: submissionsTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    color: submissionsTab === tab ? "var(--primary)" : "var(--muted-foreground)",
                    fontSize: "0.9rem",
                  }}
                >
                  {tab}{" "}
                  <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    ({(submissions || []).filter(s => s.status === tab).length})
                  </span>
                </button>
              ))}
            </div>

            {submissionsLoading ? (
              <div className="loading-message" data-testid="text-submissions-loading">Loading submissions...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {(submissions || []).filter(s => s.status === submissionsTab).length === 0 ? (
                  <div className="empty-state" data-testid="text-submissions-empty">
                    <p>No {submissionsTab} submissions.</p>
                  </div>
                ) : (
                  (submissions || [])
                    .filter(s => s.status === submissionsTab)
                    .map(sub => (
                      <div
                        key={sub.id}
                        data-testid={`card-submission-${sub.id}`}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "1.25rem",
                          background: "var(--card)",
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }} data-testid={`text-sub-username-${sub.id}`}>
                              {sub.username}
                            </span>
                            {sub.email && (
                              <span style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                                ({sub.email})
                              </span>
                            )}
                            {sub.submissionBanned && (
                              <span style={{ marginLeft: "0.5rem", color: "#e55", fontSize: "0.75rem", fontWeight: 700 }}>
                                SHADOWBANNED
                              </span>
                            )}
                          </div>
                          <span style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
                            {new Date(sub.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div style={{ background: "#ffffff", borderRadius: "10px", margin: "10px 0", padding: "10px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                              <X size={15} style={{ color: "#e53e3e", flexShrink: 0, marginTop: "3px" }} />
                              <p style={{ margin: 0, fontWeight: 500, fontSize: "0.9rem" }} data-testid={`text-sub-myth-${sub.id}`}>{sub.mythHeader}</p>
                            </div>
                          </div>
                          <div style={{ background: "#ffffff", borderRadius: "10px", margin: "10px 0", padding: "10px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                              <Check size={15} style={{ color: "#38a169", flexShrink: 0, marginTop: "3px" }} />
                              <p style={{ margin: 0, fontWeight: 500, fontSize: "0.9rem" }} data-testid={`text-sub-truth-${sub.id}`}>{sub.truthHeader}</p>
                            </div>
                          </div>
                        </div>

                        {/* Sources */}
                        {sub.sources && sub.sources.length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Sources</span>
                            <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                              {sub.sources.map((src: any, idx: number) => {
                                const url = typeof src === "string" ? src : src.link || src.citation || "";
                                return url ? (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: "0.8rem", color: "var(--primary)", wordBreak: "break-all" }}
                                    data-testid={`source-admin-${sub.id}-${idx}`}
                                  >
                                    {url}
                                  </a>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Admin note (for rejected) */}
                        {sub.status === "rejected" && sub.adminNote && (
                          <div style={{ marginBottom: "0.75rem", padding: "0.6rem 0.75rem", background: "rgba(200,50,50,0.08)", borderRadius: "6px", border: "1px solid rgba(200,50,50,0.2)" }}>
                            <span style={{ fontSize: "0.75rem", color: "#b44", fontWeight: 600 }}>Admin Note: </span>
                            <span style={{ fontSize: "0.85rem" }}>{sub.adminNote}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {sub.status === "pending" && (
                            <button
                              className="export-button submission-btn-save"
                              onClick={() => patchSubmissionMutation.mutate({ id: sub.id, status: "saved" })}
                              disabled={patchSubmissionMutation.isPending}
                              data-testid={`button-save-review-${sub.id}`}
                            >
                              <ClipboardCheck size={15} />
                              Save for Review
                            </button>
                          )}

                          {sub.status === "saved" && (
                            <button
                              className="export-button submission-btn-save"
                              onClick={() => loadSubmissionForEdit(sub)}
                              data-testid={`button-edit-submission-${sub.id}`}
                            >
                              <Edit2 size={15} />
                              Review &amp; Publish
                            </button>
                          )}
                          {sub.status === "rejected" && (
                            <button
                              className="export-button submission-btn-save"
                              onClick={() => patchSubmissionMutation.mutate({ id: sub.id, status: "pending", adminNote: "" })}
                              disabled={patchSubmissionMutation.isPending}
                              data-testid={`button-restore-submission-${sub.id}`}
                            >
                              <SearchCheck size={15} />
                              Restore to Pending
                            </button>
                          )}

                          {sub.status !== "rejected" && (
                            <button
                              className="export-button submission-btn-reject"
                              onClick={() => { setRejectingSubmissionId(sub.id); setRejectNote(""); setShowRejectModal(true); }}
                              data-testid={`button-reject-submission-${sub.id}`}
                            >
                              <X size={15} />
                              Reject
                            </button>
                          )}

                          <button
                            className={sub.submissionBanned ? "export-button submission-btn-save" : "export-button submission-btn-shadowban"}
                            onClick={() => toggleBanMutation.mutate(sub.userId)}
                            disabled={toggleBanMutation.isPending}
                            data-testid={`button-toggle-ban-${sub.id}`}
                            title={sub.submissionBanned ? "Remove shadowban" : "Shadowban user"}
                          >
                            <Ban size={15} />
                            {sub.submissionBanned ? "Remove Ban" : "Shadowban"}
                          </button>
                        </div>

                      </div>
                    ))
                )}
              </div>
            )}

            {/* Reject modal */}
            {showRejectModal && (
              <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                  <div className="modal-header">
                    <h3 className="modal-title">Reject Submission</h3>
                    <button className="modal-close" onClick={() => setShowRejectModal(false)} data-testid="button-close-reject-modal"><X size={18} /></button>
                  </div>
                  <p style={{ margin: "0.75rem 0 0.5rem", color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
                    Provide a note explaining why this submission is being rejected. This note will be visible to the user.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Rejection reason..."
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    data-testid="input-reject-note"
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box", marginBottom: "1rem" }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <button className="cancel-edit-button" onClick={() => setShowRejectModal(false)} data-testid="button-cancel-reject">Cancel</button>
                    <button
                      className="delete-button"
                      onClick={handleRejectSubmission}
                      disabled={!rejectNote.trim() || patchSubmissionMutation.isPending}
                      data-testid="button-confirm-reject"
                    >
                      {patchSubmissionMutation.isPending ? "Rejecting..." : "Reject Submission"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ADD EXTERNAL ARTICLE ==================== */}
        {currentView === 'add-external' && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h1 className="content-title">{editingExtId ? "Edit External Article" : "Add External Article"}</h1>
                <p className="content-subtitle">Curate third-party articles from NYT, Vox, Substack, and more.</p>
              </div>
              {editingExtId && (
                <button className="cancel-edit-button" onClick={resetExtForm} data-testid="button-cancel-ext-edit">
                  Cancel Edit
                </button>
              )}
            </div>

            <form className="fact-form" onSubmit={e => { e.preventDefault(); handleExtSubmit(true); }}>
              {/* URL + Auto-parse */}
              <div className="form-section">
                <h2 className="section-title">Article URL</h2>
                <div className="form-group">
                  <label className="form-label">External URL</label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://www.nytimes.com/..."
                      value={extUrl}
                      onChange={e => setExtUrl(e.target.value)}
                      required
                      data-testid="input-ext-url"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="login-button"
                      style={{ padding: "0.6rem 1.25rem", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 130 }}
                      onClick={handleParseUrl}
                      disabled={extIsParsing || !extUrl}
                      data-testid="button-parse-url"
                    >
                      {extIsParsing ? <Loader2 size={14} className="spinning" /> : <Search size={14} />}
                      {extIsParsing ? "Fetching..." : "Auto-fill"}
                    </button>
                  </div>
                  {extParseError && <p className="login-error" style={{ marginTop: "0.5rem" }}>{extParseError}</p>}
                  <p className="form-hint">Paste the article URL, then click Auto-fill to populate metadata from the page.</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="form-section">
                <h2 className="section-title">Article Metadata</h2>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Article title"
                    value={extTitle}
                    onChange={e => setExtTitle(e.target.value)}
                    required
                    data-testid="input-ext-title"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={extIsPaywalled}
                      onChange={e => setExtIsPaywalled(e.target.checked)}
                      data-testid="checkbox-ext-paywalled"
                    />
                    Paywalled article
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Summary</label>
                  <textarea
                    className="form-textarea"
                    placeholder="A brief description of what this article covers..."
                    value={extSummary}
                    onChange={e => setExtSummary(e.target.value)}
                    rows={3}
                    data-testid="textarea-ext-summary"
                    style={{ minHeight: 80 }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-group-large">
                    <label className="form-label">Publication Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. The New York Times"
                      value={extPublication}
                      onChange={e => setExtPublication(e.target.value)}
                      required
                      data-testid="input-ext-publication"
                    />
                  </div>
                  <div className="form-group form-group-large">
                    <label className="form-label">Author Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Jane Smith"
                      value={extAuthor}
                      onChange={e => setExtAuthor(e.target.value)}
                      data-testid="input-ext-author"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group form-group-large">
                    <label className="form-label">Published Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={extPublishedAt}
                      onChange={e => setExtPublishedAt(e.target.value)}
                      data-testid="input-ext-published-at"
                    />
                  </div>
                  <div className="form-group form-group-large">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={extCategory}
                      onChange={e => setExtCategory(e.target.value)}
                      required
                      data-testid="select-ext-category"
                    >
                      <option value="">— Select category —</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://... (auto-filled from OG image)"
                    value={extCoverImage}
                    onChange={e => setExtCoverImage(e.target.value)}
                    data-testid="input-ext-cover-image"
                  />
                  <p className="form-hint">If the publication's image can't be used, upload a custom one below.</p>
                  <div className="upload-area" style={{ marginTop: "0.75rem" }}>
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input"
                      disabled={extCoverUploading}
                      data-testid="input-ext-cover-upload"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) uploadExtCoverPhoto(file);
                      }}
                    />
                    {extCoverUploading && (
                      <span style={{ fontSize: "0.85rem", color: "#878787", fontFamily: "'Public Sans', sans-serif", marginLeft: "0.5rem" }}>
                        Uploading...
                      </span>
                    )}
                  </div>
                  {extCoverImage && (
                    <div className="uploaded-preview" style={{ marginTop: "0.75rem" }}>
                      <img src={extCoverImage} alt="Cover preview" style={{ maxHeight: 120, maxWidth: 220, borderRadius: 6, objectFit: "cover", border: "1px solid #e5e5e5" }} />
                      <button
                        type="button"
                        className="remove-upload-button"
                        onClick={() => setExtCoverImage("")}
                        data-testid="button-remove-ext-cover"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="checkbox-group">
                    {BLOG_TAGS.map(tag => (
                      <label key={tag} className="checkbox-label">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={extTags.includes(tag)}
                          onChange={e => {
                            if (e.target.checked) setExtTags([...extTags, tag]);
                            else setExtTags(extTags.filter(t => t !== tag));
                          }}
                          data-testid={`checkbox-ext-tag-${tag}`}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="submission-action-row">
                  <button
                    type="button"
                    className="submit-button submission-draft-btn"
                    disabled={extSubmitting}
                    data-testid="button-ext-save-draft"
                    onClick={() => handleExtSubmit(false)}
                  >
                    {extSubmitting ? "Saving..." : "Save Draft"}
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={extSubmitting}
                    data-testid="button-ext-save-publish"
                  >
                    {extSubmitting ? "Saving..." : "Save & Publish"}
                  </button>
                  {extSubmitMsg && (
                    <span
                      data-testid="text-ext-submit-msg"
                      style={{
                        color: extSubmitMsg.toLowerCase().includes("published") ? "#22863a" : "#cc3333",
                        fontSize: "0.85rem",
                        fontFamily: "'Public Sans', sans-serif",
                        alignSelf: "center",
                      }}
                    >
                      {extSubmitMsg}
                    </span>
                  )}
              </div>
            </form>
          </div>
        )}

        {/* ==================== VIEW EXTERNAL ARTICLES ==================== */}
        {currentView === 'view-external' && (
          <div className="admin-content" style={{ maxWidth: 960 }}>
            <div className="content-header">
              <div>
                <h1 className="content-title">External Articles</h1>
                <p className="content-subtitle">{externalArticles?.length || 0} articles curated</p>
              </div>
              <button
                className="cancel-edit-button"
                onClick={() => refetchExternal()}
                data-testid="button-refresh-external"
              >
                Refresh
              </button>
            </div>

            {extLoading ? (
              <div className="loading-message">Loading...</div>
            ) : !externalArticles?.length ? (
              <div className="empty-state"><p>No external articles yet. Add one using the sidebar.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {externalArticles.map(article => (
                  <div
                    key={article.id}
                    data-testid={`card-ext-article-${article.id}`}
                    style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: "1.25rem", background: "white", display: "flex", gap: "1rem", alignItems: "flex-start" }}
                  >
                    {article.coverImage && (
                      <img src={article.coverImage} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#2C2C2C" }}>{article.title}</span>
                        {article.isPaywalled && <span style={{ fontSize: "0.75rem", background: "#f4e4b5", color: "#92680a", borderRadius: 4, padding: "2px 8px", fontFamily: "'Public Sans', sans-serif" }}>Paywalled</span>}
                        {!article.published && <span style={{ fontSize: "0.75rem", background: "#f0f0f0", color: "#878787", borderRadius: 4, padding: "2px 8px", fontFamily: "'Public Sans', sans-serif" }}>Draft</span>}
                        {article.published && <span style={{ fontSize: "0.75rem", background: "rgba(45,122,62,0.12)", color: "#2d7a3e", borderRadius: 4, padding: "2px 8px", fontFamily: "'Public Sans', sans-serif" }}>Published</span>}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#878787", fontFamily: "'Public Sans', sans-serif" }}>
                        {article.publicationName}{article.authorName ? ` · ${article.authorName}` : ""}{article.publishedAt ? ` · ${article.publishedAt}` : ""} · {article.category}
                      </div>
                      <a href={article.externalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#FF5353", fontFamily: "'Public Sans', sans-serif", wordBreak: "break-all" }}>
                        {article.externalUrl}
                      </a>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button
                        className="cancel-edit-button"
                        onClick={() => loadExtForEdit(article)}
                        data-testid={`button-edit-ext-${article.id}`}
                        style={{ fontSize: "0.8125rem", padding: "0.4rem 0.75rem" }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteExternalArticle(article.id)}
                        data-testid={`button-delete-ext-${article.id}`}
                        style={{ fontSize: "0.8125rem", padding: "0.4rem 0.75rem" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
