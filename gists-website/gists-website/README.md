# Gists Website

A modern, searchable website for browsing Jupyter notebooks, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Full-text search** - Fast client-side search using FlexSearch
- 📚 **Hierarchical navigation** - Browse notebooks by category and subcategory
- 🎨 **Dark mode** - Toggle between light and dark themes
- 📱 **Responsive design** - Works great on mobile, tablet, and desktop
- 📋 **Table of contents** - Auto-generated from notebook headings
- 🏷️ **Tags & categories** - Filter and organize notebooks
- ⚡ **Static site** - Fast loading, no server required
- 🎯 **SEO friendly** - Optimized for search engines

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with pip
- Jupyter notebooks in the parent directory

### Installation

Install dependencies:

```bash
npm install
pip3 install jupyter nbconvert nbformat beautifulsoup4
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

Run the full build:

```bash
npm run build
```

This will:
1. Convert all notebooks to HTML
2. Generate search index and navigation
3. Build the static site

### Scripts

- `npm run dev` - Start development server
- `npm run convert` - Convert notebooks to HTML
- `npm run index` - Generate search index
- `npm run build` - Full build
- `npm run start` - Start production server

## Deployment

Deploy the `out/` directory to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- FlexSearch
- nbconvert
