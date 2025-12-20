import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
import "./CategoryFilter.css";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function includesCaseInsensitive(arr: string[], value: string): boolean {
  return arr.some(item => item.toLowerCase() === value.toLowerCase());
}

const FILTER_OPTIONS = [
  "Context Matters",
  "Controversial",
  "Regionally Taught",
  "Partially True",
  "Official Revision",
  "Uncertain"
];

interface CategoryFilterProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function CategoryFilter({ selectedFilters, onFilterChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<string[]>(selectedFilters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setPendingFilters(selectedFilters);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedFilters]);

  const handleToggleOption = (option: string) => {
    setPendingFilters(prev => 
      includesCaseInsensitive(prev, option) 
        ? prev.filter(f => f.toLowerCase() !== option.toLowerCase())
        : [...prev, option]
    );
  };

  const handleApplyFilter = () => {
    onFilterChange(pendingFilters);
    setIsOpen(false);
  };

  const handleRemoveChip = (filter: string) => {
    const newFilters = selectedFilters.filter(f => f.toLowerCase() !== filter.toLowerCase());
    onFilterChange(newFilters);
    setPendingFilters(newFilters);
  };

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setPendingFilters(selectedFilters);
    }
  };

  return (
    <div className="category-filter" ref={dropdownRef} data-testid="category-filter">
      <div className="category-filter-label">
        <Filter size={16} className="category-filter-icon" />
        <span className="category-filter-text">Filter by:</span>
      </div>

      {selectedFilters.length === 0 ? (
        <div className="category-filter-dropdown-wrapper">
          <button 
            className="category-filter-dropdown-trigger"
            onClick={handleDropdownClick}
            data-testid="button-filter-dropdown"
          >
            <span>View all</span>
            <ChevronDown size={14} className={`category-filter-chevron ${isOpen ? 'open' : ''}`} />
          </button>

          {isOpen && (
            <div className="category-filter-dropdown" data-testid="filter-dropdown-menu">
              {FILTER_OPTIONS.map(option => (
                <label key={option} className="category-filter-option">
                  <input
                    type="checkbox"
                    checked={includesCaseInsensitive(pendingFilters, option)}
                    onChange={() => handleToggleOption(option)}
                    data-testid={`checkbox-filter-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <span className="category-filter-checkbox"></span>
                  <span className="category-filter-option-text">{option}</span>
                </label>
              ))}
              <button 
                className="category-filter-apply-button"
                onClick={handleApplyFilter}
                data-testid="button-apply-filter"
              >
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="category-filter-chips">
          {selectedFilters.map(filter => (
            <button
              key={filter}
              className="category-filter-chip"
              onClick={() => handleRemoveChip(filter)}
              data-testid={`chip-filter-${filter.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {toTitleCase(filter)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
