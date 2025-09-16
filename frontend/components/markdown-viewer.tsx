"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useCallback } from "react"

interface MarkdownViewerProps {
  content: string
  className?: string
}

// Centralized markdown renderer so we can adjust styling / plugins in one place.
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className }) => {

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.warn('Clipboard copy failed', e)
    }
  }, [])

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              if (inline) {
                return <code className={"rounded bg-gray-100 px-1 py-0.5 text-sm " + (className || "")} {...props}>{children}</code>
              }
              const text = String(children).replace(/\n$/, '')
              return (
                <div className="group relative">
                  <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-auto mb-4" {...props}>
                    <code className={className}>{text}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => copy(text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded border border-gray-500"
                    aria-label="Copy code"
                  >
                    Copy
                  </button>
                </div>
              )
            },
            a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
