import { notFound } from 'next/navigation';
import { getDocBySlug, getDocs } from '@/lib/docs';
import { marked } from 'marked';

// Next.js 16 type for dynamic page params
interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const docs = getDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Document Not Found',
    };
  }

  return {
    title: `${doc.title} - Documentation`,
    description: doc.metadata.description || `Documentation page for ${doc.title}`,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  // Parse markdown to HTML on the server at compile/build time
  const htmlContent = await marked.parse(doc.content || '');

  return (
    <article className="mx-auto w-full max-w-4xl px-6 py-12 md:px-12 md:py-16">
      {/* Breadcrumbs & GitHub Link */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>Docs</span>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-zinc-900 dark:text-white truncate max-w-[200px]">{doc.title}</span>
        </div>

        {doc.htmlUrl && (
          <a
            href={doc.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.67-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
            </svg>
            Edit on GitHub
          </a>
        )}
      </div>

      {/* Title & Metadata Headers */}
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          {doc.title}
        </h1>
        {doc.metadata.description && (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {doc.metadata.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {doc.metadata.date && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{doc.metadata.date}</span>
            </div>
          )}

          {doc.path && (
            <div className="flex items-center gap-1 font-mono">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>{doc.path}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {doc.metadata.tags && Array.isArray(doc.metadata.tags) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {doc.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Markdown Content (Rendered HTML) */}
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </article>
  );
}
