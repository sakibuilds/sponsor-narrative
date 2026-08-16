"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyInput, type ProposalInput } from "../lib/types";
import { buildProposal } from "../lib/generator";
import {
  Input,
  Area,
  LinesEditor,
  Label,
  ThemesEditor,
  QuartersEditor,
  AnglesEditor,
  OptionsEditor,
} from "../components/editors";
import ProposalView from "../components/ProposalView";

const STORAGE_KEY = "sponsor-narrative-draft-v1";

function Group({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div>
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <p className="text-[12px] text-muted">{subtitle}</p>
        </div>
        <span
          className={`text-muted transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open ? <div className="space-y-4 border-t border-line px-4 py-4">{children}</div> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function Page() {
  const [input, setInput] = useState<ProposalInput>(emptyInput);
  const [loaded, setLoaded] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    market: true,
    program: true,
    value: false,
    position: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...emptyInput, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt drafts
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      // storage full or blocked — non-fatal
    }
  }, [input, loaded]);

  const set = useCallback(
    <K extends keyof ProposalInput>(key: K, val: ProposalInput[K]) =>
      setInput((s) => ({ ...s, [key]: val })),
    []
  );

  const reset = useCallback(() => {
    setInput(emptyInput);
  }, []);

  const toggleGroup = useCallback((g: string) => {
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  }, []);

  const sections = useMemo(() => buildProposal(input), [input]);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
              Sponsor Narrative
            </h1>
            <p className="text-[13px] text-muted">
              The 9-part annual sponsorship proposal structure — market problem first, pricing out,
              one clear recommendation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-medium text-muted">
              Draft autosaves in this browser
            </span>
            <button
              onClick={reset}
              className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-warn transition hover:bg-warn/5"
            >
              Reset draft
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        {/* Input panel */}
        <div className="space-y-4">
          <Group
            title="1 · Market & Gap"
            subtitle="The problem-first opening — executive summary, pain points, regulatory clock"
            open={openGroups.market}
            onToggle={() => toggleGroup("market")}
          >
            <Field label="Industry / sector">
              <Input value={input.sector} onChange={(v) => set("sector", v)} placeholder="e.g. digital payments, telecom policy, AI governance" />
            </Field>
            <Field label="Program type">
              <Input value={input.programType} onChange={(v) => set("programType", v)} placeholder="e.g. annual policy partnership" />
            </Field>
            <Field label="Program name">
              <Input value={input.programName} onChange={(v) => set("programName", v)} placeholder="e.g. Digital Payments Policy Partnership" />
            </Field>
            <Field label="Executive summary — market diagnosis">
              <Area value={input.execMarket} onChange={(v) => set("execMarket", v)} placeholder="One paragraph: the market tension / regulatory phase forcing this conversation. Do not start with 'We are…'" />
            </Field>
            <Field label="Gap statement">
              <Area value={input.gapStatement} onChange={(v) => set("gapStatement", v)} rows={2} placeholder="e.g. There is no neutral, high-trust forum where X gets discussed. This partnership creates one." />
            </Field>
            <LinesEditor
              value={input.painPoints}
              onChange={(v) => set("painPoints", v)}
              placeholder={"e.g. The 30% cap deadline is months away and the industry has no consensus on compliance"}
              hint="3–5 pain points — external market/regulatory, not the sponsor's internal problems"
            />
            <LinesEditor
              value={input.regulatoryHooks}
              onChange={(v) => set("regulatoryHooks", v)}
              placeholder={"e.g. RBI Payments Vision 2028 — 15 new initiatives requiring compliance investment"}
              hint="Dated developments & references that create urgency"
            />
          </Group>

          <Group
            title="2 · The Program"
            subtitle="Core themes and the quarterly structure"
            open={openGroups.program}
            onToggle={() => toggleGroup("program")}
          >
            <div className="space-y-1.5">
              <Label hint="Theme | Why it matters | Regulatory hook">Core themes</Label>
              <ThemesEditor rows={input.themes} onChange={(v) => set("themes", v)} />
            </div>
            <div className="space-y-1.5">
              <Label hint="Quarter | Activity | Format | Audience — do not over-promise on regulator attendance">
                Quarterly structure
              </Label>
              <QuartersEditor rows={input.quarters} onChange={(v) => set("quarters", v)} />
            </div>
          </Group>

          <Group
            title="3 · Value & Structure"
            subtitle="Why it's valuable, the three options, deliverables, success measures"
            open={openGroups.value}
            onToggle={() => toggleGroup("value")}
          >
            <div className="space-y-1.5">
              <Label hint="Max 5. Strategic first, transactional last. No 'brand visibility / networking'.">
                Value angles
              </Label>
              <AnglesEditor rows={input.angles} onChange={(v) => set("angles", v)} />
            </div>
            <div className="space-y-1.5">
              <Label hint="Offer three: (A) Recommended/Annual, (B) Quarterly/Reduced, (C) Single/Signature. No prices.">
                Sponsorship options
              </Label>
              <OptionsEditor rows={input.options} onChange={(v) => set("options", v)} />
            </div>
            <LinesEditor
              value={input.perEngagement}
              onChange={(v) => set("perEngagement", v)}
              placeholder={"e.g. Curated, invite-only audience with verified policymaker participation"}
              hint="Per-engagement deliverables"
            />
            <LinesEditor
              value={input.annualAdds}
              onChange={(v) => set("annualAdds", v)}
              placeholder={"e.g. Private quarterly dinners with the sponsor's chosen stakeholders"}
              hint="What the annual structure adds"
            />
            <LinesEditor
              value={input.successMetrics}
              onChange={(v) => set("successMetrics", v)}
              placeholder={"e.g. Number of direct policymaker interactions across the partnership year"}
              hint="Measurable outcomes (4–6), not impressions"
            />
          </Group>

          <Group
            title="4 · Positioning & Close"
            subtitle="Convener identity, the relationship note, and the specific next step"
            open={openGroups.position}
            onToggle={() => toggleGroup("position")}
          >
            <Field label="Convener / publisher name">
              <Input value={input.convener} onChange={(v) => set("convener", v)} placeholder="e.g. your publication or studio name" />
            </Field>
            <Field label="Sponsor name">
              <Input value={input.sponsorName} onChange={(v) => set("sponsorName", v)} placeholder="e.g. Sponsor Inc." />
            </Field>
            <Field label="Why partner with you — positioning statement">
              <Area value={input.whyPartner} onChange={(v) => set("whyPartner", v)} placeholder="Why you are the right convener: track record with the regulator ecosystem, trusted relationships. Not a bio." />
            </Field>
            <Field label="Existing relationship note">
              <Area value={input.relationshipNote} onChange={(v) => set("relationshipNote", v)} rows={2} placeholder='e.g. "You have already sponsored earlier engagements — this is the next step."' />
            </Field>
            <LinesEditor
              value={input.nextAgenda}
              onChange={(v) => set("nextAgenda", v)}
              placeholder={"e.g. Which policy themes to prioritise in the first quarter"}
              hint="3–4 agenda items for the 30-minute conversation"
            />
            <Field label="Close deadline">
              <Input value={input.closeDeadline} onChange={(v) => set("closeDeadline", v)} placeholder="e.g. end of week" />
            </Field>
          </Group>
        </div>

        {/* Output panel */}
        <ProposalView input={input} sections={sections} />
      </div>
    </main>
  );
}