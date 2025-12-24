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
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <span>/</span>
                <span>{metadata.category}</span>
                {metadata.subcategory && (
                  <>
                    <span>/</span>
                    <span>{metadata.subcategory}</span>
                  </>
                )}
              </nav>

              {/* Title and Tags */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{metadata.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                    >
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notebook Content */}
              <div
                className="notebook-content prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            {/* Right Sidebar - Table of Contents */}
            {metadata.headings.length > 0 && (
              <aside className="hidden xl:block xl:w-64 xl:flex-shrink-0">
                <TableOfContents headings={metadata.headings} />
              </aside>
            )}
          </div>
        </SidebarLayout>
      </div>
    </div>
  )
}
