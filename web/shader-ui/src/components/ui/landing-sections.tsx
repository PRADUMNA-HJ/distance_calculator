import {
  Camera,
  CircleDot,
  Crosshair,
  MoveRight,
  ScanEye,
  SquareDashed,
  Sparkles,
  Target,
  TimerReset,
  Workflow
} from "lucide-react";

import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Camera Capture",
    description: "Launch your camera, upload a frame, or inspect a live scene with premium HUD overlays.",
    icon: Camera
  },
  {
    title: "Draw & Mark Objects",
    description: "Use points, boxes, lines, and polygon tools to define the subject with surgical precision.",
    icon: Crosshair
  },
  {
    title: "AI Distance Estimation",
    description: "Translate visual geometry into estimated distances with responsive labels and live feedback.",
    icon: ScanEye
  },
  {
    title: "Real Time Detection",
    description: "AI boxes, scan pulses, and object tracking visuals stay active as the scene updates.",
    icon: Target
  }
];

const stats = [
  { value: "98.4%", label: "visual confidence" },
  { value: "12ms", label: "overlay response" },
  { value: "3.2x", label: "faster marking" },
  { value: "24/7", label: "AI monitoring" }
];

const useCases = [
  {
    title: "Robotics",
    description: "Guide autonomous systems with spatial awareness and object anchoring.",
    icon: Workflow
  },
  {
    title: "Surveying",
    description: "Estimate field distances and reference objects from image capture.",
    icon: SquareDashed
  },
  {
    title: "Smart Vision",
    description: "Turn everyday camera input into annotated, measurable intelligence.",
    icon: CircleDot
  }
];

function LandingSections() {
  return (
    <>
      <section className="grid gap-5 md:grid-cols-4" id="features">
        {featureCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="glass-card hover-lift reveal-item"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]" id="demo">
        <article className="glass-card overflow-hidden p-0">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Main Demo</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Interactive computer vision workbench</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Upload or capture an image, switch draw modes, place distance labels above or beside the object, and watch AI overlays react live.
            </p>
          </div>

          <div className="grid gap-0 border-t border-white/10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[520px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_42%),linear-gradient(180deg,rgba(4,7,14,0.25),rgba(4,7,14,0.92))] p-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
              <div className="relative h-full rounded-[28px] border border-cyan-300/20 bg-black/30 p-4 shadow-[0_0_50px_rgba(45,212,191,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Camera Viewport</p>
                    <h3 className="text-xl font-semibold text-white">Scan-ready scene</h3>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Live AI
                  </div>
                </div>

                <div className="relative mt-4 overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.25),transparent_36%),linear-gradient(180deg,rgba(13,18,32,0.95),rgba(7,10,20,1))] p-5">
                  <div className="absolute inset-x-8 top-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-70 scan-line" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-200/70 to-transparent opacity-50" />
                  <div className="grid min-h-[420px] place-items-center rounded-[22px] border border-white/8 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center p-4">
                    <div className="relative h-[360px] w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/10 bg-black/45 shadow-2xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_25%),radial-gradient(circle_at_75%_65%,rgba(236,72,153,0.16),transparent_22%)]" />
                      <div className="hud-box hud-box-one">Human detected</div>
                      <div className="hud-box hud-box-two">Distance 4.2m</div>
                      <div className="hud-reticle" />
                      <div className="measurement-line measurement-line-a" />
                      <div className="measurement-line measurement-line-b" />
                      <div className="distance-label distance-top">Label above object</div>
                      <div className="distance-label distance-side">Label beside object</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4 border-t border-white/10 bg-white/5 p-5 lg:border-l lg:border-t-0">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Tool panel</p>
                  <TimerReset className="h-4 w-4 text-cyan-200" />
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    "Camera Upload",
                    "Draw Mode",
                    "Bounding Box",
                    "Polygon Points",
                    "Label Position"
                  ].map((item, index) => (
                    <button
                      key={item}
                      className="tool-button"
                      type="button"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Label placement</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="placement-chip">Above</div>
                  <div className="placement-chip">Side</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  The label automatically sits above the object when there is space. When the scene is tight, it shifts to the side with a connector line.
                </p>
              </div>
            </aside>
          </div>
        </article>

        <article className="glass-card">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">AI Analysis Panel</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Detection overlays and real-time data</h3>
          <div className="mt-6 space-y-4">
            {[
              { label: "Object Confidence", value: "97.8%" },
              { label: "Estimated Distance", value: "4.2 m" },
              { label: "Overlay Mode", value: "Glowing HUD" },
              { label: "Annotation Status", value: "Active" }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 progress-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" id="how-it-works">
        <article className="glass-card">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">How It Works</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Fast futuristic workflow</h3>
          <div className="mt-6 space-y-5">
            {[
              ["Capture", "Use camera or upload an image."],
              ["Mark", "Tap points or draw a box/polygon."],
              ["Estimate", "AI generates distance and overlay."],
              ["Place label", "Above or beside the object automatically."]
            ].map(([title, copy], index) => (
              <div key={title} className="timeline-row">
                <div className="timeline-dot">0{index + 1}</div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Accuracy Stats</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Animated metrics that feel alive</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/6 p-5 text-center">
                <p className="text-3xl font-bold text-white stat-glow">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-5">
            <p className="text-sm leading-7 text-slate-200">
              Designed for robotics, surveying, and smart vision workflows where object targeting, distance prediction, and premium visual clarity matter.
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-3" id="docs">
        {useCases.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass-card hover-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="glass-card mt-1 overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Final CTA</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Launch a sci-fi measurement experience</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Combine camera capture, object annotations, AI overlays, and responsive distance labels into one dramatic interface that feels premium and production-ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-slate-950">
                Launch Camera <MoveRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/12">
                Try Demo
              </Button>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.2),transparent_30%),linear-gradient(180deg,rgba(20,26,40,0.95),rgba(6,10,18,1))] p-6">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Measuring Engine</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                Online
              </span>
            </div>
            <div className="mt-6 grid place-items-center rounded-[30px] border border-white/10 bg-black/30 p-8">
              <div className="measurement-ring">
                <div className="measurement-core">AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export { LandingSections };
