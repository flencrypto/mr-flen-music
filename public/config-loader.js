(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.configLoader = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const defaultConfig = {
    audiusAppName: '',
    audiusKey: '',
    scClientId: '',
    scRedirectUri: '',
    googleClientId: '',
    googleRedirectUri: '',
    mrflens: {
      audiusHandle: 'mr.flen',
      soundcloudUsername: 'Mr.FLEN',
    },
    analytics: {
      likes: 0,
      reposts: 0,
      followers: 0,
    },
  };

  function safeParseConfig(text, logger = console) {
    if (!text || typeof text !== 'string') return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      if (logger && typeof logger.warn === 'function') {
        logger.warn('Failed to parse config JSON', error);
      }
      return null;
    }
  }

  function normalizeConfig(config, overrides = {}) {
    const merged = {
      ...defaultConfig,
      ...config,
      ...overrides,
    };
    merged.mrflens = {
      ...defaultConfig.mrflens,
      ...(config && config.mrflens),
      ...(overrides && overrides.mrflens),
    };
    merged.analytics = {
      ...defaultConfig.analytics,
      ...(config && config.analytics),
      ...(overrides && overrides.analytics),
    };
    return merged;
  }

  function loadFromDom(doc, overrides = {}, logger = console) {
    if (!doc || typeof doc.getElementById !== 'function') {
      return normalizeConfig(null, overrides);
    }
    const configNode = doc.getElementById('config');
    if (!configNode || !configNode.textContent) {
      return normalizeConfig(null, overrides);
    }
    const parsed = safeParseConfig(configNode.textContent, logger);
    return normalizeConfig(parsed, overrides);
  }

  return { defaultConfig, safeParseConfig, normalizeConfig, loadFromDom };
});
