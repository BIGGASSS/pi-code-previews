import type { CodePreviewToolName } from "../tools/names";

export type DiffBackgroundIntensity = "off" | "subtle" | "medium";
export type DiffWordEmphasis = "off" | "smart" | "all";
export type ToolCallBackgroundMode = "on" | "off" | "border";
export type PathIconMode = "off" | "unicode" | "nerd";

export interface CodePreviewSettings {
  shikiTheme: string;
  diffIntensity: DiffBackgroundIntensity;
  wordEmphasis: DiffWordEmphasis;
  toolCallBackground: ToolCallBackgroundMode;
  toolCallTiming: boolean;
  readCollapsedLines: number;
  readContentPreview: boolean;
  writeContentPreview: boolean;
  writeCollapsedLines: number;
  editDiffPreview: boolean;
  editCollapsedLines: number | "all";
  grepCollapsedLines: number;
  grepResultPreview: boolean;
  findResultPreview: boolean;
  lsResultPreview: boolean;
  pathListCollapsedLines: number;
  readLineNumbers: boolean;
  bashResultPreview: boolean;
  bashWarnings: boolean;
  syntaxHighlighting: boolean;
  secretWarnings: boolean;
  pathIcons: PathIconMode;
  tools: CodePreviewToolName[];
}

export type CodePreviewEditableSettingId = keyof CodePreviewSettings | "resetToDefaults";
