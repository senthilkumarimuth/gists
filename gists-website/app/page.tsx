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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-primary relative z-10 transition-transform group-hover:scale-110 duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">Gists</span>
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <SidebarLayout navigation={navigation}>
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Interactive Learning Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Learning Notebooks
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A curated collection of Jupyter notebooks covering data science, machine learning, statistics, Python, and more.
            </p>
            <div className="flex gap-12 justify-center text-sm text-muted-foreground pt-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <span className="text-4xl font-bold text-foreground block mb-1 transition-transform group-hover:scale-110">
                    {stats.totalNotebooks}
                  </span>
                  <span className="text-base">Notebooks</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <span className="text-4xl font-bold text-foreground block mb-1 transition-transform group-hover:scale-110">
                    {stats.categories}
                  </span>
                  <span className="text-base">Categories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-16">
            <SearchBar />
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryEntries.map(({ key, label, count }) => (
              <Link
                key={key}
                href={`#${key}`}
                className="group relative rounded-xl border border-border bg-card p-7 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
                      {label}
                    </h3>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {count}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore {count} notebook{count !== 1 ? 's' : ''} in {label.toLowerCase()}
                  </p>
                  <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">View notebooks</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Built with Next.js and Tailwind CSS. All notebooks are converted from Jupyter format.
            </p>
          </footer>
        </SidebarLayout>
      </div>
    </div>
  )
}
