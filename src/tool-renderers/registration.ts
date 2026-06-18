import type { ExtensionAPI, ToolInfo } from "@earendil-works/pi-coding-agent";
import { getBuiltinToolOptions, type BuiltinToolOptions } from "../tools/builtin-options";
import { ALL_CODE_PREVIEW_TOOLS, type CodePreviewToolName } from "../tools/names";
import { getEnabledCodePreviewTools } from "../tools/selection";
import { resetCodePreviewToolStatuses, setCodePreviewToolStatus } from "../tools/status";
import { registerBash } from "./bash";
import { registerEdit } from "./edit";
import { registerFind } from "./find";
import { registerGrep } from "./grep";
import { registerLs } from "./ls";
import { registerRead } from "./read";
import { registerWrite } from "./write";

export interface RegisterToolRenderersOptions {
  registeredTools?: Set<CodePreviewToolName>;
  toolOptions?: BuiltinToolOptions;
}

type ToolRendererRegistration = (
  pi: ExtensionAPI,
  cwd: string,
  options: BuiltinToolOptions,
) => void;

const TOOL_RENDERER_REGISTRATIONS = {
  bash: (pi, cwd, options) => registerBash(pi, cwd, options.bash),
  read: (pi, cwd, options) => registerRead(pi, cwd, options.read),
  write: (pi, cwd) => registerWrite(pi, cwd),
  edit: (pi, cwd) => registerEdit(pi, cwd),
  grep: (pi, cwd) => registerGrep(pi, cwd),
  find: (pi, cwd) => registerFind(pi, cwd),
  ls: (pi, cwd) => registerLs(pi, cwd),
} satisfies Record<CodePreviewToolName, ToolRendererRegistration>;

export function registerToolRenderers(
  pi: ExtensionAPI,
  cwd: string,
  options: RegisterToolRenderersOptions = {},
) {
  const enabledTools = getEnabledCodePreviewTools();
  resetCodePreviewToolStatuses(enabledTools);
  const existingTools = getExistingToolsByName(pi);
  const toolOptions = options.toolOptions ?? getBuiltinToolOptions(cwd);
  for (const tool of ALL_CODE_PREVIEW_TOOLS) {
    if (!enabledTools.has(tool)) continue;
    if (options.registeredTools?.has(tool)) {
      setCodePreviewToolStatus(tool, { state: "active" });
      continue;
    }

    const existing = existingTools.get(tool);
    if (existing && existing.sourceInfo.source !== "builtin") {
      setCodePreviewToolStatus(tool, { state: "skipped-conflict", owner: existing.sourceInfo });
      continue;
    }

    TOOL_RENDERER_REGISTRATIONS[tool](pi, cwd, toolOptions);
    options.registeredTools?.add(tool);
    setCodePreviewToolStatus(tool, { state: "active" });
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
