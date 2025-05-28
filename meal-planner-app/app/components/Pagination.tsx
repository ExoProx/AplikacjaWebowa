import React from 'react';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center py-2">
      <button
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {"<"}
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded mx-1 ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {">"}
      </button>
    </div>
  );
};

export default Pagination;