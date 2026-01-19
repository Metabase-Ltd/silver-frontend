import { SilverPriceDisplay } from "@/components/SilverDisplay";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-2xl">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-zinc-900 dark:text-white">
            Market Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Real-time precious metal tracking
          </p>
        </div>
        
        <SilverPriceDisplay />
        
        <p className="text-sm text-center text-zinc-400 dark:text-zinc-600 max-w-md mt-8">
          Prices are fetched directly from the exchange via secure API endpoints. 
          Updates occur automatically every 1 second.
        </p>
      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-zinc-400 text-xs">
        <div>Powered by Silver API</div>
      </footer>
    </div>
  );
}
