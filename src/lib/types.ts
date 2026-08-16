// Shared types for the sponsor proposal builder.

export interface ThemeRow {
  theme: string;
  why: string;
  hook: string;
}

export interface QuarterRow {
  quarter: string;
  activity: string;
  format: string;
  audience: string;
}

export interface AngleRow {
  claim: string;
  expl: string;
}

export interface OptionRow {
  label: string;
  recommended: boolean;
  deliverables: string; // one bullet per line
}

export interface ProposalInput {
  convener: string;
  sponsorName: string;
  sector: string;
  programType: string;
  programName: string;
  execMarket: string;
  gapStatement: string;
  painPoints: string[]; // each = one pain point bullet
  regulatoryHooks: string[]; // each = one dated development/reference
  themes: ThemeRow[];
  quarters: QuarterRow[];
  angles: AngleRow[];
  options: OptionRow[];
  perEngagement: string[];
  annualAdds: string[];
  successMetrics: string[];
  whyPartner: string;
  relationshipNote: string;
  nextAgenda: string[];
  closeDeadline: string;
}

export const emptyInput: ProposalInput = {
  convener: "",
  sponsorName: "",
  sector: "",
  programType: "",
  programName: "",
  execMarket: "",
  gapStatement: "",
  painPoints: [],
  regulatoryHooks: [],
  themes: [],
  quarters: [],
  angles: [],
  options: [],
  perEngagement: [],
  annualAdds: [],
  successMetrics: [],
  whyPartner: "",
  relationshipNote: "",
  nextAgenda: [],
  closeDeadline: "",
};