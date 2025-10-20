'use client';

import KeywordPanel from '@/components/KeywordPanel';
import ResultsTable from '@/components/ResultsTable';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BizScope</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Discover, Track, and Analyze Connecticut Businesses
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          <div className="col-span-3">
            <KeywordPanel />
          </div>
          <div className="col-span-9">
            <ResultsTable />
          </div>
        </div>
      </main>
    </div>
  );
}
