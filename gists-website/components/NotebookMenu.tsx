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
    <div className={level > 0 ? 'ml-3 border-l-2 border-border pl-3' : ''}>
      <div
        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent cursor-pointer transition-all duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          {(hasChildren || hasNotebooks) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-200 ${isOpen ? 'rotate-90' : ''}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
          <span className={`font-semibold group-hover:text-primary transition-colors ${level === 0 ? 'text-base' : 'text-sm'}`}>
            {label}
          </span>
        </div>
        {node.count && node.count > 0 && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            {node.count}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
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
                  className={`flex items-center gap-2 py-2 px-3 ml-7 rounded-lg text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  title={notebook.title}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate">{displayName}</span>
                </Link>
              )
            })}
        </div>
      )}
    </div>
  )
}

export function NotebookMenu({ navigation }: NotebookMenuProps) {
  return (
    <nav className="w-full space-y-1">
      {Object.entries(navigation)
        .sort(([, a], [, b]) => (b.count || 0) - (a.count || 0))
        .map(([key, node]) => (
          <NavItem key={key} label={node.label} node={node} />
        ))}
    </nav>
  )
}
