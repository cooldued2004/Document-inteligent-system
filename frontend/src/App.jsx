import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResults(null);
      setError(null);
    }
  };

  // Load dark mode and history from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    const savedHistory = localStorage.getItem('extractionHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K: Copy results
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleCopy();
      }
      // Ctrl/Cmd + E: Extract
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExtract();
      }
      // Ctrl/Cmd + H: Toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(!showHistory);
      }
      // Ctrl/Cmd + D: Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDarkMode(!darkMode);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [results, showHistory, darkMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data);
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        filename: file.name,
        timestamp: new Date().toLocaleString(),
        data: response.data
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
      setHistory(updatedHistory);
      localStorage.setItem('extractionHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to extract information from document'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      alert('✓ Results copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (results) {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} relative transition-colors duration-300`}>
      {/* Contact Info - Top Right */}
      <div className={`fixed top-4 right-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border z-40`}>
        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Karan Sharma</p>
          <p className="text-blue-500 hover:underline cursor-pointer">karan2922sharma@gmail.com</p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>+91 7718862314</p>
        </div>
      </div>

      {/* Top Controls */}
      <div className={`fixed top-4 left-4 flex gap-2 z-40`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 border border-gray-700 hover:bg-gray-700' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          title="Toggle dark mode (Ctrl+D)"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-gray-800 text-blue-400 border border-gray-700 hover:bg-gray-700' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          } relative`}
          title="View history (Ctrl+H)"
        >
          📋 {history.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{history.length}</span>}
        </button>
      </div>

      <div className={`container mx-auto px-4 py-8 max-w-6xl`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Document Intelligence System
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Extract structured information from PDF and TXT documents
          </p>
        </div>

        {/* File Upload Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upload Document</h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : darkMode 
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-650'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172a4 4 0 005.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isDragActive ? (
                <p className="text-primary-600 font-medium">Drop the file here...</p>
              ) : (
                <>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Drag and drop a PDF or TXT file here, or click to select
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supports: PDF, TXT</p>
                </>
              )}
            </div>
          </div>

          {file && (
            <div className={`mt-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{file.name}</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                    setError(null);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!file || loading}
            className={`mt-4 w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              !file || loading
                ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
            title="Extract information (Ctrl+E)"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Extract Information'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-6 mb-6`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📋 Extraction History</h3>
            {history.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No extractions yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => { setResults(entry.data); setShowHistory(false); }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{entry.filename}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{entry.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Extracted Information</h2>
            <ResultsDisplay
              results={results}
              onCopy={handleCopy}
              onDownload={handleDownload}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

