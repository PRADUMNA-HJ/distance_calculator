import { Camera, ImageUp, Layers3, Ruler, ScanSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

const tools = [
  { name: "Camera", icon: Camera },
  { name: "Upload", icon: ImageUp },
  { name: "Draw", icon: ScanSearch },
  { name: "Measure", icon: Ruler }
];

function UiShell() {
  return (
    <section className="glass-card mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]" id="launch-app">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.95),rgba(8,10,16,1))] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Product Interface</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Selection, annotations, and distance output</h3>
            </div>
            <Layers3 className="h-5 w-5 text-fuchsia-300" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="demo-card">
              <p className="demo-label">Image selection</p>
              <div className="mt-3 rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center p-4">
                <div className="h-44 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md">
                  <div className="flex h-full flex-col justify-between">
                    <div className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs text-slate-200">
                      Drop or upload image here
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-200">
                      <span>Camera roll</span>
                      <span>PNG / JPG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-card">
              <p className="demo-label">Distance label placement</p>
              <div className="mt-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.9),rgba(3,7,18,1))] p-4">
                <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_40%_30%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(15,19,28,1),rgba(5,8,14,1))]">
                  <div className="absolute left-[30%] top-[28%] h-24 w-28 rounded-2xl border border-cyan-300/60 bg-cyan-300/10 pulse-box" />
                  <div className="absolute left-[38%] top-[20%] rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100 shadow-[0_0_18px_rgba(110,231,183,0.18)]">
                    Above label
                  </div>
                  <div className="absolute left-[63%] top-[35%] rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100 shadow-[0_0_18px_rgba(244,114,182,0.18)]">
                    Side label
                  </div>
                  <div className="absolute inset-x-4 bottom-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button key={tool.name} className="tool-button justify-center" type="button">
                <Icon className="h-4 w-4" />
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Side Panel</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">AI analysis controls</h3>
        <div className="mt-5 space-y-3">
          {[
            ["Auto detect", "On"],
            ["Target point", "Center"],
            ["Label mode", "Above / Side"],
            ["Overlay style", "HUD Neon"]
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="text-sm font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4">
          <p className="text-sm leading-7 text-slate-200">
            This shell is designed to hold the capture flow, the object annotation workspace, and the AI-generated measurement results in one polished, high-end interface.
          </p>
          <Button className="mt-5 w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-slate-950">
            Start Session
          </Button>
        </div>
      </aside>
    </section>
  );
}

export { UiShell };
