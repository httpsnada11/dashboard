import React, { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  category: string;
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, category, action }) => {
  return (
    <div className="mb-3.5 select-none flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-[20px] xs:text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#14171A] tracking-tight leading-tight break-words">
          {title}
        </h1>
        <p className="text-[10.5px] sm:text-[11.5px] text-[#788292] mt-0.5 font-normal truncate">
          {category} &gt; {title}
        </p>
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-2 self-start sm:self-auto">{action}</div>}
    </div>
  );
};
