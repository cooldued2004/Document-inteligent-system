import React, { useState } from 'react';
import StatsDisplay from './StatsDisplay';
import { exportToJSON, exportToCSV, exportToXML, exportToPlainText } from '../utils/exportUtils';

const ResultsDisplay = ({ results, onCopy, onDownload, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Remove duplicates from results
  const deduplicateResults = (data) => {
    const deduplicated = {};
    Object.entries(data).forEach(([key, values]) => {
      if (values && values.length > 0) {
        deduplicated[key] = [...new Set(values.map(v => String(v).toLowerCase()))].map((v, idx) => 
          values.find(val => String(val).toLowerCase() === v)
        );
      }
    });
    return deduplicated;
  };

  const deduplicatedResults = deduplicateResults(results);
  
  // Filter results based on search term
  const filterResults = (data) => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(data).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filtered[key] = values.filter(value => 
          String(value).toLowerCase().includes(term)
        );
      }
    });
    
    return filtered;
  };

  const filteredResults = filterResults(deduplicatedResults);
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
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-8 text-center`}>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No entities found in the document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <StatsDisplay results={deduplicatedResults} />

      {/* Search & Filter Section */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } transition-colors`}
        />
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-end">
        {onCopy && (
          <button
            onClick={onCopy}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Copy JSON (Ctrl+K)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy JSON
          </button>
        )}
        
        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          
          {showExportMenu && (
            <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <button
                onClick={() => { exportToJSON(deduplicatedResults); setShowExportMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white rounded-t-lg transition-colors`}
              >
                📄 JSON
              </button>
              <button
                onClick={() => { exportToCSV(deduplicatedResults); setShowExportMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-green-500 hover:text-white transition-colors`}
              >
                📊 CSV
              </button>
              <button
                onClick={() => { exportToXML(deduplicatedResults); setShowExportMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white transition-colors`}
              >
                📋 XML
              </button>
              <button
                onClick={() => { exportToPlainText(deduplicatedResults); setShowExportMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-purple-500 hover:text-white rounded-b-lg transition-colors`}
              >
                📝 TXT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entityTypes.map(({ key, label, icon, color }) => {
          const entities = filteredResults[key] || [];
          if (entities.length === 0) return null;

          return (
            <div key={key} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{label}</h3>
                <span className={`ml-auto text-sm rounded px-2 py-1 ${
                  darkMode
                    ? 'text-gray-300 bg-gray-600'
                    : 'text-gray-500 bg-gray-100'
                }`}>
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
