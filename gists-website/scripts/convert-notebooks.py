#!/usr/bin/env python3
"""
Convert Jupyter notebooks to HTML and extract metadata.
This script processes all .ipynb files in the parent gists directory
and converts them to HTML for static site generation.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Any
import nbformat
from nbconvert import HTMLExporter
from bs4 import BeautifulSoup

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
NOTEBOOKS_SOURCE = PROJECT_ROOT.parent  # Parent directory (gists repo)
NOTEBOOKS_OUTPUT = PROJECT_ROOT / 'public' / 'notebooks'
METADATA_OUTPUT = PROJECT_ROOT / 'data'

# Directories to exclude
EXCLUDE_DIRS = {'.git', '.venv', '.vscode', 'node_modules', 'gists-website', '__pycache__'}

def clean_title(text: str) -> str:
    """Clean and format title text."""
    # Remove special characters and extra whitespace
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_title_from_notebook(nb: nbformat.NotebookNode) -> str:
    """Extract title from first markdown cell or first heading."""
    for cell in nb.cells:
        if cell.cell_type == 'markdown':
            content = cell.source
            # Look for first heading
            match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            if match:
                return clean_title(match.group(1))
            # If no heading, use first line
            first_line = content.split('\n')[0].strip()
            if first_line and len(first_line) < 100:
                return clean_title(first_line.lstrip('#').strip())
    return "Untitled Notebook"

def extract_headings(nb: nbformat.NotebookNode) -> List[Dict[str, Any]]:
    """Extract all headings from markdown cells."""
    headings = []
    for cell in nb.cells:
        if cell.cell_type == 'markdown':
            content = cell.source
            for match in re.finditer(r'^(#{1,6})\s+(.+)$', content, re.MULTILINE):
                level = len(match.group(1))
                text = match.group(2).strip()
                heading_id = re.sub(r'[^\w\s-]', '', text).lower().replace(' ', '-')
                headings.append({
                    'level': level,
                    'text': text,
                    'id': heading_id
                })
    return headings

def extract_text_content(nb: nbformat.NotebookNode) -> str:
    """Extract all text content for search indexing."""
    content_parts = []

    for cell in nb.cells:
        if cell.cell_type == 'markdown':
            # Strip markdown formatting
            text = cell.source
            text = re.sub(r'[#*_`]', '', text)
            content_parts.append(text)
        elif cell.cell_type == 'code':
            # Include code but mark it
            content_parts.append(cell.source)

    return ' '.join(content_parts)

def get_category_from_path(rel_path: Path) -> Dict[str, str]:
    """Extract category information from file path."""
    parts = rel_path.parts[:-1]  # Exclude filename

    category = parts[0] if len(parts) > 0 else 'Uncategorized'
    subcategory = parts[1] if len(parts) > 1 else ''

    # Clean up category names (convert snake_case to Title Case)
    category = category.replace('_', ' ').title()
    subcategory = subcategory.replace('_', ' ').title() if subcategory else ''

    return {
        'category': category,
        'subcategory': subcategory,
        'path_parts': list(parts)
    }

def convert_notebook(notebook_path: Path, rel_path: Path) -> Dict[str, Any]:
    """Convert a single notebook to HTML and extract metadata."""
    print(f"Processing: {rel_path}")

    # Read notebook
    with open(notebook_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)

    # Extract metadata
    title = extract_title_from_notebook(nb)
    headings = extract_headings(nb)
    text_content = extract_text_content(nb)
    category_info = get_category_from_path(rel_path)

    # Convert to HTML
    html_exporter = HTMLExporter()
    html_exporter.template_name = 'classic'  # Use classic template
    (body, resources) = html_exporter.from_notebook_node(nb)

    # Clean HTML
    soup = BeautifulSoup(body, 'html.parser')

    # Remove unnecessary elements
    for element in soup.find_all(['script', 'link', 'meta']):
        element.decompose()

    # Find notebook content (the main container)
    notebook_container = soup.find('div', class_='jp-Notebook')
    if not notebook_container:
        notebook_container = soup.find('body')

    cleaned_html = str(notebook_container) if notebook_container else body

    # Create output path
    output_rel_path = rel_path.with_suffix('.html')
    output_path = NOTEBOOKS_OUTPUT / output_rel_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write HTML file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_html)

    # Generate URL path (without .html extension for Next.js)
    url_path = '/' + str(rel_path.with_suffix('')).replace(os.sep, '/')

    # Create metadata entry
    metadata = {
        'id': str(rel_path.with_suffix('')).replace(os.sep, '/'),
        'title': title,
        'category': category_info['category'],
        'subcategory': category_info['subcategory'],
        'path': url_path,
        'file_path': str(output_rel_path),
        'headings': headings,
        'content': text_content[:1000],  # First 1000 chars for search
        'tags': category_info['path_parts']
    }

    return metadata

def find_notebooks(root_dir: Path) -> List[Path]:
    """Find all Jupyter notebooks in the directory tree."""
    notebooks = []

    for path in root_dir.rglob('*.ipynb'):
        # Skip excluded directories
        if any(excluded in path.parts for excluded in EXCLUDE_DIRS):
            continue

        # Skip checkpoint files
        if '.ipynb_checkpoints' in str(path):
            continue

        notebooks.append(path)

    return notebooks

def main():
    """Main conversion process."""
    print("Starting notebook conversion...")
    print(f"Source directory: {NOTEBOOKS_SOURCE}")
    print(f"Output directory: {NOTEBOOKS_OUTPUT}")

    # Create output directories
    NOTEBOOKS_OUTPUT.mkdir(parents=True, exist_ok=True)
    METADATA_OUTPUT.mkdir(parents=True, exist_ok=True)

    # Find all notebooks
    notebook_paths = find_notebooks(NOTEBOOKS_SOURCE)
    print(f"\nFound {len(notebook_paths)} notebooks")

    # Convert each notebook
    all_metadata = []
    errors = []

    for notebook_path in notebook_paths:
        try:
            rel_path = notebook_path.relative_to(NOTEBOOKS_SOURCE)
            metadata = convert_notebook(notebook_path, rel_path)
            all_metadata.append(metadata)
        except Exception as e:
            error_msg = f"Error processing {notebook_path}: {str(e)}"
            print(f"❌ {error_msg}")
            errors.append(error_msg)

    # Save metadata
    metadata_file = METADATA_OUTPUT / 'notebooks-metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Conversion complete!")
    print(f"Processed: {len(all_metadata)} notebooks")
    print(f"Errors: {len(errors)}")
    print(f"Metadata saved to: {metadata_file}")

    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  - {error}")

if __name__ == '__main__':
    main()
