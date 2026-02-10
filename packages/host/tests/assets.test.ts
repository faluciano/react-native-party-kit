import { describe, expect, test } from "bun:test";
import type { AssetManifest, ExtractAssetsResult } from "../src/assets";

describe("useExtractAssets types", () => {
  test("AssetManifest accepts a files array", () => {
    const manifest: AssetManifest = {
      files: ["index.html", "assets/index-abc.js", "assets/style-def.css"],
    };

    expect(manifest.files).toHaveLength(3);
    expect(manifest.files[0]).toBe("index.html");
  });

  test("ExtractAssetsResult has the expected shape", () => {
    const result: ExtractAssetsResult = {
      staticDir: undefined,
      loading: true,
      error: null,
    };

    expect(result.staticDir).toBeUndefined();
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  test("ExtractAssetsResult allows staticDir as string", () => {
    const result: ExtractAssetsResult = {
      staticDir: "/data/user/0/com.app/files/www/",
      loading: false,
      error: null,
    };

    expect(result.staticDir).toBe("/data/user/0/com.app/files/www/");
    expect(result.loading).toBe(false);
  });

  test("ExtractAssetsResult allows error as string", () => {
    const result: ExtractAssetsResult = {
      staticDir: undefined,
      loading: false,
      error: "Document directory is not available",
    };

    expect(result.error).toBe("Document directory is not available");
  });
});
