"use client"

import { useState } from "react"

interface TagsFilterProps {
  selectedTags: string[]
  availableTags: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export default function TagsFilter({
  selectedTags,
  availableTags,
  onChange,
  className = "",
}: TagsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-sm font-medium">Tags</span>
          {selectedTags.length > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {selectedTags.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No tags available</p>
            ) : (
              availableTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="hover:text-blue-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}