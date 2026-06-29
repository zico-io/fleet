import { expect, test } from "bun:test";
import { upstreamUrl } from "./index";

const BASE = "http://127.0.0.1:3001";

test("rewrites gateway path to eve agent path", () => {
  expect(upstreamUrl(BASE, "butler", "/agents/butler/v1/session", "")).toBe(
    `${BASE}/eve/v1/session`,
  );
  expect(upstreamUrl(BASE, "butler", "/agents/butler/v1/session/abc/stream", "")).toBe(
    `${BASE}/eve/v1/session/abc/stream`,
  );
});

test("preserves query string and bare agent root", () => {
  expect(upstreamUrl(BASE, "butler", "/agents/butler/v1/x", "?wait=1")).toBe(
    `${BASE}/eve/v1/x?wait=1`,
  );
  expect(upstreamUrl(BASE, "butler", "/agents/butler", "")).toBe(`${BASE}/eve/`);
});
