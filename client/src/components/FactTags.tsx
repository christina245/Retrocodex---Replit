import "./FactTags.css";

interface FactTagsProps {
  tags: string[];
}

export function FactTags({ tags }: FactTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="fact-tags" data-testid="fact-tags">
      <h3 className="fact-tags-header">TAGS</h3>
      <div className="fact-tags-list">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="fact-tag-chip"
            data-testid={`fact-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {tag.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

export default FactTags;
