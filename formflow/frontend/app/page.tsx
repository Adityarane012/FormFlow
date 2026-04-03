"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORM_TEMPLATES } from "@/lib/formTemplates";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/80 via-white to-white" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white shadow-sm">
            F
          </span>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            FormFlow
          </span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/builder">Open builder</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-gray-500" />
          Schema-driven · Realtime · Minimal
        </div>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Forms that feel calm, clear, and{" "}
          <span className="text-gray-500">effortlessly on-brand</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
          Drag fields onto a generous canvas, publish a public link, and watch
          responses roll into a tidy dashboard—with conditional logic and file
          uploads when you need them.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button 
            onClick={() => router.push("/builder")}
            className="h-12 rounded-xl px-8 text-base shadow-sm gap-2"
          >
            Start building
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => router.push("/builder")}
            variant="secondary" 
            className="h-12 rounded-xl px-8 text-base"
          >
            Create a blank form
          </Button>
        </div>

        <div className="mt-16 text-left">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Start with a template</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(FORM_TEMPLATES).map(([id, template]) => (
              <button
                key={id}
                onClick={() => router.push(`/builder?template=${id}`)}
                className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  <LayoutGrid className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{template.fields.length} fields</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
          {[
            {
              title: "Visual builder",
              body: "Drag from a focused field library. Reorder with calm, tactile handles.",
              icon: LayoutGrid,
            },
            {
              title: "Public links",
              body: "Share one URL. Responses land in Supabase, exportable as CSV or JSON.",
              icon: ArrowRight,
            },
            {
              title: "Realtime",
              body: "Socket.io keeps collaborators aligned as the schema evolves.",
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <item.icon className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
              <h2 className="mt-4 text-sm font-semibold text-gray-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
