'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Menu, BookOpen, GitBranch, Terminal } from 'lucide-react';
import { RepoInfo } from '@/lib/docs';

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
}

interface SidebarProps {
  docs: GithubDoc[];
  repoInfo: RepoInfo;
}

export default function Sidebar({ docs, repoInfo }: SidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    docs.forEach(doc => {
      if (doc.metadata.tags && Array.isArray(doc.metadata.tags)) {
        doc.metadata.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [docs]);

  // Filter docs based on search query and selected tag
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.metadata.description &&
          doc.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || (doc.metadata.tags && doc.metadata.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [docs, searchQuery, selectedTag]);

  return (
    <>
      {/* Mobile Toggle Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 text-foreground md:hidden sticky top-0 z-50">
        <span className="text-sm font-semibold tracking-tight">
          Documentation
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Toggle Sidebar"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background text-foreground transition-transform duration-300 ease-in-out md:sticky md:top-0 md:flex md:h-screen md:translate-x-0 md:pt-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Title (Desktop only) */}
        <div className="hidden border-b border-border px-6 py-5 md:block">
          <Link href="/docs" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-5 w-5" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                Docs Portal
              </h1>
            </div>
          </Link>
        </div>

        {/* Search & Filtering Area */}
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 bg-transparent border-border text-foreground text-sm rounded-md focus-visible:ring-1 focus-visible:ring-foreground"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 h-full px-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tags List */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={selectedTag === null ? "default" : "outline"}
                className={`cursor-pointer text-xs font-medium px-2 py-0.5 rounded-sm transition-colors ${
                  selectedTag === null ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground border-border bg-transparent hover:bg-muted'
                }`}
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={tag === selectedTag ? "default" : "outline"}
                  className={`cursor-pointer text-xs font-medium px-2 py-0.5 rounded-sm transition-colors ${
                    tag === selectedTag ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground border-border bg-transparent hover:bg-muted'
                  }`}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Documents Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
          <div className="px-2 mb-2 text-xs font-semibold tracking-tight text-muted-foreground">
            Documents ({filteredDocs.length})
          </div>
          {filteredDocs.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No matching documents.
            </div>
          ) : (
            filteredDocs.map(doc => {
              const href = `/docs/${doc.slug}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={doc.slug}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group flex flex-col gap-0.5 rounded-md px-3 py-2 transition-all duration-150 ${
                    isActive
                      ? 'bg-foreground text-background font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-sm leading-tight">{doc.title}</span>
                </Link>
              );
            })
          )}
        </nav>

        {/* Footer info */}
        <div className="border-t border-border p-4">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground px-1">
            <div className="flex justify-between items-center gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Terminal className="h-3.5 w-3.5" /> Repo
              </span>
              <span className="font-mono text-foreground truncate max-w-[120px]" title={`${repoInfo.owner}/${repoInfo.repo}`}>
                {repoInfo.owner}/{repoInfo.repo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-medium">
                <GitBranch className="h-3.5 w-3.5" /> Branch
              </span>
              <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                {repoInfo.branch}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
