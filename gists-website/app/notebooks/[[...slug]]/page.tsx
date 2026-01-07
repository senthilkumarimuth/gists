import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { TableOfContents } from '@/components/TableOfContents'
import { SidebarLayout } from '@/components/SidebarLayout'

interface NotebookMetadata {
  id: string
  title: string
  category: string
  subcategory: string
  path: string
  file_path: string
  headings: Array<{ level: number; text: string; id: string }>
  content: string
  tags: string[]
}

interface NavigationNode {
  label: string
  count?: number
  children?: { [key: string]: NavigationNode }
  notebooks?: Array<{ title: string; path: string; id: string }>
}

async function getNotebookMetadata(slug: string[]): Promise<NotebookMetadata | null> {
  const metadataPath = path.join(process.cwd(), 'data', 'notebooks-metadata.json')
  const metadata: NotebookMetadata[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

  const notebookId = slug.join('/')
  return metadata.find((nb) => nb.id === notebookId) || null
}

async function getNotebookHTML(filePath: string): Promise<string> {
  const htmlPath = path.join(process.cwd(), 'public', 'notebooks', filePath)

  if (!fs.existsSync(htmlPath)) {
    return ''
  }

  return fs.readFileSync(htmlPath, 'utf-8')
}

async function getNavigation(): Promise<{ [key: string]: NavigationNode }> {
  const navigationPath = path.join(process.cwd(), 'data', 'navigation.json')
  const data = fs.readFileSync(navigationPath, 'utf-8')
  return JSON.parse(data)
}

export async function generateStaticParams() {
  const metadataPath = path.join(process.cwd(), 'data', 'notebooks-metadata.json')

  if (!fs.existsSync(metadataPath)) {
    return []
  }

  const metadata: NotebookMetadata[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

  return metadata.map((nb) => ({
    slug: nb.id.split('/')
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params
  const metadata = await getNotebookMetadata(slug)

  if (!metadata) {
    return {
      title: 'Notebook Not Found'
    }
  }

  return {
    title: `${metadata.title} | Gists`,
    description: `${metadata.category}${
      metadata.subcategory ? ` › ${metadata.subcategory}` : ''
    }: ${metadata.content.substring(0, 160)}`
  }
}

export default async function NotebookPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params

  if (slug.length === 0) {
    notFound()
  }

  const metadata = await getNotebookMetadata(slug)

  if (!metadata) {
    notFound()
  }

  const html = await getNotebookHTML(metadata.file_path)
  const navigation = await getNavigation()

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

      <div className="container mx-auto px-4 py-10 max-w-[1600px]">
        <SidebarLayout navigation={navigation}>
          <div className="flex flex-col xl:flex-row gap-12 relative">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary hover:underline transition-colors">
                  Home
                </Link>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium">{metadata.category}</span>
                {metadata.subcategory && (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium">{metadata.subcategory}</span>
                  </>
                )}
              </nav>

              {/* Title and Tags */}
              <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight">{metadata.title}</h1>
                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium border border-border hover:border-primary transition-colors"
                      >
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notebook Content */}
              <div
                className="notebook-content prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            {/* Right Sidebar - Table of Contents */}
            {metadata.headings.length > 0 && (
              <aside className="hidden xl:block">
                <TableOfContents headings={metadata.headings} />
              </aside>
            )}
          </div>
        </SidebarLayout>
      </div>
    </div>
  )
}
