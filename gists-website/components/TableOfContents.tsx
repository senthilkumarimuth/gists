'use client'

import { useEffect, useState } from 'react'

interface Heading {
  level: number
  text: string
  id: string
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66%' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Expanded TOC */}
      {isOpen && (
        <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-2">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                On This Page
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors group"
                aria-label="Collapse table of contents"
                title="Collapse"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <div className="px-5 pb-5">
              <ul className="space-y-1.5 border-l-2 border-border">
                {headings.map((heading) => {
                  const isActive = activeId === heading.id
                  const marginLeft = (heading.level - 1) * 12

                  return (
                    <li
                      key={heading.id}
                      style={{ marginLeft: `${marginLeft}px` }}
                    >
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`text-left text-sm w-full pl-3 py-1.5 border-l-2 transition-all rounded-r ${
                          isActive
                            ? 'border-primary text-primary font-semibold -ml-[2px] bg-accent'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary hover:bg-accent/50'
                        }`}
                      >
                        {heading.text}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Collapsed TOC Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-24 z-40 flex items-center justify-center p-3 rounded-full bg-card border-2 border-border shadow-xl hover:shadow-2xl hover:border-primary hover:scale-110 transition-all duration-300 group"
          aria-label="Expand table of contents"
          title="On This Page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-primary group-hover:-translate-x-0.5 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
    </>
  )
}
