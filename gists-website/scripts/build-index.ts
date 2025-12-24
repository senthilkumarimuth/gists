#!/usr/bin/env node
/**
 * Build search index and navigation structure from notebook metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NotebookMetadata {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  path: string;
  file_path: string;
  headings: Array<{ level: number; text: string; id: string }>;
  content: string;
  tags: string[];
}

interface NavigationNode {
  label: string;
  count?: number;
  children?: { [key: string]: NavigationNode };
  notebooks?: Array<{ title: string; path: string; id: string }>;
}

interface SearchDocument {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  path: string;
  content: string;
  tags: string[];
  headings: string[];
}

const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const METADATA_FILE = path.join(DATA_DIR, 'notebooks-metadata.json');
const SEARCH_INDEX_FILE = path.join(DATA_DIR, 'search-index.json');
const NAVIGATION_FILE = path.join(DATA_DIR, 'navigation.json');

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSearchIndex(notebooks: NotebookMetadata[]): SearchDocument[] {
  console.log('Building search index...');

  const searchDocs = notebooks.map(nb => ({
    id: nb.id,
    title: nb.title,
    category: nb.category,
    subcategory: nb.subcategory,
    path: nb.path,
    content: nb.content,
    tags: nb.tags,
    headings: nb.headings.map(h => h.text)
  }));

  console.log(`✅ Created ${searchDocs.length} search documents`);
  return searchDocs;
}

function buildNavigation(notebooks: NotebookMetadata[]): { [key: string]: NavigationNode } {
  console.log('Building navigation structure...');

  const nav: { [key: string]: NavigationNode } = {};

  for (const nb of notebooks) {
    const { tags, title, path, id } = nb;

    if (tags.length === 0) continue;

    // Get top-level category
    const category = tags[0];

    if (!nav[category]) {
      nav[category] = {
        label: capitalizeWords(category.replace(/_/g, ' ')),
        children: {},
        notebooks: []
      };
    }

    // If there are subcategories
    if (tags.length > 1) {
      let current = nav[category];

      // Navigate/create nested structure
      for (let i = 1; i < tags.length; i++) {
        const subcat = tags[i];

        if (!current.children) {
          current.children = {};
        }

        if (!current.children[subcat]) {
          current.children[subcat] = {
            label: capitalizeWords(subcat.replace(/_/g, ' ')),
            children: {},
            notebooks: []
          };
        }

        current = current.children[subcat];
      }

      // Add notebook to the deepest level
      if (!current.notebooks) {
        current.notebooks = [];
      }
      current.notebooks.push({ title, path, id });
    } else {
      // No subcategories, add directly to top level
      if (!nav[category].notebooks) {
        nav[category].notebooks = [];
      }
      nav[category].notebooks.push({ title, path, id });
    }
  }

  // Calculate counts recursively
  function calculateCounts(node: NavigationNode): number {
    let count = node.notebooks?.length || 0;

    if (node.children) {
      for (const childKey of Object.keys(node.children)) {
        count += calculateCounts(node.children[childKey]);
      }
    }

    node.count = count;
    return count;
  }

  for (const key of Object.keys(nav)) {
    calculateCounts(nav[key]);
  }

  console.log(`✅ Created navigation with ${Object.keys(nav).length} top-level categories`);
  return nav;
}

function generateStats(notebooks: NotebookMetadata[]) {
  const categories = new Set(notebooks.map(nb => nb.category));
  const tags = new Set(notebooks.flatMap(nb => nb.tags));

  console.log('\n📊 Statistics:');
  console.log(`  Total notebooks: ${notebooks.length}`);
  console.log(`  Categories: ${categories.size}`);
  console.log(`  Unique tags: ${tags.size}`);
}

function main() {
  console.log('🚀 Starting index generation...\n');

  // Check if metadata exists
  if (!fs.existsSync(METADATA_FILE)) {
    console.error(`❌ Metadata file not found: ${METADATA_FILE}`);
    console.error('Please run the notebook conversion script first.');
    process.exit(1);
  }

  // Read metadata
  const metadata: NotebookMetadata[] = JSON.parse(
    fs.readFileSync(METADATA_FILE, 'utf-8')
  );

  console.log(`📖 Loaded ${metadata.length} notebook metadata entries\n`);

  // Build search index
  const searchIndex = buildSearchIndex(metadata);
  fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex, null, 2));
  console.log(`💾 Search index saved to: ${SEARCH_INDEX_FILE}\n`);

  // Build navigation
  const navigation = buildNavigation(metadata);
  fs.writeFileSync(NAVIGATION_FILE, JSON.stringify(navigation, null, 2));
  console.log(`💾 Navigation saved to: ${NAVIGATION_FILE}\n`);

  // Generate stats
  generateStats(metadata);

  console.log('\n✅ Index generation complete!');
}

main();
