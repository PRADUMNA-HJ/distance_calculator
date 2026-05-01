import { BackendConsole } from "@/components/ui/backend-console";
import { UiShell } from "@/components/ui/ui-shell";

function DemoPage() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl space-y-10 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section id="demo" className="glass-card overflow-hidden p-0">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Demo Page</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Interactive measurement console
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            This page focuses on the actual workflow: upload or capture an image, draw and mark objects, run prediction,
            and see AI labels and responses in one control surface.
          </p>
        </div>
      </section>

      <BackendConsole />
      <UiShell />
    </main>
  );
}

export { DemoPage };
