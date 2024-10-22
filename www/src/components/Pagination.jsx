const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  maxVisiblePages = 5,
}) {
  const pageNumbers = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    pageNumbers.push(1);
    if (startPage > 2) pageNumbers.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <nav className="flex justify-center mb-10">
      <div className="flex gap-10 mt-4 max-sm:gap-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-black dark:text-white disabled:opacity-50">
          <ChevronLeft />
        </button>
        {pageNumbers.map((item, index) => (
          <div
            key={index}
            className="max-sm:invisible">
            {item === "..." ? (
              <span className="px-3 py-2 text-black dark:text-white text-xl">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(item)}
                className={`px-3 py-2 rounded-md text-black dark:text-white text-xl ${
                  currentPage === item && "bg-blue-500"
                }`}>
                {item}
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-black dark:text-white disabled:opacity-50">
          <ChevronRight />
        </button>
      </div>
    </nav>
  );
}
