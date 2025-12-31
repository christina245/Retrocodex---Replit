import { useState, useRef, useEffect } from "react";
import { List, ChevronDown } from "lucide-react";
import "./SortSelector.css";

export type SortOption = "recent" | "featured" | "commonly-taught" | "most-discussed" | "least-discussed";

const SORT_OPTIONS: { value: SortOption; label: string; enabled: boolean }[] = [
  { value: "recent", label: "Most recently added", enabled: true },
  { value: "featured", label: "Featured", enabled: false },
  { value: "commonly-taught", label: "Most commonly taught", enabled: false },
  { value: "most-discussed", label: "Most to least discussed", enabled: false },
  { value: "least-discussed", label: "Least to most discussed", enabled: false },
];

interface SortSelectorProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortSelector({ selectedSort, onSortChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option: typeof SORT_OPTIONS[0]) => {
    if (!option.enabled) {
      return;
    }
    onSortChange(option.value);
    setIsOpen(false);
  };

  const selectedLabel = SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label || "Most recently added";

  return (
    <div className="sort-selector" ref={dropdownRef} data-testid="sort-selector">
      <div className="sort-selector-label">
        <List size={16} className="sort-selector-icon" />
        <span className="sort-selector-text">Sort by:</span>
      </div>

      <div className="sort-selector-dropdown-wrapper">
        <button 
          className="sort-selector-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-sort-dropdown"
        >
          <span>{selectedLabel}</span>
          <ChevronDown size={14} className={`sort-selector-chevron ${isOpen ? 'open' : ''}`} />
        </button>

        {isOpen && (
          <div className="sort-selector-dropdown" data-testid="sort-dropdown-menu">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`sort-selector-option ${option.value === selectedSort ? 'selected' : ''} ${!option.enabled ? 'disabled' : ''}`}
                onClick={() => handleOptionClick(option)}
                data-testid={`button-sort-${option.value}`}
                {...(!option.enabled && { 'data-tooltip': 'Unavailable in beta' })}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
