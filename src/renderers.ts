import type { ExtensionAPI, ToolInfo } from "@mariozechner/pi-coding-agent";
import { getBuiltinToolOptions, type BuiltinToolOptions } from "./builtin-tool-options.ts";
import { registerBash } from "./tool-renderers/bash.ts";
import { registerEdit } from "./tool-renderers/edit.ts";
import { registerFind } from "./tool-renderers/find.ts";
import { registerGrep } from "./tool-renderers/grep.ts";
import { registerLs } from "./tool-renderers/ls.ts";
import { registerRead } from "./tool-renderers/read.ts";
import { registerWrite } from "./tool-renderers/write.ts";
import { resetCodePreviewToolStatuses, setCodePreviewToolStatus } from "./tool-status.ts";
import { ALL_CODE_PREVIEW_TOOLS, type CodePreviewToolName } from "./tool-selection.ts";
import { getEnabledCodePreviewTools } from "./tool-selection.ts";

export interface RegisterToolRenderersOptions {
  registeredTools?: Set<CodePreviewToolName>;
  activatedTools?: Set<CodePreviewToolName>;
  toolOptions?: BuiltinToolOptions;
}

export function registerToolRenderers(
  pi: ExtensionAPI,
  cwd: string,
  options: RegisterToolRenderersOptions = {},
) {
  const enabledTools = getEnabledCodePreviewTools();
  resetCodePreviewToolStatuses(enabledTools);
  const existingTools = getExistingToolsByName(pi);
  const toolOptions = options.toolOptions ?? getBuiltinToolOptions(cwd);
  const activePreviewTools = new Set<CodePreviewToolName>();

  for (const tool of ALL_CODE_PREVIEW_TOOLS) {
    if (!enabledTools.has(tool)) continue;
    if (options.registeredTools?.has(tool)) {
      setCodePreviewToolStatus(tool, { state: "active" });
      activePreviewTools.add(tool);
      continue;
    }

    const existing = existingTools.get(tool);
    if (existing && existing.sourceInfo.source !== "builtin") {
      setCodePreviewToolStatus(tool, { state: "skipped-conflict", owner: existing.sourceInfo });
      continue;
    }

    registerToolRenderer(tool, pi, cwd, toolOptions);
    options.registeredTools?.add(tool);
    activePreviewTools.add(tool);
    setCodePreviewToolStatus(tool, { state: "active" });
  }

  syncActiveCodePreviewTools(pi, activePreviewTools, options.activatedTools);
}

function registerToolRenderer(
  tool: CodePreviewToolName,
  pi: ExtensionAPI,
  cwd: string,
  options: BuiltinToolOptions,
): void {
  if (tool === "bash") registerBash(pi, cwd, options.bash);
  else if (tool === "read") registerRead(pi, cwd, options.read);
  else if (tool === "write") registerWrite(pi, cwd);
  else if (tool === "edit") registerEdit(pi, cwd);
  else if (tool === "grep") registerGrep(pi, cwd);
  else if (tool === "find") registerFind(pi, cwd);
  else if (tool === "ls") registerLs(pi, cwd);
}

function syncActiveCodePreviewTools(
  pi: ExtensionAPI,
  desiredTools: Set<CodePreviewToolName>,
  activatedTools: Set<CodePreviewToolName> | undefined,
): void {
  if (desiredTools.size === 0 && (!activatedTools || activatedTools.size === 0)) return;
  const getActiveTools = (pi as Partial<ExtensionAPI>).getActiveTools;
  const setActiveTools = (pi as Partial<ExtensionAPI>).setActiveTools;
  if (typeof getActiveTools !== "function" || typeof setActiveTools !== "function") return;
  try {
    const current = getActiveTools.call(pi);
    const currentSet = new Set(current);
    const additions = [...desiredTools].filter((tool) => !currentSet.has(tool));
    const removals = activatedTools
      ? [...activatedTools].filter((tool) => !desiredTools.has(tool))
      : [];
    const removalsInCurrent = new Set(removals.filter((tool) => currentSet.has(tool)));
    const next = current.filter((tool) => !removalsInCurrent.has(tool as CodePreviewToolName));
    next.push(...additions);
    if (additions.length > 0 || removalsInCurrent.size > 0) setActiveTools.call(pi, next);
    for (const tool of additions) activatedTools?.add(tool);
    for (const tool of removals) activatedTools?.delete(tool);
  } catch {
    // Tool activation is best effort for older pi versions.
  }
}

function getExistingToolsByName(pi: ExtensionAPI): Map<string, ToolInfo> {
  const getAllTools = (pi as Partial<ExtensionAPI>).getAllTools;
  if (typeof getAllTools !== "function") return new Map();
  try {
    return new Map(getAllTools.call(pi).map((tool) => [tool.name, tool]));
  } catch {
    return new Map();
  }
}
