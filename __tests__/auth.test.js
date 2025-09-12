const {
  handleAuthSuccess,
  exchangeCodeForToken,
  initGoogleAuth
} = require('../auth');

describe('OAuth helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="login-modal" class="modal"></div>';
  });

  test('handleAuthSuccess stores token and hides modal', () => {
    handleAuthSuccess('x', 'token123');
    expect(localStorage.getItem('x_token')).toBe('token123');
    expect(document.getElementById('login-modal').classList.contains('hidden')).toBe(true);
  });

  test('exchangeCodeForToken uses fetch and returns token', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ access_token: 'abc' })
    });
    const token = await exchangeCodeForToken('x', 'CODE', mockFetch);
    expect(mockFetch).toHaveBeenCalled();
    expect(token).toBe('abc');
  });

  test('initGoogleAuth initialises Google sign-in when library available', () => {
    document.body.innerHTML = '<div class="g_id_signin"></div>';
    const initialize = jest.fn();
    const renderButton = jest.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const cb = jest.fn();
    const result = initGoogleAuth('client', cb);
    expect(result).toBe(true);
    expect(initialize).toHaveBeenCalledWith({ client_id: 'client', callback: cb });
    expect(renderButton).toHaveBeenCalled();
    delete window.google;
  });
});
