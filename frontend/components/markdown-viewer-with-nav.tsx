"use client"

import React, { useState } from "react"
import { MarkdownViewer, HeadingInfo } from "./markdown-viewer"
import { TableOfContents } from "./table-of-contents"
import { useScrollSpy } from "../hooks/use-scroll-spy"

interface MarkdownViewerWithNavProps {
  content: string
  className?: string
}

export const MarkdownViewerWithNav: React.FC<MarkdownViewerWithNavProps> = ({
  content,
  className = ""
}) => {
  const [headings, setHeadings] = useState<HeadingInfo[]>([])
  const activeId = useScrollSpy(headings, 80) // Offset for fixed navbar (64px + padding)

  const handleHeadingsChange = (newHeadings: HeadingInfo[]) => {
    setHeadings(newHeadings)
  }

  return (
    <div className="relative">
      {/* Table of Contents */}
      <TableOfContents 
        headings={headings} 
        activeId={activeId}
      />
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
          <MarkdownViewer
            content={content}
            className={`prose prose-lg max-w-none ${className}`}
            onHeadingsChange={handleHeadingsChange}
          />
        </div>
      </div>
    </div>
  )
}