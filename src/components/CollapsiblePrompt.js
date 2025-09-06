import React, { useState } from 'react';

const CollapsiblePrompt = ({ title, prompt, isExpanded = false, onToggle }) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      // You could add a toast notification here
      console.log('Prompt copied to clipboard');
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">
              {isOpen ? 'Click to hide details' : 'Click to view prompt details'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              className="text-gray-500 hover:text-blue-600 p-1 rounded transition-colors"
              title="Copy prompt"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">VEO3 Prompt</span>
              <span className="text-xs text-gray-500">{prompt.length} characters</span>
            </div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {prompt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePrompt;
