"use client";

import { useCallback } from "react";
import type { ThemeRow, QuarterRow, AngleRow, OptionRow } from "../lib/types";

// ---- Field primitives ------------------------------------------------------

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-ink/80">{children}</span>
      {hint ? <span className="block text-[11px] text-muted mt-0.5">{hint}</span> : null}
    </label>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
    />
  );
}

export function Area({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
    />
  );
}

export function LinesEditor({
  value,
  onChange,
  placeholder,
  hint,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label hint={hint}>One per line</Label>
      <textarea
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        placeholder={placeholder}
        rows={Math.max(3, value.length + 1)}
        className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />
    </div>
  );
}

// ---- Row-based table editors ----------------------------------------------

type ColDef = { key: string; label: string; placeholder: string; type?: "text" | "area"; wide?: boolean };

function RowsEditor({
  cols,
  rows,
  onChange,
  emptyRow,
  addLabel,
}: {
  cols: ColDef[];
  rows: Record<string, string>[];
  onChange: (rows: Record<string, string>[]) => void;
  emptyRow: () => Record<string, string>;
  addLabel: string;
}) {
  const setCell = useCallback(
    (i: number, key: string, val: string) => {
      const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
      onChange(next);
    },
    [rows, onChange]
  );
  const remove = useCallback(
    (i: number) => {
      onChange(rows.filter((_, idx) => idx !== i));
    },
    [rows, onChange]
  );
  const add = useCallback(() => {
    onChange([...rows, emptyRow()]);
  }, [rows, onChange, emptyRow]);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-line bg-white p-2.5 space-y-2">
            <div className={`grid gap-2 ${cols.length > 3 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {cols.map((c) =>
                c.type === "area" ? (
                  <div key={c.key} className={c.wide ? "sm:col-span-2" : ""}>
                    <Label>{c.label}</Label>
                    <textarea
                      value={String(row[c.key] ?? "")}
                      onChange={(e) => setCell(i, c.key, e.target.value)}
                      placeholder={c.placeholder}
                      rows={2}
                      className="mt-1 w-full resize-y rounded-lg border border-line bg-paper/60 px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                ) : (
                  <div key={c.key}>
                    <Label>{c.label}</Label>
                    <input
                      value={String(row[c.key] ?? "")}
                      onChange={(e) => setCell(i, c.key, e.target.value)}
                      placeholder={c.placeholder}
                      className="mt-1 w-full rounded-lg border border-line bg-paper/60 px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                )
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => remove(i)}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-warn hover:bg-warn/10"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="w-full rounded-lg border border-dashed border-line py-2 text-[12px] font-medium text-accent hover:bg-accent/5"
      >
        + {addLabel}
      </button>
    </div>
  );
}

// NOTE: TS generic rows are typed as Record<string, string> for the shared editor.
// Concrete row shapes below adapt between these records and the typed model.

export function ThemesEditor({ rows, onChange }: { rows: ThemeRow[]; onChange: (r: ThemeRow[]) => void }) {
  return (
    <RowsEditor
      cols={[
        { key: "theme", label: "Theme", placeholder: "e.g. Market concentration & remedies" },
        { key: "why", label: "Why it matters", placeholder: "Why it matters to the sponsor" },
        { key: "hook", label: "Regulatory hook", placeholder: "e.g. NPCI Dec 31 deadline" },
      ]}
      rows={rows as unknown as Record<string, string>[]}
      onChange={(r) => onChange(r as unknown as ThemeRow[])}
      emptyRow={() => ({ theme: "", why: "", hook: "" })}
      addLabel="Add theme"
    />
  );
}

export function QuartersEditor({ rows, onChange }: { rows: QuarterRow[]; onChange: (r: QuarterRow[]) => void }) {
  return (
    <RowsEditor
      cols={[
        { key: "quarter", label: "Quarter", placeholder: "e.g. Q3 2026" },
        { key: "activity", label: "Activity", placeholder: "e.g. Invitation-only roundtable" },
        { key: "format", label: "Format", placeholder: "e.g. Half-day curated discussion" },
        { key: "audience", label: "Audience", placeholder: "e.g. RBI, NPCI, banks, SROs" },
      ]}
      rows={rows as unknown as Record<string, string>[]}
      onChange={(r) => onChange(r as unknown as QuarterRow[])}
      emptyRow={() => ({ quarter: "", activity: "", format: "", audience: "" })}
      addLabel="Add quarter activity"
    />
  );
}

export function AnglesEditor({ rows, onChange }: { rows: AngleRow[]; onChange: (r: AngleRow[]) => void }) {
  return (
    <RowsEditor
      cols={[
        { key: "claim", label: "Value claim", placeholder: "Bold claim about value" },
        { key: "expl", label: "One-sentence explanation", placeholder: "Why this matters for them" },
      ]}
      rows={rows as unknown as Record<string, string>[]}
      onChange={(r) => onChange(r as unknown as AngleRow[])}
      emptyRow={() => ({ claim: "", expl: "" })}
      addLabel="Add value angle"
    />
  );
}

export function OptionsEditor({ rows, onChange }: { rows: OptionRow[]; onChange: (r: OptionRow[]) => void }) {
  const setCell = useCallback(
    (i: number, patch: Partial<OptionRow>) => {
      onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    },
    [rows, onChange]
  );
  const remove = useCallback(
    (i: number) => {
      onChange(rows.filter((_, idx) => idx !== i));
    },
    [rows, onChange]
  );
  const add = useCallback(() => {
    onChange([...rows, { label: "", recommended: rows.length === 0, deliverables: "" }]);
  }, [rows, onChange]);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className={`rounded-lg border p-2.5 space-y-2 ${row.recommended ? "border-accent/40 bg-accent/5" : "border-line bg-white"}`}>
            <div className="flex items-center gap-2">
              <input
                id={`opt-rec-${i}`}
                type="checkbox"
                checked={row.recommended}
                onChange={(e) => setCell(i, { recommended: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              <label htmlFor={`opt-rec-${i}`} className="text-[12px] font-semibold text-accent">
                Option {String.fromCharCode(65 + i)} — recommended
              </label>
              <span className="flex-1" />
              <button
                onClick={() => remove(i)}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-warn hover:bg-warn/10"
              >
                Remove
              </button>
            </div>
            <input
              value={row.label}
              onChange={(e) => setCell(i, { label: e.target.value })}
              placeholder="e.g. Annual Policy Partnership (Recommended)"
              className="w-full rounded-lg border border-line bg-paper/60 px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
            <textarea
              value={row.deliverables}
              onChange={(e) => setCell(i, { deliverables: e.target.value })}
              placeholder={"Deliverables — one per line\ne.g. 6 curated roundtables (2 per quarter)"}
              rows={Math.max(2, row.deliverables.split("\n").length)}
              className="w-full resize-y rounded-lg border border-line bg-paper/60 px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="w-full rounded-lg border border-dashed border-line py-2 text-[12px] font-medium text-accent hover:bg-accent/5"
      >
        + Add option
      </button>
    </div>
  );
}