import assert from "node:assert/strict";
import { test } from "vitest";
import { registerToolRenderers } from "../src/renderers.ts";
import type { CodePreviewToolName } from "../src/tool-names.ts";
import {
  formatActiveCodePreviewTools,
  formatSkippedCodePreviewToolLines,
} from "../src/tool-status.ts";
import {
  findRenderer,
  preserveCodePreviewToolsEnv,
  registerRenderers,
} from "./renderer-test-utils.ts";

preserveCodePreviewToolsEnv();

test("renderer registration activates enabled preview tool overrides", () => {
  process.env.CODE_PREVIEW_TOOLS = "grep,find,ls";
  const registered: Array<{ name: string }> = [];
  let activeTools = ["read", "bash"];
  registerToolRenderers(
    {
      getActiveTools: () => activeTools,
      setActiveTools: (tools: string[]) => {
        activeTools = tools;
      },
      registerTool: (tool: unknown) => registered.push(tool as { name: string }),
    } as never,
    "/tmp/project",
    { toolOptions: {} },
  );

  assert.deepEqual(
    registered.map((tool) => tool.name),
    ["grep", "find", "ls"],
  );
  assert.deepEqual(activeTools, ["read", "bash", "grep", "find", "ls"]);
  assert.equal(formatActiveCodePreviewTools(), "grep, find, ls");
});

test("renderer registration removes previously activated previews when disabled", () => {
  const registeredTools = new Set<CodePreviewToolName>();
  const activatedTools = new Set<CodePreviewToolName>();
  let activeTools = ["read", "bash"];
  const pi = {
    getActiveTools: () => activeTools,
    setActiveTools: (tools: string[]) => {
      activeTools = tools;
    },
    registerTool: () => undefined,
  };

  process.env.CODE_PREVIEW_TOOLS = "grep";
  registerToolRenderers(pi as never, "/tmp/project", {
    registeredTools,
    activatedTools,
    toolOptions: {},
  });
  assert.deepEqual(activeTools, ["read", "bash", "grep"]);
  assert.deepEqual([...activatedTools], ["grep"]);

  process.env.CODE_PREVIEW_TOOLS = "none";
  registerToolRenderers(pi as never, "/tmp/project", {
    registeredTools,
    activatedTools,
    toolOptions: {},
  });
  assert.deepEqual(activeTools, ["read", "bash"]);
  assert.deepEqual([...activatedTools], []);
});

test("renderer registration does not remove tools that were already active", () => {
  const activatedTools = new Set<CodePreviewToolName>();
  let activeTools = ["read", "bash", "grep"];
  const pi = {
    getActiveTools: () => activeTools,
    setActiveTools: (tools: string[]) => {
      activeTools = tools;
    },
    registerTool: () => undefined,
  };

  process.env.CODE_PREVIEW_TOOLS = "grep";
  registerToolRenderers(pi as never, "/tmp/project", { activatedTools, toolOptions: {} });
  process.env.CODE_PREVIEW_TOOLS = "none";
  registerToolRenderers(pi as never, "/tmp/project", { activatedTools, toolOptions: {} });
  assert.deepEqual(activeTools, ["read", "bash", "grep"]);
  assert.deepEqual([...activatedTools], []);
});

test("renderer registration skips tools already owned by another extension", () => {
  process.env.CODE_PREVIEW_TOOLS = "read,grep,write";
  const registered: Array<{ name: string }> = [];
  registerToolRenderers(
    {
      getAllTools: () => [
        {
          name: "read",
          description: "read via fff",
          parameters: {},
          sourceInfo: {
            source: "npm:pi-fff",
            path: "/tmp/pi-fff/index.ts",
            scope: "user",
            origin: "package",
          },
        },
        {
          name: "grep",
          description: "grep via fff",
          parameters: {},
          sourceInfo: {
            source: "npm:pi-fff",
            path: "/tmp/pi-fff/index.ts",
            scope: "user",
            origin: "package",
          },
        },
        {
          name: "write",
          description: "write",
          parameters: {},
          sourceInfo: {
            source: "builtin",
            path: "<builtin:write>",
            scope: "temporary",
            origin: "top-level",
          },
        },
      ],
      registerTool: (tool: unknown) => registered.push(tool as { name: string }),
    } as never,
    "/tmp/project",
  );

  assert.deepEqual(
    registered.map((tool) => tool.name),
    ["write"],
  );
  assert.equal(formatActiveCodePreviewTools(), "write");
  assert.deepEqual(formatSkippedCodePreviewToolLines(), [
    "  read — owned by npm:pi-fff",
    "  grep — owned by npm:pi-fff",
  ]);
});

test("registered edit renderer preserves built-in metadata and prepareArguments shim", () => {
  process.env.CODE_PREVIEW_TOOLS = "edit";
  const edit = findRenderer(registerRenderers(), "edit");
  assert.equal(edit.name, "edit");
  assert.equal(typeof edit.prepareArguments, "function");
  assert.equal(typeof edit.promptSnippet, "string");
  assert.ok(edit.promptGuidelines?.length);
  assert.deepEqual(edit.prepareArguments?.({ path: "a.txt", oldText: "a", newText: "b" }), {
    path: "a.txt",
    edits: [{ oldText: "a", newText: "b" }],
  });
});
