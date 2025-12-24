'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Index } from 'flexsearch'

interface SearchDocument {
  id: string
  title: string
  category: string
  subcategory: string
  path: string
  content: string
  tags: string[]
  headings: string[]
}

interface SearchResult {
  id: string
  title: string
  category: string
  subcategory: string
  path: string
  excerpt: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef<Index | null>(null)
  const documentsRef = useRef<SearchDocument[]>([])

  // Load search index on mount
  useEffect(() => {
    async function loadIndex() {
      try {
        const response = await fetch('/data/search-index.json')

        if (!response.ok) {
          console.error('Failed to load search index:', response.status, response.statusText)
          return
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Search index is not JSON, got:', contentType)
          return
        }

        const documents: SearchDocument[] = await response.json()
        documentsRef.current = documents

        // Create FlexSearch index
        const index = new Index({
          tokenize: 'forward',
          cache: true,
        })

        // Index all documents
        documents.forEach((doc, i) => {
          const searchText = `${doc.title} ${doc.category} ${doc.subcategory} ${doc.content} ${doc.headings.join(' ')} ${doc.tags.join(' ')}`
          index.add(i, searchText)
        })

        indexRef.current = index
      } catch (error) {
        console.error('Failed to load search index:', error)
      }
    }

    loadIndex()
  }, [])

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Perform search
  useEffect(() => {
    if (!query.trim() || !indexRef.current) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsLoading(true)

    const searchIndex = indexRef.current
    const documents = documentsRef.current

    try {
      const resultIndices = searchIndex.search(query, { limit: 10 })

      const searchResults: SearchResult[] = (resultIndices as number[]).map(idx => {
        const doc = documents[idx]
        // Create excerpt
        const excerptLength = 150
        const content = doc.content.toLowerCase()
        const queryLower = query.toLowerCase()
        const queryIndex = content.indexOf(queryLower)

        let excerpt = doc.content.substring(0, excerptLength)
        if (queryIndex !== -1 && queryIndex > 50) {
          const start = Math.max(0, queryIndex - 50)
          excerpt = '...' + doc.content.substring(start, start + excerptLength)
        }

        return {
          id: doc.id,
          title: doc.title,
          category: doc.category,
          subcategory: doc.subcategory,
          path: doc.path,
          excerpt: excerpt + '...'
        }
      })

      setResults(searchResults)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search notebooks..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/notebooks${result.path}`}
              onClick={() => {
                setShowResults(false)
                setQuery('')
              }}
              className="block p-4 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-semibold text-foreground mb-1">
                {result.title}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {result.category}
                {result.subcategory && ` › ${result.subcategory}`}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {result.excerpt}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No results */}
      {showResults && query && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="text-muted-foreground">No notebooks found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
