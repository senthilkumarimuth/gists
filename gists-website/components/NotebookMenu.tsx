'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NotebookItem {
  title: string
  path: string
  id: string
}

interface NavigationNode {
  label: string
  count?: number
  children?: { [key: string]: NavigationNode }
  notebooks?: NotebookItem[]
}

interface NotebookMenuProps {
  navigation: { [key: string]: NavigationNode }
  isOpen: boolean
  onToggle: () => void
}

function NavItem({
  label,
  node,
  level = 0
}: {
  label: string
  node: NavigationNode
  level?: number
}) {
  const [isOpen, setIsOpen] = useState(false) // Collapsed by default
  const pathname = usePathname()
  const hasChildren = node.children && Object.keys(node.children).length > 0
  const hasNotebooks = node.notebooks && node.notebooks.length > 0

  return (
    <div className={level > 0 ? 'ml-4' : ''}>
      <div
        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {(hasChildren || hasNotebooks) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
          <span className={`font-medium ${level === 0 ? 'text-base' : 'text-sm'}`}>
            {label}
          </span>
        </div>
        {node.count && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {node.count}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-1">
          {/* Render child categories */}
          {hasChildren &&
            Object.entries(node.children!).map(([key, childNode]) => (
              <NavItem key={key} label={childNode.label} node={childNode} level={level + 1} />
            ))}

          {/* Render notebooks */}
          {hasNotebooks &&
            node.notebooks!.map((notebook) => {
              const notebookPath = `/notebooks${notebook.path}`
              const isActive = pathname === notebookPath

              // Extract filename from ID (e.g., "python/tools/databricks" -> "databricks")
              const filename = notebook.id.split('/').pop() || notebook.id
              // Convert underscores and hyphens to spaces for readability
              const displayName = filename.replace(/[_-]/g, ' ')

              return (
                <Link
                  key={notebook.id}
                  href={notebookPath}
                  className={`block py-2 px-3 ml-6 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  title={notebook.title}
                >
                  {displayName}
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}

export function NotebookMenu({ navigation, isOpen, onToggle }: NotebookMenuProps) {
  return (
    <>
      {/* Toggle button for mobile/tablet */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Desktop toggle button */}
      <button
        onClick={onToggle}
        className="hidden lg:block absolute -right-3 top-6 z-10 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-secondary transition-colors"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? '' : 'rotate-180'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      <nav className="w-full h-full overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {Object.entries(navigation)
            .sort(([, a], [, b]) => (b.count || 0) - (a.count || 0))
            .map(([key, node]) => (
              <NavItem key={key} label={node.label} node={node} />
            ))}
        </div>
      </nav>
    </>
  )
}
