export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-8 px-6 py-24">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          dmitryvasincode
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Next.js App Router
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          TypeScript, Tailwind CSS, Cloudflare. Supabase подключите отдельно —
          в <code className="text-sm">.env</code> только URL и anon key.
        </p>
      </div>

      <ul className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
        <li className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          App Router + TypeScript
        </li>
        <li className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          Tailwind CSS 4
        </li>
        <li className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <code className="text-xs text-zinc-500">GET</code>{" "}
          <a href="/api/health" className="font-medium hover:underline">
            /api/health
          </a>
        </li>
        <li className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
          Cloudflare — см. <code className="text-xs">docs/cloudflare.md</code>
        </li>
      </ul>

      <p className="text-sm text-zinc-500">
        Скопируйте <code>.env.example</code> → <code>.env</code>
      </p>
    </main>
  );
}
