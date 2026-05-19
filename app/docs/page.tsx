import Link from 'next/link';
import { getDocs, getRepoInfo } from '@/lib/docs';

export default async function DocsIndexPage() {
  const docs = getDocs();
  const repoInfo = getRepoInfo();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 md:px-12 md:py-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 px-6 py-12 text-white shadow-xl dark:bg-white dark:text-zinc-900 sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Documentation Portal
          </h1>
          <p className="mt-4 text-base text-zinc-300 dark:text-zinc-600">
            Welcome to the developer documentation portal. This site compiles static Markdown files directly from your GitHub repository during the build phase.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold dark:bg-black/5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced Build
            </span>
          </div>
        </div>
        {/* Dynamic mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 via-transparent to-zinc-900 opacity-50 dark:from-zinc-100 dark:to-zinc-200" />
      </div>

      {/* Repo Stats Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Source Repository
          </div>
          <div className="mt-2 text-lg font-bold text-zinc-800 dark:text-zinc-100 truncate" title={`${repoInfo.owner}/${repoInfo.repo}`}>
            {repoInfo.owner}/{repoInfo.repo}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Branch: <span className="font-mono">{repoInfo.branch}</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Document Count
          </div>
          <div className="mt-2 text-3xl font-extrabold text-zinc-800 dark:text-zinc-100">
            {docs.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Markdown files generated
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Last Sync
          </div>
          <div className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100">
            {repoInfo.lastBuilt ? (
              new Date(repoInfo.lastBuilt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            ) : (
              'N/A'
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Static build compilation
          </div>
        </div>
      </div>

      {/* Document Directory */}
      <div className="mt-16">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Explore Documents
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div>
                <h3 className="text-base font-bold text-zinc-900 group-hover:text-black dark:text-zinc-100 dark:group-hover:text-white">
                  {doc.title}
                </h3>
                {doc.metadata.description && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {doc.metadata.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {doc.metadata.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-50 px-2 py-0.5 text-2xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                  Read
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
