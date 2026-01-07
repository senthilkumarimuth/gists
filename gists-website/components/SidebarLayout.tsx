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
          ${isSidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:opacity-0'}
          ${isSidebarOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className={`
          sticky top-20 h-[calc(100vh-6rem)] rounded-xl border border-border bg-card shadow-lg
          ${isSidebarOpen ? 'p-5 overflow-y-auto' : 'overflow-hidden'}
        `}>
          {isSidebarOpen && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Categories
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:block hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
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
              className="absolute top-6 -right-4 p-2 rounded-full bg-card border border-border shadow-lg hover:bg-accent hover:border-primary transition-all duration-300"
              aria-label="Expand sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 rotate-180 text-primary"
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
