import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Download, Lock, Plus, FileText, Mail, X, GripVertical, Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, OTHER_SUBCATEGORIES, type Source, type TimelineEntry, type Nuance, type Fact } from "@shared/schema";
import "./AdminPage.css";
import logoIcon from "@assets/line_logo_white_background_1764717128944.png";

interface EmailSubscription {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

type AdminView = "add-fact" | "add-blog" | "emails" | "view-facts";

const AVAILABLE_TAGS = [
  "Popular",
  "Trending",
  "New Discovery",
  "Debunked",
  "Partially True",
  "Context Matters"
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
  
  // Edit mode state
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  
  // View Facts pagination
  const [factsPage, setFactsPage] = useState(1);
  const FACTS_PER_PAGE = 10;
  
  // Form state for Add New Fact
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [subcategory, setSubcategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [betaOnly, setBetaOnly] = useState(false);
  const [mythHeader, setMythHeader] = useState("");
  const [mythDetails, setMythDetails] = useState("");
  const [truthHeader, setTruthHeader] = useState("");
  const [truthDetails, setTruthDetails] = useState("");
  const [sources, setSources] = useState<Source[]>([{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [nuances, setNuances] = useState<Nuance[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Reset form when switching to add mode
  const resetForm = () => {
    setEditingFactId(null);
    setTitle("");
    setSlug("");
    setCoverPhoto("");
    setSelectedCategories([]);
    setSubcategory("");
    setSelectedTags([]);
    setFeatured(false);
    setBetaOnly(false);
    setMythHeader("");
    setMythDetails("");
    setTruthHeader("");
    setTruthDetails("");
    setSources([{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
    setTimeline([]);
    setNuances([]);
    setSubmitMessage("");
  };

  // Load fact data for editing
  const loadFactForEdit = (fact: Fact) => {
    setEditingFactId(fact.id);
    setTitle(fact.title);
    setSlug(fact.slug);
    setCoverPhoto(fact.coverPhoto || "");
    setSelectedCategories(fact.categories);
    setSubcategory(fact.subcategory || "");
    setSelectedTags(fact.tags || []);
    setFeatured(fact.featured || false);
    setBetaOnly(fact.betaOnly || false);
    setMythHeader(fact.mythHeader);
    setMythDetails(fact.mythDetails);
    setTruthHeader(fact.truthHeader);
    setTruthDetails(fact.truthDetails);
    setSources(fact.sources && fact.sources.length > 0 
      ? fact.sources 
      : [{ id: generateId(), citation: "", link: "", logoUrl: undefined }]);
    setTimeline(fact.timeline || []);
    setNuances(fact.nuances || []);
    setCurrentView("add-fact");
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
        setSubcategory("");
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
      header: "", 
      description: "", 
      imageUrl: undefined,
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

    // Validate sources - filter out empty ones
    const validSources = sources.filter(s => s.citation && s.link);
    
    // Validate timeline entries
    const validTimeline = timeline.filter(t => t.year && t.header && t.description);
    
    // Validate nuances
    const validNuances = nuances.filter(n => n.type && n.body);

    const factData = {
      title,
      slug,
      coverPhoto: coverPhoto || undefined,
      categories: selectedCategories,
      subcategory: selectedCategories.includes("Other") ? subcategory : undefined,
      tags: selectedTags,
      featured,
      betaOnly,
      mythHeader,
      mythDetails,
      truthHeader,
      truthDetails,
      sources: validSources,
      timeline: validTimeline,
      nuances: validNuances
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
      
      // Reset form for new entries
      if (!editingFactId) {
        resetForm();
      }
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

  // Get the category color for fact cards
  const getCategoryColor = (categories: string[]): string => {
    if (categories.includes("History")) return "#4A90A4";
    if (categories.includes("Life Sciences")) return "#7CB342";
    if (categories.includes("Health & Fitness")) return "#E91E63";
    if (categories.includes("Social Sciences")) return "#9C27B0";
    if (categories.includes("Gender & Sexuality")) return "#FF9800";
    if (categories.includes("Everyday Life")) return "#795548";
    return "#878787";
  };

  // Pagination for View Facts
  const totalPages = facts ? Math.ceil(facts.length / FACTS_PER_PAGE) : 0;
  const paginatedFacts = facts ? facts.slice((factsPage - 1) * FACTS_PER_PAGE, factsPage * FACTS_PER_PAGE) : [];

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
            onClick={() => setCurrentView('add-blog')}
            data-testid="nav-add-blog"
          >
            <FileText size={18} />
            <span>Add New Blog Post</span>
          </button>
          
          <button
            className={`sidebar-nav-item ${currentView === 'emails' ? 'active' : ''}`}
            onClick={() => setCurrentView('emails')}
            data-testid="nav-emails"
          >
            <Mail size={18} />
            <span>View Email Signups</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {currentView === 'add-fact' && (
          <div className="admin-content">
            <div className="content-header">
              <div>
                <h1 className="content-title">{editingFactId ? 'Edit Fact' : 'Add New Fact'}</h1>
                {editingFactId && (
                  <p className="content-subtitle">Editing: {title || 'Untitled'}</p>
                )}
              </div>
              {editingFactId && (
                <button 
                  onClick={resetForm}
                  className="cancel-edit-button"
                  data-testid="button-cancel-edit"
                >
                  Cancel Edit
                </button>
              )}
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
                    <label className="form-label">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="form-select"
                      data-testid="select-subcategory"
                      required
                    >
                      <option value="">Select a subcategory...</option>
                      {OTHER_SUBCATEGORIES.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="checkbox-group">
                    {AVAILABLE_TAGS.map((tag) => (
                      <label key={tag} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={(e) => handleTagChange(tag, e.target.checked)}
                          className="checkbox-input"
                          data-testid={`checkbox-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
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
                    
                    <div className="form-row">
                      <div className="form-group form-group-small">
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

                      <div className="form-group form-group-large">
                        <label className="form-label">Header</label>
                        <input
                          type="text"
                          value={entry.header}
                          onChange={(e) => updateTimelineEntry(index, 'header', e.target.value)}
                          className="form-input"
                          placeholder="What happened..."
                          data-testid={`input-timeline-header-${index}`}
                        />
                      </div>
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

              {/* Submit */}
              <div className="form-actions">
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
              </div>
            </form>
          </div>
        )}

        {currentView === 'view-facts' && (
          <div className="admin-content admin-content-wide">
            <header className="content-header">
              <div>
                <h1 className="content-title">View Facts</h1>
                <p className="content-subtitle" data-testid="text-facts-count">
                  {facts?.length || 0} {facts?.length === 1 ? 'fact' : 'facts'} total
                </p>
              </div>
            </header>

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
                        <h3 className="admin-fact-card-title">{fact.title}</h3>
                        <p className="admin-fact-card-myth">"{fact.mythHeader}"</p>
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
                <p data-testid="text-empty">No facts created yet. Click "Add New Fact" to create one.</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'add-blog' && (
          <div className="admin-content">
            <h1 className="content-title">Add New Blog Post</h1>
            <div className="placeholder-content">
              <FileText size={48} />
              <p>Blog post creation coming soon!</p>
            </div>
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
      </main>
    </div>
  );
}
