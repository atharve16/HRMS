import { describe, expect, it } from "vitest";

import { apiBaseUrl, httpClientConfig } from "@/services/http-config";

describe("browser API configuration", () => {
  it("uses the same-origin versioned proxy path", () => {
    expect(apiBaseUrl).toBe("/api/v1");
    expect(httpClientConfig.baseURL).toBe("/api/v1");
    expect(httpClientConfig.withCredentials).toBe(true);
  });
});
