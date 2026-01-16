const {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  checkAudiusHealth,
  normaliseBaseUrl,
} = require("../lib/audius-health");

describe("normaliseBaseUrl", () => {
  it("removes a trailing slash", () => {
    expect(normaliseBaseUrl("https://example.com/"))
      .toBe("https://example.com");
  });

  it("throws when baseUrl is not a string", () => {
    expect(() => normaliseBaseUrl(null)).toThrow("baseUrl must be a non-empty string");
  });
});

describe("checkAudiusHealth", () => {
  it("returns ok when the endpoint responds with 200", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ status: "healthy" }),
    });

    const result = await checkAudiusHealth({
      baseUrl: "https://example.com",
      fetchImpl: mockFetch,
      timeoutMs: 10,
    });

    expect(result).toEqual({
      ok: true,
      status: 200,
      payload: { status: "healthy" },
    });
    expect(mockFetch).toHaveBeenCalledWith("https://example.com/health_check", expect.any(Object));
  });

  it("returns failure when the endpoint responds with an error status", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: jest.fn().mockResolvedValue({ status: "down" }),
    });

    const result = await checkAudiusHealth({
      baseUrl: "https://example.com",
      fetchImpl: mockFetch,
      timeoutMs: 10,
    });

    expect(result).toEqual({
      ok: false,
      status: 503,
      payload: { status: "down" },
      error: "Audius health check failed with status 503",
    });
  });

  it("surfaces a timeout as a failure", async () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    const mockFetch = jest.fn().mockImplementation(() => Promise.reject(abortError));

    const result = await checkAudiusHealth({
      baseUrl: DEFAULT_BASE_URL,
      fetchImpl: mockFetch,
      timeoutMs: 1,
    });

    expect(result).toEqual({
      ok: false,
      status: null,
      payload: null,
      error: "Audius health check timed out",
    });
  });

  it("throws when no fetch implementation is provided", async () => {
    await expect(checkAudiusHealth({ fetchImpl: null })).rejects.toThrow("A fetch implementation is required");
  });
});

describe("defaults", () => {
  it("exposes the expected defaults", () => {
    expect(DEFAULT_BASE_URL).toBe("https://discoveryprovider.audius.co/v1");
    expect(DEFAULT_TIMEOUT_MS).toBe(5000);
  });
});
