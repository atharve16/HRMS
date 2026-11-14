import { describe, expect, it } from "vitest";

import { normalizeBackendUrl } from "../../next.config";

describe("Next.js API proxy configuration", () => {
  it("normalizes an internal host without duplicating the API prefix", () => {
    expect(normalizeBackendUrl("https://hrms-n1xj.onrender.com/api/v1/")).toBe(
      "https://hrms-n1xj.onrender.com",
    );
    expect(normalizeBackendUrl("https://hrms-n1xj.onrender.com/api/v1/api/v1")).toBe(
      "https://hrms-n1xj.onrender.com",
    );
  });
});
