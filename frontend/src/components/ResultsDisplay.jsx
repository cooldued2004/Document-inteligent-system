import React from 'react';

const ResultsDisplay = ({ results, onCopy, onDownload }) => {
  const entityTypes = [
    { key: 'name', label: 'Names', icon: '👤', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { key: 'organization', label: 'Organizations', icon: '🏢', color: 'bg-green-100 text-green-800 border-green-200' },
    { key: 'location', label: 'Locations', icon: '📍', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { key: 'dates', label: 'Dates', icon: '📅', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { key: 'emails', label: 'Email Addresses', icon: '📧', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { key: 'phone_numbers', label: 'Phone Numbers', icon: '📞', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    { key: 'ids', label: 'IDs (Aadhar, SSN)', icon: '🆔', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { key: 'money_salary', label: 'Money / Salary', icon: '💰', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { key: 'urls', label: 'URLs', icon: '🔗', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { key: 'file_numbers', label: 'File Numbers', icon: '📁', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { key: 'percentages', label: 'Percentages', icon: '📊', color: 'bg-red-100 text-red-800 border-red-200' },
    { key: 'job_titles', label: 'Job Titles', icon: '💼', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { key: 'skills', label: 'Skills', icon: '🛠️', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { key: 'addresses', label: 'Addresses', icon: '🏠', color: 'bg-lime-100 text-lime-800 border-lime-200' },
  ];

  const hasResults = results && Object.values(results).some(arr => arr && arr.length > 0);

  if (!hasResults) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No entities found in the document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onCopy && (
          <button
            onClick={onCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy JSON
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JSON
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entityTypes.map(({ key, label, icon, color }) => {
          const entities = results[key] || [];
          if (entities.length === 0) return null;

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {entities.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entities.map((entity, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${color}`}
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsDisplay;
