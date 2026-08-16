"use client";

import { useMemo, useState } from "react";
import type { ProposalInput } from "../lib/types";
import {
  buildProposal,
  sponsorMentionCount,
  hasPricing,
  genericPropsUsed,
  type Section,
} from "../lib/generator";

function sectionToText(s: Section): string {
  const lines: string[] = [`## ${s.n}. ${s.heading}`];
  s.items.forEach((it) => {
    if (it.kind === "bullet") lines.push(`- ${it.text}`);
    else if (it.kind === "number") lines.push(`${it.n}. ${it.text}`);
    else if (it.kind === "table") lines.push(it.cells.join(" | "));
    else lines.push(it.text);
  });
  return lines.join("\n");
}

function fullText(sections: Section[]): string {
  return sections.map(sectionToText).join("\n\n---\n\n");
}

function CopyBadge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        ok ? "bg-good/10 text-good" : "bg-warn/10 text-warn"
      }`}
    >
      {ok ? "✓" : "!"} {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-muted">
      {children}
    </span>
  );
}

function SectionCard({ section, onCopy }: { section: Section; onCopy: (t: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white">
            {section.n}
          </span>
          <h3 className="font-serif text-[17px] font-semibold leading-tight text-ink">{section.heading}</h3>
        </div>
        <button
          onClick={() => onCopy(sectionToText(section))}
          className="shrink-0 rounded-md border border-line px-2.5 py-1 text-[11px] font-semibold text-accent transition hover:bg-accent/5"
        >
          Copy
        </button>
      </div>
      <div className="px-4 py-3.5">
        {section.guardrail ? (
          <p className="mb-3 rounded-lg bg-accent-soft px-3 py-1.5 text-[12px] font-medium leading-snug text-accent">
            ⚠ {section.guardrail}
          </p>
        ) : null}
        <div className="space-y-2.5">
          {section.items.map((item, i) => {
            if (item.kind === "bullet") {
              return (
                <p key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                  <span>{item.text}</span>
                </p>
              );
            }
            if (item.kind === "number") {
              return (
                <p key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/85">
                  <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
                    {item.n}
                  </span>
                  <span>{item.text}</span>
                </p>
              );
            }
            if (item.kind === "table") {
              return (
                <p
                  key={i}
                  className="rounded-lg border border-line/70 bg-paper px-3 py-2 font-mono text-[12px] leading-relaxed text-ink/80"
                >
                  {item.cells.join("  |  ")}
                </p>
              );
            }
            return (
              <p key={i} className="text-[14px] leading-relaxed text-ink/85">
                {item.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProposalView({
  input,
  sections,
}: {
  input: ProposalInput;
  sections: Section[];
}) {
  const [notice, setNotice] = useState<string | null>(null);

  const mentions = useMemo(() => sponsorMentionCount(input), [input]);
  const price = useMemo(() => hasPricing(input), [input]);
  const generic = useMemo(() => genericPropsUsed(input), [input]);

  const copy = (t: string, label: string) => {
    navigator.clipboard
      .writeText(t)
      .then(() => {
        setNotice(label);
        window.setTimeout(() => setNotice(null), 1600);
      })
      .catch(() => setNotice("Copy failed — select manually"));
  };

  const sponsorOk = mentions >= 2 && mentions <= 3;

  return (
    <div className="sticky top-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <CopyBadge ok={sponsorOk}>
          {input.sponsorName.trim()
            ? `Sponsor name used ${mentions}× (target 2–3)`
            : "Sponsor name not set"}
        </CopyBadge>
        <CopyBadge ok={!price}>No pricing in body</CopyBadge>
        {generic.length > 0 && <CopyBadge ok={false}>Generic props: {generic.join(", ")}</CopyBadge>}
        <Chip>Problem-first</Chip>
        <Chip>3 options</Chip>
        <Chip>No regulator promises</Chip>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-ink">Live proposal scaffold</h2>
        <button
          onClick={() => copy(fullText(sections), "Full proposal copied")}
          className="rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-accent/90"
        >
          Copy entire proposal
        </button>
      </div>
      {notice ? (
        <p className="rounded-lg bg-good/10 px-3 py-1.5 text-[12px] font-medium text-good">{notice}</p>
      ) : (
        <p className="text-[12px] text-muted">
          Guide text and guardrails stay visible while you fill the left panel — replace
          [bracketed] prompts with specifics before sending.
        </p>
      )}

      <div className="space-y-3">
        {sections.map((s) => (
          <SectionCard key={s.n} section={s} onCopy={(t) => copy(t, `Section ${s.n} copied`)} />
        ))}
      </div>
    </div>
  );
}