'use client';

import { useState } from 'react';

interface Website {
  id: string;
  name: string;
  domain: string;
}

interface WebsiteSelectorProps {
  websites: Website[];
  selectedWebsiteId: string | null;
  onWebsiteChange: (websiteId: string) => void;
  loading?: boolean;
}

export function WebsiteSelector({ websites, selectedWebsiteId, onWebsiteChange, loading }: WebsiteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {selectedWebsite?.name || 'Select Website'}
          </span>
          {selectedWebsite && (
            <span className="text-xs text-gray-500">{selectedWebsite.domain}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="py-1 max-h-60 overflow-y-auto">
            {websites.map((website) => (
              <button
                key={website.id}
                onClick={() => {
                  onWebsiteChange(website.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                  selectedWebsiteId === website.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{website.name}</span>
                  <span className="text-xs text-gray-500">{website.domain}</span>
                </div>
              </button>
            ))}
            {websites.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                No websites found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}