import { useState } from "react";
import { XCircle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { CATEGORIES } from "@shared/categories";
import { OTHER_SUBCATEGORIES } from "@shared/schema";
import "./SignInModal.css";
import "./TopicsModal.css";

type TagsByCategory = Record<string, Record<string, string[]>>;

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTags?: string[];
}

export function TopicsModal({ isOpen, onClose, initialTags = [] }: TopicsModalProps) {
  const { updateUser } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: tagsByCategory } = useQuery<TagsByCategory>({
    queryKey: ["/api/facts/tags-by-category"],
    enabled: isOpen,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      await updateUser({ favoriteTags: selectedTags });
      queryClient.invalidateQueries({ queryKey: ["/api/feed/for-you"] });
      onClose();
    } catch {
      setError("Failed to save topics. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 20) return prev;
      return [...prev, tag];
    });
  };

  const getVisibleTags = (): string[] => {
    if (!tagsByCategory) return [];
    const tagsSet = new Set<string>();
    for (const catName of selectedCategories) {
      const catKey = Object.keys(tagsByCategory).find(
        (k) => k.toLowerCase() === catName.toLowerCase()
      );
      if (catKey && tagsByCategory[catKey]) {
        const allTags = tagsByCategory[catKey]._all || [];
        allTags.forEach((t) => tagsSet.add(t));
      }
    }
    for (const sub of selectedSubcategories) {
      for (const catKey of Object.keys(tagsByCategory)) {
        if (tagsByCategory[catKey][sub]) {
          tagsByCategory[catKey][sub].forEach((t) => tagsSet.add(t));
        }
      }
    }
    return Array.from(tagsSet).sort();
  };

  const showOtherSubcategories = selectedCategories.some(
    (c) => c.toLowerCase() === "other"
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="signin-overlay" onClick={handleOverlayClick} data-testid="topics-modal-overlay">
      <div className="signin-modal topics-modal" data-testid="topics-modal">
        <button
          type="button"
          className="signin-close"
          onClick={onClose}
          data-testid="button-close-topics-modal"
        >
          <X size={20} />
        </button>

        <div className="signin-modal-content">
          <div className="signin-topic-selection">
            <h2 className="signin-confirmation-title" data-testid="text-topics-title">
              What are your favorite subjects?
            </h2>
            <p className="signin-topic-subtitle" data-testid="text-topics-subtitle">
              Selecting topics helps us personalize your feed.
            </p>

            <div className="signin-topic-section">
              <label className="signin-location-label">SELECT CATEGORIES</label>
              <div className="signin-topic-tiles" data-testid="topic-category-tiles">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.name);
                  return (
                    <button
                      key={category.name}
                      type="button"
                      className={`signin-topic-tile${isSelected ? " signin-topic-tile-selected" : ""}`}
                      style={{ backgroundColor: category.color }}
                      onClick={() => toggleCategory(category.name)}
                      data-testid={`button-topics-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Icon size={16} strokeWidth={2.5} className="signin-topic-tile-icon" />
                      <span className="signin-topic-tile-name">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {showOtherSubcategories && (
              <div className="signin-topic-section" data-testid="topics-subcategories">
                <div className="signin-subcategory-links">
                  {OTHER_SUBCATEGORIES.map((sub) => {
                    const isSelected = selectedSubcategories.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        className={`signin-subcategory-link${isSelected ? " signin-subcategory-link-selected" : ""}`}
                        onClick={() => toggleSubcategory(sub)}
                        data-testid={`button-topics-subcategory-${sub.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="signin-topic-section" data-testid="topics-tags-section">
              <div className="signin-topic-tags-header">
                <label className="signin-location-label">SELECT SUBTOPICS (MAX 20 TOTAL)</label>
                <span className="signin-tag-counter" data-testid="text-topics-tag-counter">
                  {selectedTags.length}/20
                </span>
              </div>
              <div className="signin-topic-tags-container" data-testid="topics-tags-list">
                {(selectedCategories.length > 0 || selectedSubcategories.length > 0) ? (
                  getVisibleTags().length > 0 ? (
                    <div className="signin-topic-tags">
                      {getVisibleTags().map((tag) => {
                        const isTagSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`signin-topic-tag-chip${isTagSelected ? " signin-topic-tag-chip-selected" : ""}`}
                            onClick={() => toggleTag(tag)}
                            data-testid={`button-topics-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <span>{tag.toLowerCase()}</span>
                            {isTagSelected && (
                              <XCircle size={16} className="signin-tag-deselect" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="signin-topic-tags-empty">
                      No tags found for the selected categories yet.
                    </span>
                  )
                ) : (
                  <span className="signin-topic-tags-placeholder">
                    Select categories to view topics
                  </span>
                )}
              </div>
            </div>

            {error && (
              <p className="signin-error-text" style={{ textAlign: "center" }} data-testid="text-topics-error">
                {error}
              </p>
            )}

            <button
              type="button"
              className="signin-submit-button"
              data-testid="button-save-topics"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
