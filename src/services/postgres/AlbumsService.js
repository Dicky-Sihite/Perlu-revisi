const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService, storageService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
    this._storageService = storageService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new InvariantError('Album gagal ditambahkan');
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT id, name, year FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);
    if (!albumResult.rows.length) throw new NotFoundError('Album tidak ditemukan');

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const albumRow = albumResult.rows[0];

    return {
      id: albumRow.id,
      name: albumRow.name,
      year: albumRow.year,
      coverUrl: albumRow.cover_url ?? null,

      songs: songsResult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
  }

  async addAlbumCover(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Gagal menambahkan cover. Id tidak ditemukan');
  }

  async addAlbumLike(albumId, userId) {
    await this.verifyAlbumExists(albumId);

    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    const insertQuery = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };

    await this._pool.query(insertQuery);
    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async removeAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal batal menyukai album');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    const result = await this._cacheService.get(`album_likes:${albumId}`);

    if (result !== null && !isNaN(parseInt(result, 10))) {
      return {
        likes: parseInt(result, 10),
        source: 'cache',
      };
    }

    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const resultDb = await this._pool.query(query);
    const likes = parseInt(resultDb.rows[0].count, 10);

    await this._cacheService.set(`album_likes:${albumId}`, likes.toString());
    return {
      likes,
      source: 'database',
    };
  }

  async verifyAlbumExists(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Album tidak ditemukan');
  }
}

module.exports = AlbumsService;