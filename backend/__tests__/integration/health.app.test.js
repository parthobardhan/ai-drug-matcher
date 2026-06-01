const { getIntegrationAgent } = require('./helpers/app');

describe('App health and routing', () => {
  it('GET /health returns ok status with ISO timestamp', async () => {
    const res = await getIntegrationAgent().get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toMatch(/running/i);
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('GET unknown route returns 404', async () => {
    const res = await getIntegrationAgent().get('/api/nope');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Route not found' });
  });
});
