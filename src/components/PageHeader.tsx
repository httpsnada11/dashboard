import React, { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  category: string;
  action?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, category, action }) => {
  return (
    <div className="mb-3.5 select-none flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 className="text-[26px] xs:text-[30px] sm:text-[34px] font-bold text-[#14171A] tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-[11px] sm:text-[12px] text-[#788292] mt-1 font-normal">
          {category} &gt; {title}
        </p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
