"use client"

import { useState, useEffect } from "react"
import { HeadingInfo } from "../components/markdown-viewer"

export const useScrollSpy = (headings: HeadingInfo[], offset: number = 100) => {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const scrollTop = window.scrollY + offset

      // Find the currently active section
      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id)
        if (element && element.offsetTop <= scrollTop) {
          setActiveId(headings[i].id)
          break
        }
      }

      // If we're at the very top, activate the first heading
      if (window.scrollY < offset && headings.length > 0) {
        setActiveId(headings[0].id)
      }
    }

    // Set initial active section
    handleScroll()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings, offset])

  return activeId
}