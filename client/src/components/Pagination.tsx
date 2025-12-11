import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  
  // Always show first page
  pages.push(1);
  
  // Show ellipsis if current page is far from start
  if (currentPage > 3) {
    pages.push("...");
  }
  
  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }
  
  // Show ellipsis if current page is far from end
  if (currentPage < totalPages - 2) {
    pages.push("...");
  }
  
  // Always show last page if more than 1 page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <div className="pagination" data-testid="pagination">
      {pages.map((page, index) => (
        typeof page === "number" ? (
          <button
            key={page}
            className={`pagination-link ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            data-testid={`pagination-page-${page}`}
          >
            {page}
          </button>
        ) : (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            {page}
          </span>
        )
      ))}
    </div>
  );
}
