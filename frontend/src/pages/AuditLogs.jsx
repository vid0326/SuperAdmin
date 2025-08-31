import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LOGS_PER_PAGE = 15;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true); 
      setError("");
      
      try {
        const params = new URLSearchParams();
        params.append('skip', (currentPage - 1) * LOGS_PER_PAGE);
        params.append('take', LOGS_PER_PAGE);
        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        const { data } = await api.get(`/superadmin/audit-logs?${params.toString()}`);
        
        setLogs(data.logs);
        setTotalCount(data.totalCount);
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load audit logs");
        setLogs([]); 
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceFetch = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(debounceFetch);
    
  }, [searchTerm, currentPage]);

  const totalPages = Math.ceil(totalCount / LOGS_PER_PAGE);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Audit Logs</h1>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, user, or target..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Display error above the table if it exists */}
      {error && <p className="p-4 text-center text-red-500">{error}</p>}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : logs.length > 0 ? logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.actor?.name || 'System'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 font-mono">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{log.targetType} (ID: {log.targetId})</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500 dark:text-gray-400">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm flex items-center bg-gray-200 dark:bg-gray-600 rounded-md disabled:opacity-50"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm flex items-center bg-gray-200 dark:bg-gray-600 rounded-md disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}