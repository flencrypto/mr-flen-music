describe("audius api helper", () => {
  const noopSleep = async () => {};

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("fetchDiscoveryNodes validates response and targets discovery endpoint", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: ["https://discoveryprovider.audius.co", "https://another.example"],
      }),
    });

    const {
      fetchDiscoveryNodes,
      AUDIUS_DISCOVERY_ENDPOINT,
    } = require("../audius");

    const hosts = await fetchDiscoveryNodes(mockFetch, { sleep: noopSleep, timeoutMs: 1000 });

    expect(mockFetch).toHaveBeenCalledWith(
      AUDIUS_DISCOVERY_ENDPOINT,
      expect.objectContaining({
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    );
    expect(hosts).toEqual([
      "https://discoveryprovider.audius.co",
      "https://another.example",
    ]);
  });

  test("fetchDiscoveryNodes retries with exponential backoff before succeeding", async () => {
    const error = new Error("network down");
    const mockFetch = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ data: ["https://dp.audius.co"] }),
      });

    const { fetchDiscoveryNodes } = require("../audius");

    const hosts = await fetchDiscoveryNodes(mockFetch, {
      retries: 1,
      sleep: noopSleep,
      timeoutMs: 1000,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(hosts).toEqual(["https://dp.audius.co"]);
  });

  test("fetchDiscoveryNodes throws when discovery payload is invalid", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: ["not-a-url"] }),
    });

    const { fetchDiscoveryNodes } = require("../audius");

    await expect(
      fetchDiscoveryNodes(mockFetch, { sleep: noopSleep, timeoutMs: 1000 }),
    ).rejects.toThrow(/Invalid url/i);
  });

  test("pickAudiusHost selects host using provided random function", () => {
    const { pickAudiusHost } = require("../audius");
    const hosts = ["h1", "h2", "h3"];

    const selected = pickAudiusHost(hosts, () => 0.65);
    expect(selected).toBe("h2");

    expect(() => pickAudiusHost([])).toThrow(/No Audius discovery hosts available/);
  });

  test("buildAudiusTrackUrl constructs canonical track endpoint", () => {
    const { buildAudiusTrackUrl } = require("../audius");
    const url = buildAudiusTrackUrl("https://discovery.audius.co", "123", {
      appName: "Test App",
      apiKey: "key",
    });
    expect(url).toBe(
      "https://discovery.audius.co/v1/tracks/123?app_name=Test+App&api_key=key",
    );
  });

  test("buildAudiusStreamUrl encodes identifiers and omits api key when absent", () => {
    const { buildAudiusStreamUrl } = require("../audius");
    const url = buildAudiusStreamUrl("https://discovery.audius.co/", "tr/ack", {
      appName: "My Player",
    });
    expect(url).toBe(
      "https://discovery.audius.co/v1/tracks/tr%2Fack/stream?app_name=My+Player",
    );
  });
});
