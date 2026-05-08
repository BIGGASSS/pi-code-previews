import {
  codePreviewSettings,
  formatToolsSettingValue,
  getRequiredCodePreviewTools,
} from "./settings.ts";
import {
  ALL_CODE_PREVIEW_TOOLS,
  parseCodePreviewTools,
  type CodePreviewToolName,
} from "./tool-names.ts";

export function getEnabledCodePreviewTools(): Set<CodePreviewToolName> {
  const enabled =
    parseCodePreviewTools(process.env.CODE_PREVIEW_TOOLS) ?? new Set(codePreviewSettings.tools);
  for (const tool of getRequiredCodePreviewTools()) enabled.add(tool);
  return enabled;
}

export function formatEnabledCodePreviewTools(enabled = getEnabledCodePreviewTools()): string {
  return formatToolsSettingValue(ALL_CODE_PREVIEW_TOOLS.filter((tool) => enabled.has(tool)));
}
