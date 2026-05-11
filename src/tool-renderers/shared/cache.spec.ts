import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "vitest";
import { previewCacheKey } from "./cache";
import { codePreviewSettings, setCodePreviewSettings } from "../../settings/index";
import { cloneCodePreviewSettingsForTest, testTheme } from "../../testing/render";

let previousCodePreviewSettings = cloneCodePreviewSettingsForTest();

beforeEach(() => {
  previousCodePreviewSettings = cloneCodePreviewSettingsForTest();
});

afterEach(() => {
  setCodePreviewSettings(previousCodePreviewSettings);
});

test("preview cache keys include word emphasis settings", () => {
  setCodePreviewSettings({ ...codePreviewSettings, wordEmphasis: "all" });
  const allKey = previewCacheKey("edit-result", "-1 old\n+1 new", "src/a.ts", false, testTheme());

  setCodePreviewSettings({ ...codePreviewSettings, wordEmphasis: "off" });
  const offKey = previewCacheKey("edit-result", "-1 old\n+1 new", "src/a.ts", false, testTheme());

  assert.notEqual(allKey, offKey);
});
