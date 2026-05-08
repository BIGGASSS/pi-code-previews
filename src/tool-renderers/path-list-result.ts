import type {
  AgentToolResult,
  Theme,
  ToolRenderResultOptions,
} from "@mariozechner/pi-coding-agent";
import { Text, type Component } from "@mariozechner/pi-tui";
import { getTextContent } from "../data.ts";
import { showingFooter, trimSingleTrailingNewline } from "../format.ts";
import { renderPathListLines } from "../path-list-rendering.ts";
import { escapeControlChars } from "../terminal-text.ts";
import { renderHiddenPreviewExpandHint, renderSelectedOutputLines } from "./common.ts";

interface PathListResultConfig {
  cwd: string;
  previewEnabled: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyMarker: string;
  emptyLabel: (output: string) => string;
  collapsedLines: number;
  footerNoun: string;
}

interface PathListRenderContext {
  isError: boolean;
  state: Record<string, unknown>;
}

export function renderPathListResult(
  result: AgentToolResult<unknown>,
  { expanded, isPartial }: ToolRenderResultOptions,
  theme: Theme,
  context: PathListRenderContext,
  config: PathListResultConfig,
): Component {
  if (isPartial) return new Text(theme.fg("warning", config.loadingLabel), 0, 0);
  const output = trimSingleTrailingNewline(getTextContent(result.content));
  if (context.isError)
    return new Text(
      theme.fg("error", escapeControlChars(output.split("\n")[0] || config.errorLabel)),
      0,
      0,
    );
  if (!expanded && !config.previewEnabled)
    return renderHiddenPreviewExpandHint(context.state, theme);
  if (!output || output === config.emptyMarker)
    return new Text(theme.fg("muted", config.emptyLabel(output)), 0, 0);
  if (expanded && !config.previewEnabled)
    return new Text(
      output
        .split("\n")
        .map((line) => theme.fg("toolOutput", escapeControlChars(line)))
        .join("\n"),
      0,
      0,
    );

  const rawLines = output.split("\n");
  const limit = expanded ? rawLines.length : config.collapsedLines;
  const preview = renderSelectedOutputLines(rawLines, limit, theme, (chunk) =>
    renderPathListLines(chunk.join("\n"), config.cwd, theme),
  );
  let text = preview.lines.join("\n");
  if (preview.hidden > 0)
    text += showingFooter(theme, preview.shown, rawLines.length, config.footerNoun);
  return new Text(text, 0, 0);
}
