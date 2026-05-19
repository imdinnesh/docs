import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env files manually before the Next.js process starts
function loadEnv() {
  const envPaths = ['.env.local', '.env.production', '.env.development', '.env'];
  for (const envFile of envPaths) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      console.log(`[prebuild] Loading env variables from ${envFile}`);
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex !== -1) {
            const key = trimmed.slice(0, eqIndex).trim();
            const rawValue = trimmed.slice(eqIndex + 1).trim();

            // Strip inline comments if not inside quotes
            let cleanValue = '';
            let inDoubleQuotes = false;
            let inSingleQuotes = false;
            
            for (let i = 0; i < rawValue.length; i++) {
              const char = rawValue[i];
              if (char === '"' && !inSingleQuotes) {
                inDoubleQuotes = !inDoubleQuotes;
              } else if (char === "'" && !inDoubleQuotes) {
                inSingleQuotes = !inSingleQuotes;
              } else if (char === '#' && !inDoubleQuotes && !inSingleQuotes) {
                break; // Comment starts here
              }
              cleanValue += char;
            }
            
            cleanValue = cleanValue.trim();
            // Remove surrounding quotes if any
            if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) || 
                (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
              cleanValue = cleanValue.slice(1, -1);
            }

            // Set value if not defined yet (preserving .env.local precedence)
            if (!process.env[key]) {
              process.env[key] = cleanValue;
            }
          }
        }
      });
    }
  }
}

// Simple zero-dependency Front-Matter Parser
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, content };
  }
  const yamlBlock = match[1];
  const body = match[2];
  const metadata = {};
  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Clean string quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Simple type conversions
      if (value.toLowerCase() === 'true') value = true;
      else if (value.toLowerCase() === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);

      metadata[key] = value;
    }
  }
  return { metadata, content: body };
}

// Generate a URL-safe slug from a filename
function generateSlug(filename) {
  return filename
    .replace(/\.mdx?$/, '') // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/(^-|-$)/g, ''); // Trim hyphens
}

async function run() {
  loadEnv();

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  let basePath = process.env.GITHUB_PATH || '';
  
  // Handle common representations of root directory defensively
  if (basePath.toLowerCase() === 'root' || basePath === '.' || basePath === '/') {
    basePath = '';
  }

  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  console.log('[prebuild] Starting GitHub doc fetcher...');

  if (!owner || !repo) {
    console.warn('[prebuild] WARNING: GITHUB_OWNER or GITHUB_REPO not specified in env. Using mock data fallback.');
    writeFallbackData();
    return;
  }

  const results = [];

  async function fetchDirectory(dirPath) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`;
    const headers = {
      'User-Agent': 'nextjs-docs-fetcher',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    console.log(`[prebuild] Querying directory contents: ${dirPath || '/'}`);
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub API failed with status ${res.status}: ${errText}`);
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      throw new Error(`Expected array from contents API, got: ${typeof items}`);
    }

    for (const item of items) {
      if (item.type === 'dir') {
        await fetchDirectory(item.path);
      } else if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
        console.log(`[prebuild] Found markdown file: ${item.path}`);
        
        // Fetch raw content
        const rawRes = await fetch(item.download_url, { headers });
        if (!rawRes.ok) {
          console.error(`[prebuild] Failed to fetch raw content for ${item.path}`);
          continue;
        }
        
        const rawContent = await rawRes.text();
        const { metadata, content } = parseFrontMatter(rawContent);
        
        const title = metadata.title || item.name.replace(/\.mdx?$/, '').replace(/[-_]/g, ' ');
        const slug = metadata.slug || generateSlug(item.name);
        
        results.push({
          slug,
          title,
          path: item.path,
          downloadUrl: item.download_url,
          htmlUrl: item.html_url,
          metadata,
          content,
          rawContent,
        });
      }
    }
  }

  try {
    await fetchDirectory(basePath);
    
    // Ensure public folder exists
    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'github-docs.json');
    const outputData = {
      repoInfo: {
        owner: owner,
        repo: repo,
        branch: branch,
        lastBuilt: new Date().toISOString()
      },
      documents: results
    };
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`[prebuild] Success! Fetched ${results.length} files and saved to ${outputPath}`);
  } catch (error) {
    console.error('[prebuild] ERROR during GitHub fetch:', error.message);
    console.warn('[prebuild] Writing fallback/mock data to prevent build failure.');
    writeFallbackData();
  }
}

function writeFallbackData() {
  const fallbackDocs = [
    {
      slug: 'sample-doc-1',
      title: 'Sample Document 1',
      path: 'docs/sample1.md',
      downloadUrl: '',
      htmlUrl: '',
      metadata: {
        title: 'Sample Document 1',
        description: 'This is a sample document fallback.',
        date: '2026-05-19',
        tags: ['sample', 'fallback']
      },
      content: '\n# Sample Document 1\n\nThis is a fallback content because no GitHub Repository environment variables were configured or the API request failed.\n\nTo view your actual GitHub documents, configure the following in `.env.local`:\n```env\nGITHUB_OWNER=your-username\nGITHUB_REPO=your-repo\nGITHUB_PATH=docs\nGITHUB_BRANCH=main\nGITHUB_TOKEN=your-optional-token\n```\n',
      rawContent: '---\ntitle: Sample Document 1\ndescription: This is a sample document fallback.\ndate: 2026-05-19\ntags:\n  - sample\n  - fallback\n---\n# Sample Document 1\n\nThis is a fallback content because no GitHub Repository environment variables were configured or the API request failed.\n\nTo view your actual GitHub documents, configure the following in `.env.local`:\n```env\nGITHUB_OWNER=your-username\nGITHUB_REPO=your-repo\nGITHUB_PATH=docs\nGITHUB_BRANCH=main\nGITHUB_TOKEN=your-optional-token\n```\n'
    },
    {
      slug: 'getting-started-guide',
      title: 'Getting Started Guide',
      path: 'docs/getting-started.md',
      downloadUrl: '',
      htmlUrl: '',
      metadata: {
        title: 'Getting Started Guide',
        description: 'How to setup and run this documentation portal.',
        date: '2026-05-19',
        tags: ['guide', 'nextjs']
      },
      content: '\n# Getting Started Guide\n\nWelcome to your Next.js documentation portal. This application fetches markdown documents from your GitHub repository at build time and compiles them into a static API layer.\n\n## Features\n\n- **Fast Builds**: Fetches doc list and markdown at build time.\n- **Zero-Dependency Parser**: Automatically parses YAML Front Matter.\n- **Searchable Index**: Entire repository is indexed in a single static JSON database served at runtime.\n- **Modern Design**: Powered by Tailwind CSS & Next.js App Router.\n',
      rawContent: '---\ntitle: Getting Started Guide\ndescription: How to setup and run this documentation portal.\ndate: 2026-05-19\ntags:\n  - guide\n  - nextjs\n---\n# Getting Started Guide\n\nWelcome to your Next.js documentation portal. This application fetches markdown documents from your GitHub repository at build time and compiles them into a static API layer.\n\n## Features\n\n- **Fast Builds**: Fetches doc list and markdown at build time.\n- **Zero-Dependency Parser**: Automatically parses YAML Front Matter.\n- **Searchable Index**: Entire repository is indexed in a single static JSON database served at runtime.\n- **Modern Design**: Powered by Tailwind CSS & Next.js App Router.\n'
    }
  ];

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const outputPath = path.join(publicDir, 'github-docs.json');
  const outputData = {
    repoInfo: {
      owner: 'local-fallback',
      repo: 'sample-repo',
      branch: 'main',
      lastBuilt: new Date().toISOString()
    },
    documents: fallbackDocs
  };
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`[prebuild] Fallback data written to ${outputPath}`);
}

run();
