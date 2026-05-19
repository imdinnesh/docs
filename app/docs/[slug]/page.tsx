import { notFound } from 'next/navigation';
import { getDocBySlug, getDocs } from '@/lib/docs';
import { marked } from 'marked';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileCode, ChevronRight } from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.67-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
);

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
    <article className="mx-auto w-full max-w-4xl px-6 py-12 md:px-12 md:py-20 space-y-8 animate-fade-in">
      {/* Breadcrumbs & GitHub Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Docs</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">{doc.title}</span>
        </div>

        {doc.htmlUrl && (
          <Button variant="outline" size="sm" asChild className="text-xs font-semibold gap-1.5 h-9 rounded-md border-border bg-transparent hover:bg-foreground hover:text-background transition-all">
            <a href={doc.htmlUrl} target="_blank" rel="noopener noreferrer">
              <GithubIcon className="h-4 w-4" />
              Edit on GitHub
            </a>
          </Button>
        )}
      </div>

      {/* Title & Metadata Headers */}
      <header className="space-y-5 pb-8 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {doc.title}
        </h1>
        {doc.metadata.description && (
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {doc.metadata.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm font-medium text-muted-foreground pt-3">
          {doc.metadata.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-foreground" />
              <span>{doc.metadata.date}</span>
            </div>
          )}

          {doc.path && (
            <div className="flex items-center gap-1.5 font-mono bg-muted px-2.5 py-1 rounded-sm text-foreground">
              <FileCode className="h-4 w-4" />
              <span>{doc.path}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {doc.metadata.tags && Array.isArray(doc.metadata.tags) && (
          <div className="flex flex-wrap gap-2 pt-4">
            {doc.metadata.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-medium px-2 py-0.5 rounded-sm border-transparent bg-muted text-muted-foreground hover:text-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Markdown Content (Rendered HTML) */}
      <div 
        className="markdown-content pt-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </article>
  );
}
