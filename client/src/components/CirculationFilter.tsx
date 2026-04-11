import { Filter, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import "./CirculationFilter.css";

const CIRCULATION_OPTIONS = [
  {
    key: "still-circulating",
    label: "Still Circulating",
    tooltip:
      "These myths and outdated facts may still be commonly taught in 2026, even if they were disproven years ago.",
  },
  {
    key: "in-the-past",
    label: "Lessons of the Past",
    tooltip:
      "These facts have mostly been overturned and thus are unlikely to still be taught in 2026.",
  },
];

interface CirculationFilterProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function CirculationFilter({ selectedFilters, onFilterChange }: CirculationFilterProps) {
  const handleToggle = (key: string) => {
    const isSelected = selectedFilters.includes(key);
    if (isSelected) {
      onFilterChange(selectedFilters.filter((f) => f !== key));
    } else {
      onFilterChange([...selectedFilters, key]);
    }
  };

  return (
    <div className="circulation-filter" data-testid="circulation-filter">
      <div className="circulation-filter-label">
        <Filter size={16} className="circulation-filter-icon" />
        <span className="circulation-filter-text">Filter by:</span>
      </div>
      <div className="circulation-filter-options">
        {CIRCULATION_OPTIONS.map((option) => (
          <div key={option.key} className="circulation-filter-option-row">
            <label
              className="circulation-filter-option"
              data-testid={`label-filter-${option.key}`}
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(option.key)}
                onChange={() => handleToggle(option.key)}
                data-testid={`checkbox-filter-${option.key}`}
              />
              <span className="circulation-filter-checkbox"></span>
              <span className="circulation-filter-option-text">{option.label}</span>
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="circulation-filter-info"
                  data-testid={`info-filter-${option.key}`}
                >
                  <Info size={13} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="circulation-filter-tooltip-content">
                <p>{option.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
