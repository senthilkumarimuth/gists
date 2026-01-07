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
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Sidebar with menu */}
      <aside
        className={`
          lg:flex-shrink-0 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:opacity-0 lg:invisible'}
          ${isSidebarOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className={`
          sticky top-20 h-[calc(100vh-6rem)] rounded-xl border border-border bg-card shadow-lg overflow-hidden
          ${isSidebarOpen ? 'p-5' : 'p-0'}
        `}>
          {isSidebarOpen && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Categories
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:flex hidden items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors group"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto -mx-2 px-2">
                <NotebookMenu navigation={navigation} />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Expand button when sidebar is collapsed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden lg:flex fixed left-4 top-24 z-40 items-center justify-center p-3 rounded-full bg-card border-2 border-border shadow-xl hover:shadow-2xl hover:border-primary hover:scale-110 transition-all duration-300 group"
          aria-label="Expand sidebar"
          title="Show categories"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Main content - expands when sidebar is collapsed */}
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? '' : 'lg:max-w-full'}
      `}>
        {children}
      </main>
    </div>
  )
}
