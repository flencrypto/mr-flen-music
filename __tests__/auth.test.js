const { handleAuthSuccess, exchangeCodeForToken } = require('../auth');

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
});
