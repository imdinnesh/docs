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
    <div className="relative flex min-h-screen w-full flex-col bg-background text-foreground md:flex-row">
      {/* Main UI */}
      <Sidebar docs={docs} repoInfo={repoInfo} />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
