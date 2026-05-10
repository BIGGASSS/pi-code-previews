import type { Theme } from "@earendil-works/pi-coding-agent";
import type { summarizeDiff } from "./diff";
import { countLabel } from "./format";

export type DiffSummary = ReturnType<typeof summarizeDiff>;

export function diffSummarySeparator(theme: Theme): string {
  return theme.fg("muted", " · ");
}

export function describeDiffShape(summary: DiffSummary): string {
  const parts: string[] = [];
  if (summary.replacements > 0) parts.push(countLabel(summary.replacements, "replacement"));
  if (summary.insertions > 0) parts.push(countLabel(summary.insertions, "insertion"));
  if (summary.deletions > 0) parts.push(countLabel(summary.deletions, "deletion"));
  return parts.length ? parts.join(", ") : "changes";
}
