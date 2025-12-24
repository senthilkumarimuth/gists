'use client'

import { useState } from 'react'
import { NotebookMenu } from './NotebookMenu'

interface NavigationNode {
  label: string
  count?: number
  children?: { [key: string]: NavigationNode }
  notebooks?: Array<{ title: string; path: string; id: string }>
}

interface SidebarLayoutProps {
  navigation: { [key: string]: NavigationNode }
  children: React.ReactNode
}

export function SidebarLayout({ navigation, children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar with menu */}
      <aside
        className={`
          lg:flex-shrink-0 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-0 lg:opacity-0'}
          ${isSidebarOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className={`
          sticky top-20 h-[calc(100vh-6rem)] rounded-lg border border-border bg-card
          ${isSidebarOpen ? 'p-4 overflow-y-auto' : 'overflow-hidden'}
        `}>
          {isSidebarOpen && (
            <>
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              <NotebookMenu
                navigation={navigation}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              />
            </>
          )}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-6 -right-3 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-secondary transition-colors"
              aria-label="Expand sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 rotate-180"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content - expands when sidebar is collapsed */}
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? '' : 'lg:ml-8'}
      `}>
        {children}
      </main>
    </div>
  )
}
