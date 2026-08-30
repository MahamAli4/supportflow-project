import React from 'react';

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-32"></div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-slate-100 rounded"></div>
      ))}
    </div>
  </div>
);

export default { StatsSkeleton, TableSkeleton };
