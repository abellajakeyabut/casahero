import { http, HttpResponse } from 'msw';
import { server } from './setup';
import api from '../api/api';

describe('api client', () => {
  it('passes JSON responses through', async () => {
    server.use(http.get('*/casahero-api/json', () => HttpResponse.json({ ok: true })));
    const response = await api.get('/json');
    expect(response.data).toEqual({ ok: true });
  });

  it('lets 204 No Content through without a JSON body', async () => {
    server.use(http.get('*/casahero-api/empty', () => new HttpResponse(null, { status: 204 })));
    const response = await api.get('/empty');
    expect(response.status).toBe(204);
  });

  it('rejects HTML responses (e.g. the SPA fallback page)', async () => {
    server.use(
      http.get('*/casahero-api/html', () => HttpResponse.html('<html></html>')),
    );
    await expect(api.get('/html')).rejects.toMatchObject({
      notJson: true,
      message: expect.stringContaining('text/html'),
    });
  });

  it('rejects responses with no content type', async () => {
    server.use(http.get('*/casahero-api/bare', () => new HttpResponse(null, { status: 200 })));
    await expect(api.get('/bare')).rejects.toMatchObject({
      notJson: true,
      message: expect.stringContaining('no content type'),
    });
  });
});
