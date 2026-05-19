import Link from 'next/link';
import { getDocs, getRepoInfo } from '@/lib/docs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, GitBranch, Terminal, Calendar, ArrowRight, Library, HardDrive } from 'lucide-react';

export default async function DocsIndexPage() {
  const docs = getDocs();
  const repoInfo = getRepoInfo();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-12 md:py-20 space-y-12">
      {/* Welcome Banner Card (Minimal) */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-5">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1 rounded-sm border-border bg-transparent text-foreground">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground animate-pulse"></span>
            Build Synchronized
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Documentation Hub
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Welcome to the developer documentation portal. This site compiles static Markdown files directly from your GitHub repository during the build phase to render high-performance document portals.
          </p>
        </div>
      </div>

      {/* Stats Grid using shadcn Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none border-border bg-transparent hover:bg-card hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Terminal className="h-4 w-4" /> Source Repository
            </CardDescription>
            <CardTitle className="text-lg font-bold text-foreground truncate" title={`${repoInfo.owner}/${repoInfo.repo}`}>
              {repoInfo.owner}/{repoInfo.repo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 font-mono">
              <GitBranch className="h-4 w-4" /> {repoInfo.branch}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border bg-transparent hover:bg-card hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Library className="h-4 w-4" /> Documents
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">
              {docs.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
              <HardDrive className="h-4 w-4" /> Compiled pages
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border bg-transparent hover:bg-card hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Last Sync
            </CardDescription>
            <CardTitle className="text-base font-bold text-foreground">
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Static compilation snapshot
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Directory */}
      <div className="space-y-6 pt-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" /> Explore Documents
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <Card key={doc.slug} className="group hover:border-foreground/40 transition-all duration-200 flex flex-col justify-between shadow-none bg-transparent hover:bg-card border-border">
              <CardHeader className="p-5">
                <div className="space-y-2">
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-foreground transition-colors">
                    {doc.title}
                  </CardTitle>
                  {doc.metadata.description && (
                    <CardDescription className="line-clamp-2 leading-relaxed text-sm text-muted-foreground">
                      {doc.metadata.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-1.5">
                  {doc.metadata.tags?.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-medium px-2 py-0.5 rounded-sm text-muted-foreground bg-muted border-transparent group-hover:bg-foreground group-hover:text-background transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" asChild className="group-hover:translate-x-1 transition-transform text-xs font-medium pr-0 text-muted-foreground group-hover:text-foreground bg-transparent hover:bg-transparent">
                  <Link href={`/docs/${doc.slug}`} className="flex items-center gap-1.5">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
