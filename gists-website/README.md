# Gists Website

A modern, searchable website for browsing Jupyter notebooks, built with Next.js 14, TypeScript, and Tailwind CSS.

**Live Site**: https://gists-website.vercel.app

## Features

- 🔍 **Full-text search** - Fast client-side search using FlexSearch
- 📚 **Hierarchical navigation** - Browse notebooks by category and subcategory
- 🎨 **Dark mode** - Toggle between light and dark themes
- 📱 **Responsive design** - Works great on mobile, tablet, and desktop
- 📋 **Table of contents** - Auto-generated from notebook headings
- 🏷️ **Tags & categories** - Filter and organize notebooks
- ⚡ **Static site** - Fast loading, no server required
- 🎯 **SEO friendly** - Optimized for search engines

## Project Structure

```
gists-website/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with dark mode
│   ├── page.tsx             # Homepage
│   ├── providers.tsx        # Theme provider
│   └── notebooks/           # Dynamic notebook pages
├── components/              # React components
│   ├── DarkModeToggle.tsx  # Dark mode switcher
│   ├── NotebookMenu.tsx    # Hierarchical navigation
│   ├── SearchBar.tsx       # Search functionality
│   └── TableOfContents.tsx # TOC sidebar
├── scripts/                 # Build scripts
│   ├── convert-notebooks.py # Convert .ipynb to HTML
│   └── build-index.ts      # Generate search index
├── data/                    # Generated data files
│   ├── notebooks-metadata.json
│   ├── search-index.json
│   └── navigation.json
└── public/
    ├── notebooks/           # Converted HTML notebooks
    └── data/                # Data files (accessible to client)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with pip
- Jupyter notebooks in the parent directory (`../`)

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for notebook conversion)
pip3 install jupyter nbconvert nbformat beautifulsoup4
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📝 Updating the Website with New Notebooks

When you add or update notebooks in the parent `gists` directory, follow these steps to update the website:

### Step 1: Navigate to the Website Directory

```bash
cd /Users/senthilkumar/projects/gists/gists-website
```

### Step 2: Convert Notebooks to HTML

This will scan the parent directory for `.ipynb` files and convert them to HTML:

```bash
npm run convert
```

This script will:
- Find all Jupyter notebooks in `../` (parent directory)
- Convert them to HTML using `nbconvert`
- Extract metadata (title, headings, categories, tags)
- Save HTML files to `public/notebooks/`
- Generate `data/notebooks-metadata.json`

**Expected output**:
```
Processing: artificial_intelligence/generative_ai/architectures/transformers.ipynb
✅ Conversion complete!
Processed: 121 notebooks
```

### Step 3: Rebuild Search Index

Generate the search index and navigation structure:

```bash
npm run index
```

This will:
- Read all notebook metadata
- Build FlexSearch index for fast searching
- Generate hierarchical navigation structure
- Create `data/search-index.json` and `data/navigation.json`
- Copy data files to `public/data/` for client access

**Expected output**:
```
✅ Created 121 search documents
✅ Created navigation with 6 top-level categories
```

### Step 4: Test Locally (Optional)

Build and preview the changes:

```bash
npm run build
npm run dev
```

Visit http://localhost:3000 to verify:
- New notebooks appear in the menu
- Search finds the new content
- Notebooks render correctly

### Step 5: Commit and Deploy

Commit your changes:

```bash
git add -A
git commit -m "Add new notebooks: [describe changes]"
```

Deploy to Vercel:

```bash
vercel --prod
```

**That's it!** Your website will be updated at https://gists-website.vercel.app in about 1-2 minutes.

---

## 🚀 Quick Update Script

For convenience, you can run all steps at once:

```bash
# Run from gists-website directory
npm run convert && npm run index && npm run build
```

Then commit and deploy:

```bash
git add -A
git commit -m "Update notebooks"
vercel --prod
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run convert` | Convert all `.ipynb` files to HTML |
| `npm run index` | Generate search index and navigation |
| `npm run build` | Build production-ready static site |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Run ESLint |

## 📂 Important File Locations

### Source Notebooks
- **Location**: `/Users/senthilkumar/projects/gists/` (parent directory)
- All `.ipynb` files in this directory and subdirectories are processed

### Generated Files
- **HTML notebooks**: `public/notebooks/`
- **Metadata**: `data/notebooks-metadata.json`
- **Search index**: `data/search-index.json` and `public/data/search-index.json`
- **Navigation**: `data/navigation.json` and `public/data/navigation.json`

### Build Output
- **Static site**: `out/` directory (after `npm run build`)
- This is what gets deployed to Vercel

## 🎨 Customization

### Styling

- **Global styles**: `app/globals.css`
- **Theme colors**: CSS variables in `:root` and `.dark`
- **Tailwind config**: `tailwind.config.js`

### Components

- **Search behavior**: `components/SearchBar.tsx`
- **Navigation structure**: `components/NotebookMenu.tsx`
- **Notebook display**: `app/notebooks/[[...slug]]/page.tsx`

### Conversion Process

- **Notebook converter**: `scripts/convert-notebooks.py`
  - Modify to change HTML output format
  - Add custom metadata extraction
  - Handle special notebook types

- **Search indexer**: `scripts/build-index.ts`
  - Adjust search algorithm parameters
  - Modify navigation structure logic
  - Change indexing strategy

## 🐛 Troubleshooting

### Notebooks Not Appearing

1. Check that notebooks are in the parent directory
2. Ensure notebooks aren't in excluded directories (`.git`, `.venv`, `node_modules`)
3. Run `npm run convert` to regenerate HTML
4. Run `npm run index` to rebuild search index

### Search Not Working

1. Verify `public/data/search-index.json` exists
2. Check browser console for errors
3. Clear browser cache and reload
4. Ensure FlexSearch dependency is installed

### Build Errors

1. Check Node.js version (need 18+)
2. Clear build cache: `rm -rf .next out`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Run `npm run build` to see detailed errors

### Deployment Issues

1. Ensure all changes are committed: `git status`
2. Check Vercel build logs: Visit the inspection URL shown after deployment
3. Verify Python dependencies aren't needed (notebooks should already be converted)

## 📊 Statistics

- **Total Notebooks**: 121
- **Categories**: 6 main categories
- **Unique Tags**: 52
- **Static Pages**: 125 (1 homepage + 3 system pages + 121 notebooks)

## 🛠️ Technologies

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v3](https://tailwindcss.com/) - Styling
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - Search engine
- [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode
- [nbconvert](https://nbconvert.readthedocs.io/) - Notebook conversion (Python)

## 📄 License

This project uses the same license as the parent gists repository.

## 🆘 Support

For issues or questions:
1. Check this README
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Check [Vercel deployment docs](https://vercel.com/docs)

---

**Last Updated**: December 2024
**Deployed at**: https://gists-website.vercel.app
