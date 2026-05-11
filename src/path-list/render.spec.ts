import assert from "node:assert/strict";
import { test } from "vitest";
import { renderPathListLines } from "./render";
import { stripAnsi, testTheme } from "../testing/render";

test("renderPathListLines groups nested paths", () => {
  const lines = renderPathListLines(
    "src/renderers.ts\nsrc/diff.ts\ntests/helpers.test.ts",
    "/tmp/project",
    testTheme(),
    { iconMode: "unicode" },
  );
  const plain = stripAnsi(lines.join("\n"));
  assert.match(plain, /▸ src\//);
  assert.match(plain, /• renderers\.ts/);
  assert.match(plain, /▸ tests\//);
});

test("path list rendering can disable icons or use Nerd Font icons", () => {
  assert.doesNotMatch(
    stripAnsi(
      renderPathListLines("src/renderers.ts", "/tmp/project", testTheme(), {
        iconMode: "off",
      }).join("\n"),
    ),
    /[▸•]/,
  );

  const nerd = stripAnsi(
    renderPathListLines("src/renderers.ts", "/tmp/project", testTheme(), {
      iconMode: "nerd",
    }).join("\n"),
  );
  assert.match(nerd, /\ue5ff src\//);
  assert.match(nerd, /\ue628 renderers\.ts/);
});
