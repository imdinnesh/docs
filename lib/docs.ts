import fs from 'fs';
import path from 'path';

export interface GithubDoc {
  slug: string;
  title: string;
  path: string;
  downloadUrl: string;
  htmlUrl: string;
  metadata: {
    title?: string;
    description?: string;
    date?: string;
    tags?: string[];
    [key: string]: any;
  };
  content: string;
  rawContent: string;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
  lastBuilt: string;
}

interface GithubDocsData {
  repoInfo: RepoInfo;
  documents: GithubDoc[];
}

export function getDocsData(): GithubDocsData {
  const filePath = path.join(process.cwd(), 'public', 'github-docs.json');
  const defaultData: GithubDocsData = {
    repoInfo: { owner: 'local-fallback', repo: 'sample-repo', branch: 'main', lastBuilt: '' },
    documents: []
  };

  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[docs] Warning: ${filePath} does not exist. Returning empty docs.`);
      return defaultData;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as GithubDocsData;
  } catch (error) {
    console.error('[docs] Failed to read github-docs.json:', error);
    return defaultData;
  }
}

export function getDocs(): GithubDoc[] {
  return getDocsData().documents;
}

export function getRepoInfo(): RepoInfo {
  return getDocsData().repoInfo;
}

export function getDocBySlug(slug: string): GithubDoc | undefined {
  const docs = getDocs();
  return docs.find(doc => doc.slug === slug);
}
