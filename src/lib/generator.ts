// Encodes the 9-part annual sponsorship proposal structure.
// Reference format: annual-proposal-format skill (9-part narrative).
import type { ProposalInput, OptionRow, ThemeRow, QuarterRow, AngleRow } from "./types";

export type BodyItem =
  | { kind: "p"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "number"; n: number; text: string }
  | { kind: "table"; cells: string[] };

export interface Section {
  n: number;
  heading: string;
  guardrail?: string;
  items: BodyItem[];
}

const clean = (s: string): string => s.trim();
const nonEmpty = (s: string | undefined): s is string => typeof s === "string" && s.trim().length > 0;

function bullets(lines: string[]): BodyItem[] {
  return lines.filter(nonEmpty).map((t) => ({ kind: "bullet" as const, text: t.trim() }));
}

function paragraphs(...lines: (string | undefined)[]): BodyItem[] {
  return lines.filter(nonEmpty).map((t) => ({ kind: "p" as const, text: t!.trim() }));
}

function tableRow(cells: string[]): BodyItem {
  return { kind: "table", cells };
}

function themeTable(rows: ThemeRow[]): BodyItem[] {
  const out: BodyItem[] = [tableRow(["Theme", "Why It Matters", "Regulatory Hook"])];
  rows.forEach((r) => {
    if (nonEmpty(r.theme)) {
      out.push(
        tableRow([
          r.theme.trim(),
          r.why.trim() || "—",
          r.hook.trim() || "—",
        ])
      );
    }
  });
  return out;
}

function quarterTable(rows: QuarterRow[]): BodyItem[] {
  const out: BodyItem[] = [tableRow(["Quarter", "Activity", "Format", "Audience"])];
  rows.forEach((r) => {
    if (nonEmpty(r.activity)) {
      out.push(
        tableRow([
          r.quarter.trim() || "TBD",
          r.activity.trim(),
          r.format.trim() || "—",
          r.audience.trim() || "—",
        ])
      );
    }
  });
  return out;
}

function optionsBlock(options: OptionRow[]): BodyItem[] {
  const out: BodyItem[] = [];
  options.forEach((o, i) => {
    if (!nonEmpty(o.label)) return;
    const suffix = o.recommended ? " (Recommended)" : "";
    const letter = String.fromCharCode(65 + i); // A, B, C
    out.push(tableRow([`Option ${letter}: ${o.label.trim()}${suffix}`]));
    o.deliverables
      .split("\n")
      .filter(nonEmpty)
      .forEach((d) => {
        out.push({ kind: "bullet", text: d.trim() });
      });
  });
  return out;
}

export function buildProposal(inp: ProposalInput): Section[] {
  const sponsor = clean(inp.sponsorName) || "[Sponsor name]";
  const convener = clean(inp.convener) || "[Convener / publisher name]";
  const sector = clean(inp.sector) || "[industry / sector]";
  const programName = clean(inp.programName) || "[program name]";
  const programType = clean(inp.programType) || "[annual partnership]";
  const gap =
    clean(inp.gapStatement) ||
    `There is no neutral, high-trust forum where ${sector} policy gets discussed with depth and candour. This partnership creates one.`;

  const sections: Section[] = [];

  // 1. Executive Summary
  sections.push({
    n: 1,
    heading: "Executive Summary",
    guardrail: "Start with the market tension or the regulatory clock — not with an intro to the org.",
    items: paragraphs(inp.execMarket, `${gap}`),
  });

  // 2. The Market Problem
  const problemItems: BodyItem[] = [];
  if (inp.painPoints.length > 0) problemItems.push(...bullets(inp.painPoints));
  if (inp.regulatoryHooks.length > 0) {
    problemItems.push({ kind: "p", text: "On the clock:" });
    problemItems.push(...bullets(inp.regulatoryHooks));
  }
  if (problemItems.length === 0) {
    problemItems.push({ kind: "p", text: "[State the problem as industry confusion or complexity — 3–5 pain points, each with a dated regulatory or market development. Not the sponsor's internal problems.]" });
    problemItems.push({ kind: "p", text: "[Specific numbers, deadlines, regulatory references.]" });
  }
  problemItems.push({ kind: "p", text: `This proposal fills this gap.` });
  sections.push({
    n: 2,
    heading: "The Market Problem",
    guardrail: "External market/regulatory environment, not the sponsor's internal situation.",
    items: problemItems,
  });

  // 3. The Program
  const programItems: BodyItem[] = [];
  programItems.push(
    { kind: "p", text: `An ${programType} of ${programName} — designed to give ${sponsor} structured access to policy discourse without the noise of a generic sponsorship.` }
  );
  if (inp.themes.some((t) => nonEmpty(t.theme))) {
    programItems.push({ kind: "p", text: "Core themes for the partnership year" });
    programItems.push(...themeTable(inp.themes));
  } else {
    programItems.push({ kind: "p", text: "[Add core themes as Theme | Why It Matters | Regulatory Hook.]" });
  }
  if (inp.quarters.some((q) => nonEmpty(q.activity))) {
    programItems.push({ kind: "p", text: "Proposed structure over time" });
    programItems.push(...quarterTable(inp.quarters));
  } else {
    programItems.push({ kind: "p", text: "[Add a quarterly table: Quarter | Activity | Format | Audience. Do not over-promise on regulator attendance.]" });
  }
  sections.push({ n: 3, heading: "The Program", items: programItems });

  // 4. Why This Is Valuable for a Sponsor
  const valueItems: BodyItem[] = [];
  inp.angles
    .filter((a) => nonEmpty(a.claim))
    .slice(0, 5)
    .forEach((a: AngleRow, i: number) => {
      const claim = a.claim.trim();
      const expl = a.expl.trim();
      valueItems.push({ kind: "number", n: i + 1, text: expl ? `${claim}\u2003— ${expl}` : claim });
    });
  if (valueItems.length === 0) {
    valueItems.push({ kind: "p", text: "[Lead with the most strategic benefit, not the most transactional. Max 5. Policy influence > logos.]" });
  }
  sections.push({
    n: 4,
    heading: `Why This Is Valuable for ${sponsor}`,
    guardrail: "Strategic first, transactional last. No generic value props (brand visibility / networking / recognition).",
    items: valueItems,
  });

  // 5. Sponsorship Structure
  const structItems: BodyItem[] = [];
  const used = inp.options.filter((o) => nonEmpty(o.label));
  if (used.length >= 3) {
    structItems.push(...optionsBlock(used.slice(0, 3)));
  } else if (used.length > 0) {
    structItems.push(...optionsBlock(used));
    structItems.push({ kind: "p", text: "[Add the remaining options so three are offered, with Option A as the clear recommendation.]" });
  } else {
    structItems.push({ kind: "p", text: "[Offer 3 options: (A) Recommended/Annual, (B) Quarterly/Reduced, (C) Single/Signature — with deliverables per option.]" });
  }
  sections.push({
    n: 5,
    heading: "Sponsorship Structure",
    guardrail: "3 options only, Option A clearly the best value. No prices here — pricing goes in the engagement letter.",
    items: structItems,
  });

  // 6. Deliverables for the Sponsor
  const deliv: BodyItem[] = [];
  if (inp.perEngagement.length > 0) {
    deliv.push({ kind: "p", text: "Per engagement" });
    deliv.push(...bullets(inp.perEngagement));
  } else {
    deliv.push({ kind: "p", text: "[Per-engagement deliverables: curated audience, co-designed agenda, off-record environment, published brief, follow-up framework.]" });
  }
  if (inp.annualAdds.length > 0) {
    deliv.push({ kind: "p", text: "Annual partnership adds" });
    deliv.push(...bullets(inp.annualAdds));
  } else {
    deliv.push({ kind: "p", text: "[Annual partnership adds: private dinners/off-record briefings, priority positioning, year-end published report.]" });
  }
  deliv.push({ kind: "p", text: `The sponsor should leave with more than logos and photographs.` });
  sections.push({ n: 6, heading: "Deliverables for the Sponsor", items: deliv });

  // 7. What Success Looks Like
  const success: BodyItem[] = [];
  if (inp.successMetrics.length > 0) {
    inp.successMetrics.slice(0, 6).forEach((m, i) => {
      success.push({ kind: "number", n: i + 1, text: m.trim() });
    });
  } else {
    success.push({ kind: "p", text: "[Measurable outcomes, 4–6 items: policymaker interactions, cited in consultations, quality of regulatory signals. Not impressions/reach.]" });
  }
  sections.push({
    n: 7,
    heading: "What Success Looks Like",
    guardrail: "Outcomes, not vanity metrics.",
    items: success,
  });

  // 8. Why Partner With Me
  const posItems: BodyItem[] = [];
  if (nonEmpty(inp.whyPartner)) {
    posItems.push(...paragraphs(inp.whyPartner));
  } else {
    posItems.push({ kind: "p", text: "[Positioning statement — why you are the right convener for this conversation. Not a bio. Track record with the regulator ecosystem, trusted relationships.]" });
  }
  if (nonEmpty(inp.relationshipNote)) {
    posItems.push(...paragraphs(inp.relationshipNote));
  } else {
    posItems.push({ kind: "p", text: `[Acknowledge the existing relationship — e.g. "You've already sponsored earlier engagements — this is the next step."]` });
  }
  sections.push({
    n: 8,
    heading: `Why Partner With ${convener}`,
    guardrail: "Positioning, not biography.",
    items: posItems,
  });

  // 9. Next Step
  const closeItems: BodyItem[] = [];
  closeItems.push({ kind: "p", text: "A 30-minute conversation to align on:" });
  const agenda = inp.nextAgenda.filter(nonEmpty);
  if (agenda.length > 0) {
    closeItems.push(...bullets(agenda));
  } else {
    closeItems.push({ kind: "p", text: "[3–4 agenda items, e.g. which policy themes to prioritise in the first quarter, which structure fits the current cycle, which stakeholder groups matter most, how quickly we can launch.]" });
  }
  closeItems.push({
    kind: "p",
    text: clean(inp.closeDeadline)
      ? `If there's alignment, I'll send a detailed engagement letter by ${clean(inp.closeDeadline)} covering dates, pricing, and the first-quarter agenda.`
      : "[Specific close with a deadline — e.g. 'If there's alignment, I'll send an engagement letter by end of week.']",
  });
  sections.push({ n: 9, heading: "Next Step", guardrail: "One concrete, lightweight ask with a deadline.", items: closeItems });

  return sections;
}

// ---- Live guardrail checks -------------------------------------------------

export function sponsorMentionCount(inp: ProposalInput): number {
  const sponsor = clean(inp.sponsorName);
  if (!sponsor) return 0;
  const hay = JSON.stringify(inp);
  let count = 0;
  let idx = 0;
  while (idx < hay.length) {
    const at = hay.indexOf(sponsor, idx);
    if (at === -1) break;
    count += 1;
    idx = at + sponsor.length;
  }
  return count;
}

const PRICE_PATTERN = /[₹$€£]\s?\d|(?:INR|USD|EUR|GBP)\s?\d|\d\s?(?:lakh|crore|million|billion|k |k$)/i;

export function hasPricing(inp: ProposalInput): boolean {
  return PRICE_PATTERN.test(JSON.stringify(inp));
}

const GENERIC_PROPS = ["brand visibility", "brand exposure", "networking opportunities", "industry recognition"];

export function genericPropsUsed(inp: ProposalInput): string[] {
  const hay = JSON.stringify(inp).toLowerCase();
  return GENERIC_PROPS.filter((g) => hay.includes(g));
}

export function stripCheckbox(o: OptionRow): OptionRow {
  return { ...o, recommended: Boolean(o.recommended) };
}