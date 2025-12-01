import React, { useMemo, useState, useEffect } from "react";

/**
 * StudentsPanel with search + filter + client-side pagination
 *
 * Props:
 * - students: array of student objects
 * - onSelectStudent?: function(student)
 */
export default function StudentsPanel({ students = [], onSelectStudent }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all"); // all | name | email | aadhaar
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false); // placeholder for server-side flag
  const [debounced, setDebounced] = useState(query);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // compute filtered (search + flag)
  const filtered = useMemo(() => {
    if (!students || students.length === 0) return [];

    const q = debounced.toLowerCase();

    return students.filter((s) => {
      if (showOnlyFlagged && !s.flagged) return false;

      if (!q) return true;

      if (field === "all") {
        return (
          String(s.name || "").toLowerCase().includes(q) ||
          String(s.email || "").toLowerCase().includes(q) ||
          String(s.aadhaar || "").toLowerCase().includes(q)
        );
      }

      return String(s[field] || "").toLowerCase().includes(q);
    });
  }, [students, debounced, field, showOnlyFlagged]);

  // reset page whenever filter changes
  useEffect(() => {
    setPage(1);
  }, [debounced, field, showOnlyFlagged, pageSize]);

  // pagination calculations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);
  const pageItems = filtered.slice(startIndex, endIndex);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
    // scroll into view for UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full md:w-2/3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              field === "all"
                ? "Search name, email or aadhaar..."
                : `Search by ${field}...`
            }
            className="flex-1 p-2 border rounded"
          />

          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All fields</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="aadhaar">Aadhaar</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setField("all");
              setShowOnlyFlagged(false);
            }}
            className="px-3 py-2 bg-gray-100 rounded border"
            title="Reset filters"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyFlagged}
              onChange={(e) => setShowOnlyFlagged(e.target.checked)}
              className="h-4 w-4"
            />
            Show only flagged
          </label>

          <div className="text-sm text-gray-600">
            Results: <span className="font-medium">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Aadhaar</th>
              <th className="p-2 border">QR</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectStudent && onSelectStudent(s)}
              >
                <td className="p-2 border align-top">{s.id}</td>
                <td className="p-2 border align-top">{s.name}</td>
                <td className="p-2 border align-top">{s.email}</td>
                <td className="p-2 border align-top">{s.aadhaar}</td>
                <td className="p-2 border align-top">
                  {s.qr_code ? (
                    <img
                      src={s.qr_code}
                      alt={`qr-${s.id}`}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}

            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded border ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Prev
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => goToPage(Number(e.target.value || 1))}
              className="w-16 p-1 border rounded text-center"
            />
            <span className="text-sm text-gray-600">of {totalPages}</span>
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded border ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="p-1 border rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}