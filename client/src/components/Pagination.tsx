import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  scrollTargetId?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, scrollTargetId }: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    
    if (scrollTargetId) {
      const element = document.getElementById(scrollTargetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pagination" data-testid="pagination">
      <button
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-arrow"
        data-testid="pagination-prev"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="pagination-info" data-testid="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-arrow"
        data-testid="pagination-next"
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
