import React from 'react';

export const PageHeader = ({ title, category, action }) => {
  return (
    <div className="mb-3.5 select-none flex items-center justify-between">
      <div>
        <h1 className="text-[30px] sm:text-[34px] font-bold text-[#14171A] tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-[12px] text-[#788292] mt-1 font-normal">
          {category} &gt; {title}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
