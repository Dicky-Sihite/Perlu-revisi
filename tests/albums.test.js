const request = require('supertest');
const app = require('../server');

describe('Albums API', () => {
  let albumId;
  let accessToken;

  beforeAll(async () => {
    // Setup test user and get access token
    const userPayload = {
      username: 'testuser',
      password: 'testpassword',
      fullname: 'Test User',
    };

    await request(app)
      .post('/users')
      .send(userPayload);

    const authResponse = await request(app)
      .post('/authentications')
      .send({
        username: userPayload.username,
        password: userPayload.password,
      });

    accessToken = authResponse.body.data.accessToken;
  });

  describe('POST /albums', () => {
    it('should create a new album', async () => {
      const albumPayload = {
        name: 'Test Album',
        year: 2023,
      };

      const response = await request(app)
        .post('/albums')
        .send(albumPayload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.albumId).toBeDefined();

      albumId = response.body.data.albumId;
    });
  });

  describe('POST /albums/{id}/likes', () => {
    it('should like an album', async () => {
      const response = await request(app)
        .post(`/albums/${albumId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /albums/{id}/likes', () => {
    it('should get album likes count', async () => {
      const response = await request(app)
        .get(`/albums/${albumId}/likes`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.likes).toBe(1);
    });
  });
});