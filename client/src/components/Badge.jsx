import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const currentStyle = styles[priority] || styles.Medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {priority || 'Medium'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    New: 'bg-slate-100 text-slate-700 border-slate-200',
    Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const currentStyle = styles[status] || styles.New;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status || 'New'}
    </span>
  );
};

export default { PriorityBadge, StatusBadge };
