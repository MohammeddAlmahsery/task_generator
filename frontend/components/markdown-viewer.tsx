"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useCallback, useMemo } from "react"

export interface HeadingInfo {
  id: string
  text: string
  level: number
}

interface MarkdownViewerProps {
  content: string
  className?: string
  onHeadingsChange?: (headings: HeadingInfo[]) => void
  onContentChange?: (content: string) => void
}

// Utility function to generate slug from heading text
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim()
}

// Centralized markdown renderer so we can adjust styling / plugins in one place.
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className, onHeadingsChange, onContentChange }) => {
  
  // Use state to track current content for re-rendering
  const [currentContent, setCurrentContent] = React.useState(content)
  
  // Update current content when prop changes
  React.useEffect(() => {
    setCurrentContent(content)
  }, [content])
  
  // Track checkbox counter for reliable indexing
  let checkboxCounter = 0
  
  // Extract headings from markdown content
  const headings = useMemo(() => {
    const headingRegex = /^(#{1,2})\s+(.+)$/gm
    const extractedHeadings: HeadingInfo[] = []
    let match
    
    while ((match = headingRegex.exec(currentContent)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = generateSlug(text)
      
      extractedHeadings.push({ id, text, level })
    }
    
    return extractedHeadings
  }, [currentContent])

  // Notify parent component about headings change
  React.useEffect(() => {
    if (onHeadingsChange) {
      onHeadingsChange(headings)
    }
  }, [headings, onHeadingsChange])

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.warn('Clipboard copy failed', e)
    }
  }, [])

  // Handle checkbox toggle
  const toggleCheckbox = useCallback((checkboxIndex: number) => {
    console.log('toggleCheckbox called with index:', checkboxIndex)
    console.log('onContentChange available:', !!onContentChange)
    
    const lines = currentContent.split('\n')
    const checkboxRegex = /^(\s*)-\s+\[([ x])\]\s+(.*)$/

    let currentCheckboxIndex = 0
    const updatedLines = lines.map(line => {
      const match = line.match(checkboxRegex)
      if (match) {
        console.log(`Found checkbox ${currentCheckboxIndex}:`, line)
        if (currentCheckboxIndex === checkboxIndex) {
          const [, indent, checked, text] = match
          const newChecked = checked === ' ' ? 'x' : ' '
          const newLine = `${indent}- [${newChecked}] ${text}`
          console.log('Toggling checkbox from:', line, 'to:', newLine)
          currentCheckboxIndex++
          return newLine
        }
        currentCheckboxIndex++
      }
      return line
    })

    const newContent = updatedLines.join('\n')
    console.log('Setting new content locally and calling parent callback')
    
    // Update local state immediately for instant feedback
    setCurrentContent(newContent)
    
    // Also notify parent if callback exists
    if (onContentChange) {
      onContentChange(newContent)
    }
  }, [currentContent, onContentChange, setCurrentContent])

  // Reset checkbox counter for each render
  checkboxCounter = 0
  
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
            h1: ({ node, children, ...props }) => {
              const text = String(children)
              const id = generateSlug(text)
              return <h1 id={id} className="text-3xl font-bold mt-8 mb-4 scroll-mt-24" {...props}>{children}</h1>
            },
            h2: ({ node, children, ...props }) => {
              const text = String(children)
              const id = generateSlug(text)
              return <h2 id={id} className="text-2xl font-semibold mt-6 mb-3 scroll-mt-24" {...props}>{children}</h2>
            },
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              const raw = String(children)
              const hasNewline = /\n/.test(raw)
              const hasLanguage = /language-/.test(className || '')
              const isInline = inline ?? (!hasNewline && !hasLanguage)

              if (isInline) {
                return (
                  <code
                    className={
                      "rounded bg-gray-100 dark:bg-slate-800/60 px-1.5 py-0.5 font-mono text-[0.8rem] tracking-tight " +
                      (className || '')
                    }
                    {...props}
                  >
                    {children}
                  </code>
                )
              }

              const text = raw.replace(/\n$/, '')
              return (
                <div className="group relative not-prose">
                  <pre
                    className="bg-gray-50 dark:bg-slate-900/60 text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 rounded-md border border-gray-200 dark:border-slate-700 p-4 overflow-auto mb-4 font-mono"
                    {...props}
                  >
                    <code className={className}>{text}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => copy(text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-[11px] bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 px-2 py-0.5 rounded border border-gray-300 dark:border-slate-600 shadow-sm"
                    aria-label="Copy code"
                  >
                    Copy
                  </button>
                </div>
              )
            },
            a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
            input: ({ node, type, checked, disabled, ...props }) => {
              if (type === 'checkbox') {
                // Get current checkbox index and increment counter
                const currentIndex = checkboxCounter++
                console.log('Rendering checkbox', currentIndex, 'checked:', checked)
                
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    onClick={(e) => {
                      e.preventDefault()
                      console.log('Checkbox clicked:', currentIndex)
                      toggleCheckbox(currentIndex)
                    }}
                    onChange={(e) => {
                      e.preventDefault()
                      console.log('Checkbox changed:', currentIndex)
                      toggleCheckbox(currentIndex)
                    }}
                    className="mr-2 h-4 w-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer hover:bg-purple-50 transition-colors"
                    {...props}
                  />
                )
              }
              return <input type={type} {...props} />
            },
        }}
      >
        {currentContent}
      </ReactMarkdown>
    </div>
  )
}
