"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { FloatingElements } from "@/components/floating-elements"
import { useSearchParams, useRouter } from "next/navigation"

function ResultContent() {
  const [markdown, setMarkdown] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Get markdown from URL params (encoded)
    const encodedMarkdown = searchParams.get('md')
    if (encodedMarkdown) {
      try {
        const decodedMarkdown = decodeURIComponent(encodedMarkdown)
        setMarkdown(decodedMarkdown)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to decode markdown content")
        setIsLoading(false)
      }
    } else {
      setError("No markdown content found")
      setIsLoading(false)
    }
  }, [searchParams])

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mission-plan.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleBackToUpload = () => {
    router.push('/')
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />
        <FloatingElements />
        <div className="relative z-10 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Processing your mission...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />
        <FloatingElements />
        <div className="relative z-10 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-600 text-xl mb-4">Error: {error}</div>
            <Button onClick={handleBackToUpload} className="bg-purple-600 hover:bg-purple-700 text-white">
              Back to Upload
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />
      <FloatingElements />

      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Mission Plan Generated
            </h1>
            <p className="text-lg text-gray-700">
              Your personalized mission plan is ready for download and review
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
            >
              {showPreview ? "Show Raw Markdown" : "Show Preview"}
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-6 py-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Markdown
            </Button>
            <Button
              onClick={handleBackToUpload}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
            >
              Generate New Mission
            </Button>
          </div>

          {/* Content Display */}
          <Card className="p-8 bg-white border-gray-200 border-2">
            {showPreview ? (
              <MarkdownViewer content={markdown} className="prose prose-lg max-w-none" />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-6 rounded-lg overflow-auto max-h-96">
                {markdown}
              </pre>
            )}
          </Card>

        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Navigation />
        <FloatingElements />
        <div className="relative z-10 pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}