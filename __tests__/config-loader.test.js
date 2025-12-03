const {
  defaultConfig,
  safeParseConfig,
  normalizeConfig,
  loadFromDom,
} = require('../public/config-loader');

const createDocumentWithConfig = (textContent) => ({
  getElementById: (id) => (id === 'config' ? { textContent } : null),
});

describe('config-loader', () => {
  test('safeParseConfig returns null on invalid JSON and logs warning', () => {
    const warn = jest.fn();
    const result = safeParseConfig('{invalid}', { warn });
    expect(result).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  test('normalizeConfig merges defaults with overrides', () => {
    const merged = normalizeConfig({ audiusAppName: 'custom' }, { scClientId: 'abc' });
    expect(merged.audiusAppName).toBe('custom');
    expect(merged.scClientId).toBe('abc');
    expect(merged.mrflens.audiusHandle).toBe(defaultConfig.mrflens.audiusHandle);
  });

  test('loadFromDom falls back to defaults when config missing', () => {
    const loaded = loadFromDom(createDocumentWithConfig(''));
    expect(loaded).toMatchObject(defaultConfig);
  });

  test('loadFromDom reads JSON content when present', () => {
    const doc = createDocumentWithConfig('{"audiusAppName":"demo","mrflens":{"soundcloudUsername":"User"}}');
    const loaded = loadFromDom(doc);
    expect(loaded.audiusAppName).toBe('demo');
    expect(loaded.mrflens.soundcloudUsername).toBe('User');
  });
});
