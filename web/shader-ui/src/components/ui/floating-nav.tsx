import { ArrowRight } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "Docs", href: "#docs" }
];

function FloatingNav() {
  return (
    <div className="fixed left-1/2 top-5 z-50 w-[min(1120px,calc(100vw-1.5rem))] -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-white/15 bg-white/8 px-4 py-3 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            AI
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Distance Vision</p>
            <p className="text-sm font-semibold text-white">Measure with AI Precision</p>
          </div>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-medium text-slate-200 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#launch-app"
            className="hidden rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12 sm:inline-flex"
          >
            Launch App
          </a>
          <a
            href="#demo"
            className="group inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.35)] transition hover:brightness-110"
          >
            Demo <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export { FloatingNav };
