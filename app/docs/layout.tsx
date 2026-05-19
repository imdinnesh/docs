import React from 'react';
import { getDocs, getRepoInfo } from '@/lib/docs';
import Sidebar from '@/components/Sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getDocs();
  const repoInfo = getRepoInfo();

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950 md:flex-row">
      <Sidebar docs={docs} repoInfo={repoInfo} />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
