import Fuse from "fuse.js";
import { memo, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import Pagination from "./Pagination";

import { items } from "@/data/icons.json";
import index from "@/data/index.json";

const options = {
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  includeScore: true,
  keys: ["filename", "tags"],
};

const fuse = new Fuse(items, options, Fuse.parseIndex(index));

const CDN_URL = "https://cdn.jsdelivr.net/npm/cloud-icons@latest";

const resultsPerPage = 18;

export default function Search() {
  const urlParams = new URLSearchParams(window.location.search);

  const [query, setQuery] = useState(urlParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);

  const results = useMemo(
    () =>
      fuse
        .search(query)
        .filter((result) => result.score < 0.01)
        .map((result) => result.item),
    [query]
  );

  const indexOfLastPage = currentPage * resultsPerPage;
  const indexOfFirstPage = indexOfLastPage - resultsPerPage;
  const currentResults = results.slice(indexOfFirstPage, indexOfLastPage);

  return (
    <div className="max-w-screen-xl mx-auto pt-4">
      <Toaster position="bottom-center" />
      <label
        htmlFor="search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="flex items-center">
        <div className="relative shadow-lg w-10/12 mx-2 sm:w-11/12 lg:w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none dark:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path
                stroke="none"
                d="M0 0h24v24H0z"
                fill="none"></path>
              <circle
                cx={10}
                cy={10}
                r={7}></circle>
              <line
                x1={21}
                y1={21}
                x2={15}
                y2={15}></line>
            </svg>
          </div>
          <input
            type="text"
            id="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="block w-full p-4 pl-10 text-gray-900 dark:text-gray-100 dark:bg-[#2b2a33] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for icons..."
          />
        </div>
        <div className="text-2xl text-black dark:text-white lg:mr-5">
          <button
            className={query.length === 0 ? `invisible` : ""}
            aria-label="Share Button"
            onClick={() => {
              navigator.clipboard.writeText(
                window.location.href.split("?").at(0) + "?q=" + query
              );
              toast.success("Copied Query Link");
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                d="M19 13v10H1V5h10m3-4h9v9m-13 4L23 1z"
              />
            </svg>
          </button>
        </div>
      </div>
      <ResultList results={currentResults} />
      {results && results.length !== 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(results.length / resultsPerPage)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

const ResultList = memo(function ResultList({ results }) {
  const getCode = async (filename, ext) => {
    await fetch(`${CDN_URL}/${ext}/${filename}.${ext}`)
      .then((res) => res.ok && res)
      .then((readableStreamData) => readableStreamData.text())
      .then((result) => navigator.clipboard.writeText(result))
      .then(() => toast.success(`Copied ${filename} as ${ext.toUpperCase()}!`))
      .catch(() =>
        toast.error(`Unable to copy ${filename} as ${type.toUpperCase()}!`)
      );
  };

  return (
    <div className="grid grid-cols-2 p-4 md:grid-cols-3 lg:grid-cols-6">
      {results &&
        results.map(({ filename }) => {
          return (
            <div
              key={filename}
              className="flex flex-col items-center pb-10 group">
              <div className="relative">
                <img
                  alt={filename}
                  className="p-7"
                  loading="lazy"
                  width={125}
                  height={125}
                  src={`${CDN_URL}/svg/${filename}.svg`}
                />
                <button
                  className="invisible group-hover:visible transition ease-in-out delay-150 absolute top-0 left-0 w-full h-14 text-black bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 rounded-md"
                  onClick={async () => getCode(filename, "svg")}>
                  Copy SVG
                </button>
                <button
                  className="invisible group-hover:visible absolute top-1/2 left-0 w-full h-14 text-black bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 rounded-md"
                  onClick={async () => getCode(filename, "jsx")}>
                  Copy JSX
                </button>
              </div>
              <p className="text-sm text-center text-gray-800 dark:text-gray-100">
                {filename}
              </p>
            </div>
          );
        })}
    </div>
  );
});
