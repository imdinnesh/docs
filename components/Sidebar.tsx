'use strict';
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

import { RepoInfo } from '../lib/docs';

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
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
          Documentation Portal
        </span>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          aria-label="Toggle Sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white pt-16 transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 md:sticky md:top-0 md:flex md:h-screen md:translate-x-0 md:pt-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Title (Desktop only) */}
        <div className="hidden border-b border-zinc-200 px-6 py-5 dark:border-zinc-800 md:block">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                Docs Portal
              </h1>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Fetched from GitHub
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filtering Area */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          {/* Search Box */}
          <div className="relative">
            <svg
              className="absolute top-3 left-3 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-4 pl-9 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Tags List */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                  selectedTag === null
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                    tag === selectedTag
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Documents Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
          <div className="px-2 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            Documents ({filteredDocs.length})
          </div>
          {filteredDocs.length === 0 ? (
            <div className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
              No matching documents found.
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
                  className={`group flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="text-sm leading-tight tracking-wide">{doc.title}</span>
                  {doc.metadata.description && (
                    <span className="text-2xs text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400 line-clamp-1">
                      {doc.metadata.description}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/30">
            <div className="flex flex-col gap-1.5 text-2xs text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between gap-2">
                <span>Repository:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]" title={`${repoInfo.owner}/${repoInfo.repo}`}>
                  {repoInfo.owner}/{repoInfo.repo}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Branch:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {repoInfo.branch}
                </span>
              </div>
              {repoInfo.lastBuilt && (
                <div className="flex justify-between">
                  <span>Last Built:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 text-right">
                    {new Date(repoInfo.lastBuilt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
