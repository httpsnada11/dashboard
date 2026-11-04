import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export const RecentActivity = ({
  activities = [],
  searchQuery = '',
  onSelectTransaction
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredActivities = activities.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.network.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'ALL' ||
      item.type.toUpperCase() === selectedFilter ||
      (selectedFilter === 'CONFIRMING' && item.status.includes('Confirming'));

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    if (status === 'Credited' || status === 'Completed') {
      return 'text-[#00C076] font-semibold';
    }
    if (status.includes('Confirming')) {
      return 'text-[#3B82F6] font-semibold';
    }
    if (status.includes('Awaiting')) {
      return 'text-[#D97706] font-semibold';
    }
    if (status.includes('Exception')) {
      return 'text-[#1F2937] font-semibold';
    }
    return 'text-gray-600';
  };

  return (
    <div className="w-full mt-4 sm:mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-2.5 px-1">
        <h3 className="text-[17px] sm:text-[19px] font-bold text-[#14171A] tracking-tight">
          Recent activity
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          {searchQuery && (
            <span className="text-[11px] text-gray-500 hidden sm:inline truncate max-w-[150px]">
              Filtering: <strong className="text-gray-800">"{searchQuery}"</strong>
            </span>
          )}
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'ALL' ? 'DEPOSIT' : 'ALL')}
            className="text-[12px] sm:text-[12.5px] font-medium text-[#00C076] hover:text-[#00AA67] hover:underline flex items-center gap-1 transition-colors select-none"
          >
            <span>View all</span>
            <ExternalLink className="w-3 h-3 inline-block opacity-80" />
          </button>
        </div>
      </div>

      {/* Modern Table Container - Responsive Horizontal Scroll */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left border-collapse min-w-[640px]">
            {/* Dark Sleek Header */}
            <thead>
              <tr className="bg-[#18191B] text-white text-[12px] sm:text-[12.5px] font-medium tracking-normal select-none">
                <th className="py-2.5 px-4 sm:px-5 rounded-tl-2xl">Type</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Network</th>
                <th className="py-2.5 px-3 text-left">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 sm:px-5 text-right rounded-tr-2xl">Time</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100/90 text-[12px] sm:text-[12.5px]">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No transactions match your search query.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((row) => {
                  const isPositive = row.amount.startsWith('+');

                  return (
                    <tr
                      key={row.id}
                      onClick={() => onSelectTransaction?.(row)}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                    >
                      {/* Type */}
                      <td className="py-2.5 sm:py-3 px-4 sm:px-5 font-bold text-[#14171A]">
                        {row.type}
                      </td>

                      {/* Reference with copy interaction */}
                      <td className="py-2.5 sm:py-3 px-3 text-[#4B5563] font-normal">
                        <div className="flex items-center gap-1.5">
                          <span>{row.reference}</span>
                          <button
                            onClick={(e) => handleCopy(e, row.fullRef || row.reference, row.id)}
                            title="Copy Reference"
                            className="text-gray-400 hover:text-gray-700 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3 h-3 text-[#00C076]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 sm:py-3 px-3 text-[#4B5563]">
                        {row.customer}
                      </td>

                      {/* Network */}
                      <td className="py-2.5 sm:py-3 px-3 text-[#374151] font-medium whitespace-nowrap">
                        {row.network}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-2.5 sm:py-3 px-3 font-semibold whitespace-nowrap ${
                          isPositive ? 'text-[#00C076]' : 'text-[#1F2937]'
                        }`}
                      >
                        {row.amount}
                      </td>

                      {/* Status */}
                      <td className={`py-2.5 sm:py-3 px-3 whitespace-nowrap ${getStatusColor(row.status)}`}>
                        {row.status}
                      </td>

                      {/* Time */}
                      <td className="py-2.5 sm:py-3 px-4 sm:px-5 text-right text-[#6B7280] whitespace-nowrap">
                        {row.time}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
