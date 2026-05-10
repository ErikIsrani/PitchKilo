"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StakeholderKey = "eng-manager" | "cto" | "cfo" | "ciso";
type TemplateKey = "slack" | "email-manager" | "email-leadership";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Stakeholders", href: "#stakeholders" },
  { label: "ROI Calculator", href: "#roi" },
  { label: "Templates", href: "#templates" },
  { label: "Get Started", href: "#get-started" },
];

const STAKEHOLDERS: {
  key: StakeholderKey;
  icon: string;
  title: string;
  desc: string;
}[] = [
  {
    key: "eng-manager",
    icon: "⬡",
    title: "Engineering Manager",
    desc: "They want their team shipping faster. Show them the productivity case.",
  },
  {
    key: "cto",
    icon: "◈",
    title: "CTO / VP Engineering",
    desc: "They want no lock-in and no black boxes. Show them the technical case.",
  },
  {
    key: "cfo",
    icon: "◇",
    title: "CFO / Finance",
    desc: "They want to know what it costs and what it returns. Show them the numbers.",
  },
  {
    key: "ciso",
    icon: "◉",
    title: "CISO / IT / Security",
    desc: "They want to know what leaves the building. Show them the security brief.",
  },
];

const STAKEHOLDER_PANELS: Record<
  StakeholderKey,
  { headline: string; body: string; bullets: string[]; cta: string; ctaHref?: string }
> = {
  "eng-manager": {
    headline: "Your team is spending time they don't have to spend.",
    body: "Boilerplate, code review, context-switching — it adds up. Kilo handles the parts that slow developers down so they can stay on the work that actually matters.",
    bullets: [
      "Parallel agents let developers run multiple tasks without blocking each other",
      "Session continuity means context doesn't get lost between devices or handoffs",
      "Works inside the tools your team already uses — VS Code, JetBrains, CLI",
    ],
    cta: "See the 30-day pilot plan →",
  },
  cto: {
    headline: "Open source, open pricing, no lock-in.",
    body: "Most AI coding tools make the same bet: pick our model, pay our markup, migrate when we say so. Kilo doesn't work that way. The code is public, the pricing is pass-through, and you can point it at any model — including ones running on your own infrastructure.",
    bullets: [
      "500+ models available — switch based on task, cost, or compliance requirements",
      "Self-hostable — run it entirely inside your own environment",
      "Open source — your security team can read the code, not just the whitepaper",
    ],
    cta: "See the 30-day pilot plan →",
  },
  cfo: {
    headline: "You're paying for developer time. This multiplies it.",
    body: "No per-seat subscriptions. No markup on tokens. You pay provider cost for what you use — nothing more. Run the numbers below with your team size and current tooling spend.",
    bullets: [
      "Token-based pricing at provider cost — no markup",
      "Replaces or consolidates other AI tooling spend",
      "Open source core means no licensing fees",
    ],
    cta: "Jump to the ROI calculator →",
    ctaHref: "#roi",
  },
  ciso: {
    headline: "Your code doesn't leave unless you say so.",
    body: "Local mode means nothing leaves the machine. Cloud agents run in your VPC. The codebase is open source — your team can audit exactly what it does and doesn't do. And because Kilo supports any model endpoint, you can point it at an on-premises or compliant model if your requirements demand it.",
    bullets: [
      "Local mode: code stays on the developer's machine",
      "VPC deployment available for Teams and Enterprise",
      "Open source: no black box, no trust-us security claims",
      "Model flexibility: use compliant or on-prem endpoints",
    ],
    cta: "See the full security brief →",
  },
};

const COMPARISON_ROWS = [
  { label: "Open source", kilo: true, cursor: false, copilot: false, claude: false },
  { label: "BYOK (Bring Your Own Key)", kilo: true, cursor: "partial", copilot: false, claude: true },
  { label: "Self-hostable", kilo: true, cursor: false, copilot: false, claude: false },
  { label: "Price", kilo: "Free / BYOK", cursor: "$20/mo", copilot: "$19/mo", claude: "Usage" },
  { label: "Multi-agent", kilo: true, cursor: "partial", copilot: false, claude: true },
  { label: "Audit logs", kilo: true, cursor: false, copilot: "partial", claude: false },
];

const OBJECTIONS = [
  { q: "[ Objection question 1 — security or compliance concern ]", a: "[ Detailed answer addressing the security/compliance concern with supporting evidence ]" },
  { q: "[ Objection question 2 — cost or ROI concern ]", a: "[ Detailed answer addressing cost and return on investment with concrete numbers ]" },
  { q: "[ Objection question 3 — integration or setup complexity ]", a: "[ Detailed answer explaining the onboarding process and integration simplicity ]" },
  { q: "[ Objection question 4 — vendor lock-in concern ]", a: "[ Detailed answer explaining open-source nature and data portability ]" },
  { q: "[ Objection question 5 — support or reliability concern ]", a: "[ Detailed answer covering SLA, community, and enterprise support options ]" },
];

const TEMPLATES: Record<TemplateKey, { label: string; content: string }> = {
  slack: {
    label: "Slack to manager",
    content: `hey — i've been using kilo code for a few weeks and it's meaningfully changed how fast i'm shipping. wanted to flag it as something worth looking at for the team.

it's open source, works in vs code and jetbrains, and you pay token costs at provider rates — no per-seat markup. we could run a low-lift pilot with [number] of us for 30 days without disrupting anything.

happy to send more info or jump on a quick call if you want the details. worth 15 minutes?`,
  },
  "email-manager": {
    label: "Email to manager",
    content: `Subject: Worth looking at — AI coding tool that might save the team real time

Hi [Name],

I've been using Kilo Code for the past few weeks and wanted to make a case for getting the team on it.

The short version: it's an open-source AI coding assistant that works across VS Code, JetBrains, and CLI. Unlike Copilot or Cursor, you're not locked into one model or paying per-seat markups — you pay token costs at provider rates and can switch models anytime.

A few things that stood out to me:
- Parallel agents mean I can work on multiple tasks without context-switching
- Session continuity keeps my work in sync across devices
- The codebase is open source, so security can audit it directly

I'd suggest a 30-day pilot with [number] developers. No migration, no disruption — just a side-by-side comparison with what we're already using.

Happy to put together a fuller brief or jump on a call. Let me know if it's worth 15 minutes.

[Your name]`,
  },
  "email-leadership": {
    label: "Email to leadership",
    content: `Subject: Open-source AI coding platform — case for a pilot

Hi [Name],

I wanted to flag Kilo Code as something worth evaluating at the team level.

It's an open-source agentic coding platform — VS Code, JetBrains, CLI, and web — with a few properties that differentiate it from what most teams are using:

- Open pricing: you pay token costs at provider rates, no markup
- Model freedom: 500+ models, switch anytime, point it at on-prem endpoints if needed
- Open source: MIT-licensed, fully auditable, self-hostable
- No lock-in: if we ever want to move off it, the license allows forking and self-hosting

It's already at 1M users and is the #1 app on OpenRouter. This isn't an early-stage bet.

I'd like to propose a 30-day pilot with [number] developers. I can put together an ROI brief and security summary if that would help move it forward.

Worth a conversation?

[Your name]`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(target);
  const rafRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();

    cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * ease));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function smoothScrollTo(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block text-[#fa483a]">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block text-[#a0a0a0]">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PartialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block text-[#a0a0a0]">
      <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return <CheckIcon />;
  if (val === false) return <CrossIcon />;
  if (val === "partial") return <PartialIcon />;
  return <span className="text-[#a0a0a0] font-mono text-xs">{val}</span>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Nav({ active }: { active: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a35]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo mark */}
        <span className="text-white font-semibold text-sm tracking-tight select-none">
          kilo<span className="text-[#fa483a]">.</span>
        </span>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.replace("#", "");
            const isActive = active === id;
            return (
              <li key={href}>
                <button
                  onClick={() => smoothScrollTo(href)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "text-white bg-[#14141a]"
                      : "text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile nav — simple text links */}
        <ul className="flex md:hidden items-center gap-3">
          {NAV_LINKS.slice(0, 3).map(({ label, href }) => (
            <li key={href}>
              <button
                onClick={() => smoothScrollTo(href)}
                className="text-[#a0a0a0] hover:text-white text-xs transition-colors cursor-pointer"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="overview" className="pt-32 pb-24 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
      {/* Eyebrow */}
      <span className="inline-flex items-center gap-2 text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-6 px-3 py-1 rounded-full border border-[#2a2a35]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#fa483a] animate-pulse" />
        [ Eyebrow label ]
      </span>

      <h1
        data-placeholder-id="hero-headline"
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
      >
        You use Kilo.{" "}
        <span className="text-[#a0a0a0]">Now get your</span>{" "}
        company on it.
      </h1>

      <p
        data-placeholder-id="hero-subhead"
        className="text-lg sm:text-xl text-[#a0a0a0] max-w-2xl leading-relaxed mb-16"
      >
        You&apos;ve already seen what it can do. This kit gives you the business case, the talking points, and the emails — so you&apos;re not starting from scratch.
      </p>

      {/* Scroll nudge — not a button */}
      <button
        onClick={() => smoothScrollTo("#stakeholders")}
        className="flex flex-col items-center gap-2 text-[#a0a0a0]/60 hover:text-[#a0a0a0] transition-colors duration-200 cursor-pointer group bg-transparent border-0 p-0"
        aria-label="Scroll to stakeholder selector"
      >
        <span className="text-sm tracking-wide">Who are you pitching?</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="animate-bounce"
        >
          <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}

function SocialProofStrip() {
  const logos = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <section className="border-t border-b border-[#2a2a35] bg-[#14141a] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Trusted by row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 justify-center">
          <span className="text-[#a0a0a0] text-sm whitespace-nowrap">Trusted by teams at</span>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {logos.map((n) => (
              <div
                key={n}
                className="w-20 h-7 rounded bg-[#2a2a35] opacity-50 flex items-center justify-center"
                aria-label={`Logo placeholder ${n}`}
              >
                <span className="text-[#a0a0a0] text-xs font-mono">logo {n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {["18+ model providers", "MIT-licensed", "Zero markup on AI costs"].map((stat) => (
            <span
              key={stat}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2a2a35] text-white text-sm font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#fa483a]" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function StakeholderSelector() {
  const [selected, setSelected] = useState<StakeholderKey | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSelect = (key: StakeholderKey) => {
    if (selected === key) {
      setSelected(null);
    } else {
      setSelected(key);
      // Scroll to panel after short delay for animation
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  const s = selected;

  return (
    <section id="stakeholders" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-3">[ Section label ]</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Who are you pitching?</h2>
          <p className="mt-3 text-[#a0a0a0] text-base max-w-xl">Pick the person signing off. We&apos;ll show you what matters to them.</p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAKEHOLDERS.map(({ key, icon, title, desc }) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`group text-left rounded-xl p-6 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#fa483a] bg-[#14141a] shadow-lg shadow-[#fa483a]/10"
                    : "border-[#2a2a35] bg-[#14141a] hover:border-[#fa483a]/40 hover:bg-[#1a1a22]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`text-2xl transition-colors ${isSelected ? "text-[#fa483a]" : "text-[#a0a0a0] group-hover:text-[#fa483a]/70"}`}
                  >
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-base">{title}</h3>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#fa483a] shrink-0" />
                      )}
                    </div>
                    <p className="text-[#a0a0a0] text-sm mt-1 leading-snug">{desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div
          ref={panelRef}
          className={`overflow-hidden transition-all duration-300 ease-out ${
            s ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none h-0"
          }`}
          style={{
            transform: s ? "translateY(0)" : "translateY(12px)",
          }}
        >
          {s && (() => {
            const panel = STAKEHOLDER_PANELS[s];
            return (
              <div className="mt-4 rounded-xl border border-[#2a2a35] bg-[#14141a] p-8">
                <h3
                  data-placeholder-id={`${s}-panel-headline`}
                  className="text-2xl font-bold text-white mb-3"
                >
                  {panel.headline}
                </h3>
                <p className="text-[#a0a0a0] text-sm leading-relaxed mb-6">
                  {panel.body}
                </p>
                <ul className="space-y-3 mb-8">
                  {panel.bullets.map((bullet, n) => (
                    <li key={n} className="flex items-start gap-3">
                      <span className="mt-1 w-4 h-4 rounded-sm border border-[#fa483a]/40 bg-[#fa483a]/10 shrink-0 flex items-center justify-center">
                        <CheckIcon />
                      </span>
                      <span
                        data-placeholder-id={`${s}-bullet-${n + 1}`}
                        className="text-[#a0a0a0] text-sm leading-relaxed"
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  data-placeholder-id={`${s}-cta`}
                  onClick={() => panel.ctaHref && smoothScrollTo(panel.ctaHref)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#fa483a] hover:bg-[#e03e2f] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {panel.cta}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const tools = ["Kilo", "Cursor", "Copilot", "Claude Code"];

  return (
    <section className="py-24 px-6 bg-[#14141a]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-3">[ Section label ]</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">[ Comparison headline ]</h2>
          <p className="mt-3 text-[#a0a0a0] text-base max-w-xl">[ One-sentence framing for the comparison. ]</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2a2a35]">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a35]">
                <th className="text-left px-5 py-4 text-[#a0a0a0] text-xs font-mono uppercase tracking-wider w-[35%]">
                  Feature
                </th>
                {tools.map((tool, i) => (
                  <th
                    key={tool}
                    className={`text-center px-4 py-4 text-sm font-semibold ${
                      i === 0 ? "text-[#fa483a]" : "text-[#a0a0a0]"
                    }`}
                  >
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fa483a]" />
                        {tool}
                      </span>
                    )}
                    {i !== 0 && tool}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map(({ label, kilo, cursor, copilot, claude }, idx) => (
                <tr
                  key={label}
                  className={`border-b border-[#2a2a35] last:border-0 ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-[#0f0f15]"
                  }`}
                >
                  <td className="px-5 py-3.5 text-[#a0a0a0] text-sm font-mono">{label}</td>
                  <td className="px-4 py-3.5 text-center bg-[#fa483a]/5">
                    <CellValue val={kilo} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <CellValue val={cursor} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <CellValue val={copilot} />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <CellValue val={claude} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[#a0a0a0] text-xs">[ Table footnote / data source disclaimer ]</p>
      </div>
    </section>
  );
}

function ROICalculator() {
  const [devs, setDevs] = useState(50);
  const [rate, setRate] = useState(75);
  const [spend, setSpend] = useState(1000);

  const rawSavings = devs * 3 * rate * 48 - spend * 12;
  const animatedSavings = useCountUp(rawSavings);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <section id="roi" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-3">[ Section label ]</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Does the math work for your team?</h2>
          <p className="mt-3 text-[#a0a0a0] text-base max-w-xl">Put in your numbers. See what Kilo is worth.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6 rounded-xl border border-[#2a2a35] bg-[#14141a] p-8">
            {/* Dev count */}
            <div>
              <label
                data-placeholder-id="roi-devs"
                className="block text-white text-sm font-medium mb-2"
              >
                Number of developers
              </label>
              <input
                type="number"
                min={1}
                value={devs}
                onChange={(e) => setDevs(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#0a0a0f] border border-[#2a2a35] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#fa483a]/60 transition-colors"
              />
              <p className="mt-1.5 text-[#a0a0a0] text-xs">Include everyone who writes or reviews code</p>
            </div>

            {/* Hourly rate */}
            <div>
              <label
                data-placeholder-id="roi-rate"
                className="block text-white text-sm font-medium mb-2"
              >
                Average hourly rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] font-mono text-sm">$</span>
                <input
                  type="number"
                  min={1}
                  value={rate}
                  onChange={(e) => setRate(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a35] rounded-lg pl-8 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#fa483a]/60 transition-colors"
                />
              </div>
              <p className="mt-1.5 text-[#a0a0a0] text-xs">Fully loaded cost — salary, benefits, overhead</p>
            </div>

            {/* Current spend */}
            <div>
              <label
                data-placeholder-id="roi-spend"
                className="block text-white text-sm font-medium mb-2"
              >
                Current monthly AI tooling spend (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a0] font-mono text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={spend}
                  onChange={(e) => setSpend(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0a0a0f] border border-[#2a2a35] rounded-lg pl-8 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#fa483a]/60 transition-colors"
                />
              </div>
              <p className="mt-1.5 text-[#a0a0a0] text-xs">Copilot, Cursor, ChatGPT — add them up</p>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-xl border border-[#fa483a]/30 bg-[#14141a] p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#a0a0a0] text-sm mb-2">Estimated annual savings</p>
              <div
                data-placeholder-id="roi-output"
                className={`text-5xl sm:text-6xl font-bold tracking-tight ${
                  animatedSavings >= 0 ? "text-[#fa483a]" : "text-[#a0a0a0]"
                }`}
              >
                {animatedSavings < 0 ? "-" : ""}
                {fmt(Math.abs(animatedSavings))}
              </div>
              <p className="mt-3 text-[#a0a0a0] text-xs leading-relaxed">Based on 2 hours saved per developer per day at your hourly rate, minus Kilo&apos;s token costs at provider pricing.</p>
            </div>

            {/* Breakdown */}
            <div className="mt-8 space-y-2 border-t border-[#2a2a35] pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Developer time recovered</span>
                <span className="text-white font-mono">{fmt(devs * 3 * rate * 48)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">Current tooling cost (annual)</span>
                <span className="text-white font-mono">- {fmt(spend * 12)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#2a2a35] pt-2 mt-2">
                <span className="text-[#a0a0a0] font-medium">Net savings</span>
                <span className={`font-mono font-bold ${animatedSavings >= 0 ? "text-[#fa483a]" : "text-[#a0a0a0]"}`}>
                  {fmt(rawSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-[#a0a0a0]/60 text-xs leading-relaxed max-w-2xl">
          This is an estimate. Actual results depend on usage, team size, and model selection. We&apos;re not going to promise you a number we can&apos;t back up.
        </p>
      </div>
    </section>
  );
}

function ObjectionHandler() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-24 px-6 bg-[#14141a]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-3">[ Section label ]</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">[ Objections section headline ]</h2>
          <p className="mt-3 text-[#a0a0a0] text-base max-w-xl">[ Section subhead addressing common questions. ]</p>
        </div>

        <div className="space-y-2">
          {OBJECTIONS.map(({ q, a }, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors duration-200 ${
                  isOpen ? "border-[#fa483a]/40" : "border-[#2a2a35]"
                } bg-[#0a0a0f] overflow-hidden`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer"
                >
                  <span
                    data-placeholder-id={`objection-q-${idx + 1}`}
                    className="text-white text-sm font-medium pr-4"
                  >
                    {q}
                  </span>
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                      isOpen
                        ? "border-[#fa483a] bg-[#fa483a]/10 rotate-45"
                        : "border-[#2a2a35] group-hover:border-[#fa483a]/50"
                    }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2v6M2 5h6" stroke={isOpen ? "#fa483a" : "#a0a0a0"} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {/* Animated answer */}
                <div
                  style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    transition: "max-height 200ms ease-out",
                    overflow: "hidden",
                  }}
                >
                  <p
                    data-placeholder-id={`objection-a-${idx + 1}`}
                    className="px-6 pb-5 text-[#a0a0a0] text-sm leading-relaxed border-t border-[#2a2a35] pt-4"
                  >
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TemplatesSection() {
  const [activeTab, setActiveTab] = useState<TemplateKey>("slack");
  const [copiedTab, setCopiedTab] = useState<TemplateKey | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopy = useCallback(
    async (key: TemplateKey) => {
      await navigator.clipboard.writeText(TEMPLATES[key].content);
      setCopiedTab(key);
      setTimeout(() => setCopiedTab(null), 1500);
    },
    []
  );

  const handleCopyAll = useCallback(async () => {
    const all = (Object.keys(TEMPLATES) as TemplateKey[])
      .map((k) => `=== ${TEMPLATES[k].label} ===\n\n${TEMPLATES[k].content}`)
      .join("\n\n\n");
    await navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }, []);

  const tabKeys = Object.keys(TEMPLATES) as TemplateKey[];

  return (
    <section id="templates" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-[#fa483a] text-xs font-mono uppercase tracking-widest mb-3">[ Section label ]</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Ready to send.</h2>
          <p className="mt-3 text-[#a0a0a0] text-base max-w-xl">Pick your format. Edit the brackets. Hit send.</p>
        </div>

        {/* Copy all button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a35] text-[#a0a0a0] hover:text-white hover:border-[#fa483a]/50 text-sm font-medium transition-colors cursor-pointer"
          >
            {copiedAll ? (
              <>
                <CheckIcon /> Copied all!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5 3V2.5A1.5 1.5 0 0 1 6.5 1h4A1.5 1.5 0 0 1 12 2.5v7A1.5 1.5 0 0 1 10.5 11H10" stroke="currentColor" strokeWidth="1.3" /></svg>
                Copy entire pitch kit
              </>
            )}
          </button>
        </div>

        {/* Tab bar — desktop */}
        <div className="hidden md:flex items-center border-b border-[#2a2a35] mb-0">
          {tabKeys.map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                  isActive
                    ? "border-[#fa483a] text-white"
                    : "border-transparent text-[#a0a0a0] hover:text-white"
                }`}
              >
                {TEMPLATES[key].label}
              </button>
            );
          })}
        </div>

        {/* Dropdown — mobile */}
        <div className="md:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TemplateKey)}
            className="w-full bg-[#14141a] border border-[#2a2a35] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#fa483a]/60"
          >
            {tabKeys.map((key) => (
              <option key={key} value={key}>
                {TEMPLATES[key].label}
              </option>
            ))}
          </select>
        </div>

        {/* Template content */}
        <div className="rounded-b-xl md:rounded-t-none rounded-xl border border-[#2a2a35] border-t-0 md:border-t-0 bg-[#14141a] overflow-hidden">
          {tabKeys.map((key) => (
            <div key={key} className={activeTab === key ? "block" : "hidden"}>
              <div className="relative p-6 sm:p-8">
                {/* Copy button — top-right of text block */}
                <button
                  onClick={() => handleCopy(key)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#2a2a35] bg-[#0a0a0f] text-[#a0a0a0] hover:text-white hover:border-[#fa483a]/50 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copiedTab === key ? (
                    <>
                      <CheckIcon /> Copied!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5 3V2.5A1.5 1.5 0 0 1 6.5 1h4A1.5 1.5 0 0 1 12 2.5v7A1.5 1.5 0 0 1 10.5 11H10" stroke="currentColor" strokeWidth="1.3" /></svg>
                      Copy
                    </>
                  )}
                </button>
                <pre
                  data-placeholder-id={`template-${key}`}
                  className="text-[#a0a0a0] text-sm leading-relaxed whitespace-pre-wrap font-sans pr-20"
                >
                  {TEMPLATES[key].content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Note below tabs */}
        <p className="mt-4 text-[#a0a0a0]/60 text-xs italic">
          These are starting points, not scripts. Change whatever doesn&apos;t sound like you.
        </p>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section id="get-started" className="py-28 px-6 bg-[#14141a] border-t border-[#2a2a35]">
      <div className="max-w-3xl mx-auto text-center">
        {/* Decorative grid dot */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-5 gap-1.5 opacity-30">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[#fa483a]" />
            ))}
          </div>
        </div>

        <h2
          data-placeholder-id="footer-headline"
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4"
        >
          Ready to make the case?
        </h2>
        <p className="text-[#a0a0a0] text-lg mb-10">Start with the pilot. The rest follows.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            data-placeholder-id="footer-cta-1"
            href="https://app.kilo.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#fa483a] hover:bg-[#e03e2f] text-white text-sm font-semibold transition-colors"
          >
            Start a free pilot
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a
            data-placeholder-id="footer-cta-2"
            href="mailto:hi@kilocode.ai"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-[#2a2a35] hover:border-[#fa483a]/50 text-white text-sm font-semibold transition-colors"
          >
            Talk to the Kilo team
          </a>
        </div>
        <p className="mt-6 text-[#a0a0a0]/60 text-sm">
          No commitment. No migration. No sales call required unless you want one.
        </p>
      </div>

      {/* Minimal footer */}
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-[#2a2a35] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white font-semibold text-sm">
          kilo<span className="text-[#fa483a]">.</span>
        </span>
        <span className="text-[#a0a0a0] text-xs">[ Footer legal / copyright line ]</span>
        <div className="flex items-center gap-4">
          {["[ Link 1 ]", "[ Link 2 ]", "[ Link 3 ]"].map((l) => (
            <span key={l} className="text-[#a0a0a0] text-xs hover:text-white cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function KiloMicrosite() {
  const sectionIds = ["overview", "stakeholders", "roi", "templates", "get-started"];
  const active = useActiveSection(sectionIds);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0f", color: "#ffffff", fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}>
      <Nav active={active} />
      <main className="pt-14">
        <Hero />
        <SocialProofStrip />
        <StakeholderSelector />
        <ComparisonTable />
        <ROICalculator />
        <ObjectionHandler />
        <TemplatesSection />
        <FooterCTA />
      </main>
    </div>
  );
}
