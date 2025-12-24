import { SearchBar } from '@/components/SearchBar'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { SidebarLayout } from '@/components/SidebarLayout'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

interface NavigationNode {
  label: string
  count?: number
  children?: { [key: string]: NavigationNode }
  notebooks?: Array<{ title: string; path: string; id: string }>
}

async function getNavigation(): Promise<{ [key: string]: NavigationNode }> {
  const navigationPath = path.join(process.cwd(), 'data', 'navigation.json')
  const data = fs.readFileSync(navigationPath, 'utf-8')
  return JSON.parse(data)
}

async function getStats() {
  const navigationPath = path.join(process.cwd(), 'data', 'navigation.json')
  const data = fs.readFileSync(navigationPath, 'utf-8')
  const navigation = JSON.parse(data)

  const categories = Object.keys(navigation).length
  const totalNotebooks = Object.values(navigation).reduce(
    (sum: number, node: any) => sum + (node.count || 0),
    0
  )

  return { categories, totalNotebooks }
}

export default async function Home() {
  const navigation = await getNavigation()
  const stats = await getStats()

  const categoryEntries = Object.entries(navigation)
    .map(([key, node]) => ({
      key,
      label: node.label,
      count: node.count || 0
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span className="text-xl font-bold">Gists</span>
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <SidebarLayout navigation={navigation}>
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Learning Notebooks
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A collection of Jupyter notebooks on data science, machine learning, statistics, Python, and more.
            </p>
            <div className="flex gap-8 justify-center text-sm text-muted-foreground">
              <div>
                <span className="text-2xl font-bold text-foreground block">
                  {stats.totalNotebooks}
                </span>
                <span>Notebooks</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground block">
                  {stats.categories}
                </span>
                <span>Categories</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-12">
            <SearchBar />
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryEntries.map(({ key, label, count }) => (
              <Link
                key={key}
                href={`#${key}`}
                className="group rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {label}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {count}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Explore {count} notebook{count !== 1 ? 's' : ''} in {label.toLowerCase()}
                </p>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              Built with Next.js and Tailwind CSS. All notebooks are converted from Jupyter format.
            </p>
          </footer>
        </SidebarLayout>
      </div>
    </div>
  )
}
