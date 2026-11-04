import React from 'react';

export const AMLRiskBadge = ({ level = "Low", score = 94 }) => {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1 select-none">
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Segmented Ring SVG */}
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle track */}
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#E2E4E9"
            strokeWidth="3.2"
            strokeDasharray="4 2"
          />
          {/* Active segments */}
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeDasharray="4 2"
            strokeDashoffset="18"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[8px] font-semibold text-gray-800 leading-none">
          <span className="text-[7px] text-gray-700 font-bold">AML</span>
        </div>
      </div>
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[11px] font-medium text-gray-700">AML Risk</span>
        <span className="text-[10px] text-gray-400 font-medium">{level}</span>
      </div>
    </div>
  );
};

