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
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
        On This Page
      </h3>
      <ul className="space-y-2 border-l-2 border-border">
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
                className={`text-left text-sm w-full pl-3 py-1 border-l-2 transition-all ${
                  isActive
                    ? 'border-primary text-primary font-medium -ml-[2px]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                {heading.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
