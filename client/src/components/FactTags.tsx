import { Link } from "wouter";
import "./FactTags.css";

interface FactTagsProps {
  tags: string[];
  clickable?: boolean;
}

export function FactTags({ tags, clickable = true }: FactTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const getTagSlug = (tag: string) => {
    return tag.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="fact-tags" data-testid="fact-tags">
      <h3 className="fact-tags-header">TAGS</h3>
      <div className="fact-tags-list">
        {tags.map((tag, index) => (
          clickable ? (
            <Link 
              key={index}
              href={`/tags/${getTagSlug(tag)}`}
              className="fact-tag-chip fact-tag-chip-clickable"
              data-testid={`fact-tag-${getTagSlug(tag)}`}
            >
              {tag.toLowerCase()}
            </Link>
          ) : (
            <span 
              key={index} 
              className="fact-tag-chip"
              data-testid={`fact-tag-${getTagSlug(tag)}`}
            >
              {tag.toLowerCase()}
            </span>
          )
        ))}
      </div>
    </div>
  );
}

export default FactTags;
