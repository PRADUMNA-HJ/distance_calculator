import { BookOpen, ExternalLink, Layers3, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const docCards = [
  {
    title: "Prompt to UI Mapping",
    description: "Shows exactly which prompt idea powers each frontend section.",
    icon: MapPin,
    href: "../PROMPT_TO_UI.md"
  },
  {
    title: "Backend Contract",
    description: "Documents gateway endpoints, upload flow, and API headers.",
    icon: ShieldCheck,
    href: "../../services/api_gateway/app/api/routes.py"
  },
  {
    title: "UI Architecture",
    description: "Describes the component-driven frontend structure and design system.",
    icon: Layers3,
    href: "../README.md"
  }
];

function DocsPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl space-y-10 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section id="docs" className="glass-card p-8 sm:p-10">
        <div className="flex items-center gap-3 text-cyan-200">
          <BookOpen className="h-5 w-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">Docs Page</p>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
          Where the prompt becomes product
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          This page connects the UI prompt to the actual graphics and components in the frontend so you can inspect the
          implementation rather than wondering where the concept went.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {docCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass-card hover-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
              <Button variant="outline" className="mt-5 border-white/20 bg-white/5 text-white hover:bg-white/10">
                Open <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export { DocsPage };
