import React from 'react';

const StatsDisplay = ({ results }) => {
  const calculateStats = () => {
    let total = 0;
    const breakdown = {};
    
    Object.entries(results).forEach(([key, values]) => {
      if (values && values.length > 0) {
        breakdown[key] = values.length;
        total += values.length;
      }
    });
    
    return { total, breakdown };
  };

  const { total, breakdown } = calculateStats();

  const statItems = [
    { key: 'name', label: 'Names', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { key: 'organization', label: 'Organizations', icon: '🏢', color: 'bg-green-100 text-green-800' },
    { key: 'location', label: 'Locations', icon: '📍', color: 'bg-purple-100 text-purple-800' },
    { key: 'dates', label: 'Dates', icon: '📅', color: 'bg-orange-100 text-orange-800' },
    { key: 'emails', label: 'Emails', icon: '📧', color: 'bg-cyan-100 text-cyan-800' },
    { key: 'phone_numbers', label: 'Phones', icon: '📞', color: 'bg-teal-100 text-teal-800' },
    { key: 'skills', label: 'Skills', icon: '🛠️', color: 'bg-amber-100 text-amber-800' },
    { key: 'job_titles', label: 'Jobs', icon: '💼', color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Extraction Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {statItems.map(({ key, label, icon, color }) => {
          const count = breakdown[key] || 0;
          if (count === 0) return null;
          
          return (
            <div key={key} className={`${color} rounded-lg p-3 text-center`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-semibold text-xl">{count}</div>
              <div className="text-xs opacity-75">{label}</div>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
        <div>
          <span className="text-gray-600">Total Entities Extracted:</span>
          <span className="ml-2 font-bold text-2xl text-blue-600">{total}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Categories Found</div>
          <div className="font-bold text-lg text-blue-600">{Object.keys(breakdown).length}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
