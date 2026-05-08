import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createLsToolDefinition } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

import { renderDisplayPath } from "../paths.ts";
import { codePreviewSettings } from "../settings.ts";
import { renderPathListResult } from "./path-list-result.ts";

export function registerLs(pi: ExtensionAPI, cwd: string) {
  const originalLs = createLsToolDefinition(cwd);
  pi.registerTool({
    ...originalLs,
    renderCall(args, theme) {
      const path = typeof args.path === "string" && args.path ? args.path : ".";
      return new Text(
        `${theme.fg("toolTitle", theme.bold("ls"))} ${renderDisplayPath(path, cwd, theme)}`,
        0,
        0,
      );
    },
    renderResult(result, options, theme, context) {
      return renderPathListResult(result, options, theme, context, {
        cwd,
        previewEnabled: codePreviewSettings.lsResultPreview,
        collapsedLines: codePreviewSettings.pathListCollapsedLines,
        loadingLabel: "Listing…",
        errorLabel: "List failed",
        emptyMarker: "(empty directory)",
        emptyLabel: () => "Empty directory",
        footerNoun: "entries",
      });
    },
  });
}
