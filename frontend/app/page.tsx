"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { FloatingElements } from "@/components/floating-elements"

export default function MissionExportMVP() {
  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [internFile, setInternFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const handleProjectUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProjectFile(file)
    }
  }

  const handleInternUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setInternFile(file)
    }
  }

  const handleGenerateTask = async () => {
    if (!projectFile || !internFile) {
      alert("Please upload both files before generating a task.")
      return;
    }

    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', internFile);
      formData.append('project', projectFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        alert(`Generation failed: ${result.message}`);
        return;
      }

      // Navigate to result page with markdown content
      const encodedMarkdown = encodeURIComponent(result.md);
      window.location.href = `/result?md=${encodedMarkdown}`;
      
    } catch (error) {
      console.error('Error generating mission:', error);
      alert('Failed to generate mission. Please ensure the Python server is running on localhost:5000.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navigation Component */}
      <Navigation />

      {/* 3D Floating Elements Background */}
      <FloatingElements />

      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Enhanced Header with 3D Animations */}
          <div className="text-center mb-12">
            <div className="float-animation mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl mx-auto flex items-center justify-center pulse3d-animation">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-balance mb-4 drop-shadow-sm">Mission Export MVP</h1>
            <p className="text-lg text-gray-700 max-w-md mx-auto text-pretty font-medium">
              Transform your project documentation and intern information into actionable tasks
            </p>
          </div>

          {/* Enhanced Upload Sections with Better Styling and Animations */}
          <div className="space-y-8">
            {/* Project Documentation Upload */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-gray-200 border-2">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Documentation</h3>
                </div>
                <label className="block">
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-xl border-2 border-dashed border-gray-400 hover:border-purple-600 hover:bg-purple-50 transition-all duration-300 bg-white text-gray-800 font-medium"
                    onClick={() => document.getElementById("project-upload")?.click()}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="font-medium">Upload Project Documentation</span>
                    </div>
                  </Button>
                  <input
                    id="project-upload"
                    type="file"
                    className="hidden"
                    onChange={handleProjectUpload}
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                </label>
                {projectFile && (
                  <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-accent">{projectFile.name}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Intern Info Upload */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-gray-200 border-2">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Intern Information</h3>
                </div>
                <label className="block">
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-xl border-2 border-dashed border-gray-400 hover:border-purple-600 hover:bg-purple-50 transition-all duration-300 bg-white text-gray-800 font-medium"
                    onClick={() => document.getElementById("intern-upload")?.click()}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="font-medium">Upload Intern Information</span>
                    </div>
                  </Button>
                  <input
                    id="intern-upload"
                    type="file"
                    className="hidden"
                    onChange={handleInternUpload}
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                </label>
                {internFile && (
                  <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-accent">{internFile.name}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Enhanced Generate Task Button with 3D Effects */}
          <div className="pt-12">
            <Button
              onClick={handleGenerateTask}
              className="w-full h-16 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-2 border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!projectFile || !internFile || isGenerating}
            >
              <div className="flex items-center space-x-3">
                {isGenerating ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                <span>{isGenerating ? "Generating Mission..." : "Generate Task"}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
