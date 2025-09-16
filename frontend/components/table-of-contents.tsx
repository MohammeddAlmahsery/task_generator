"use client"

import React, { useState, useEffect } from "react"
import { HeadingInfo } from "./markdown-viewer"
import { Button } from "./ui/button"
import { ChevronRight, Menu, X } from "lucide-react"

interface TableOfContentsProps {
  headings: HeadingInfo[]
  activeId?: string
  className?: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  headings, 
  activeId, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isOpen && !target.closest('.toc-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
      setIsOpen(false) // Close mobile menu after click
    }
  }

  if (headings.length === 0) {
    return null
  }

  const tocContent = (
    <nav className="space-y-1">
      <div className="px-3 pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          📋 Table of Contents
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {headings.length} section{headings.length !== 1 ? 's' : ''}
        </p>
      </div>
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => scrollToSection(heading.id)}
          className={`
            w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200
            hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:scale-[1.02]
            ${heading.level === 1 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-normal text-gray-600 dark:text-gray-400 ml-4'}
            ${activeId === heading.id 
              ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border-l-3 border-purple-500 shadow-sm' 
              : ''
            }
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
          `}
        >
          <span className="flex items-center">
            {heading.level === 2 && (
              <ChevronRight className="w-3 h-3 mr-1 opacity-60" />
            )}
            {heading.text}
          </span>
        </button>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-28 left-4 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Toggle table of contents"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span className="sr-only">
          {isOpen ? 'Close table of contents' : 'Open table of contents'}
        </span>
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 toc-container ${className}`}>
        <div className="p-6 pt-24 h-full overflow-y-auto">
          {tocContent}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 toc-container
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}
      `}>
        <div className="p-6 pt-16 h-full overflow-y-auto">
          {tocContent}
        </div>
      </div>
    </>
  )
}