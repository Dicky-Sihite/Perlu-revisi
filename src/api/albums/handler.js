const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, storageService, validator, cacheService) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._cacheService = cacheService;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });

      return h.response({
        status: 'success',
        data: { albumId },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async getAlbumsHandler(request, h) {
    try {
      const albums = await this._service.getAlbums();
      return { status: 'success', data: { albums } };
    } catch (error) {
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return { status: 'success', data: { album } };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const { id } = request.params;

      await this._service.editAlbumById(id, { name, year });

      return { status: 'success', message: 'Album berhasil diperbarui' };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return { status: 'success', message: 'Album berhasil dihapus' };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async getAlbumLikesHandler(request, h) {
    try {
      const { id } = request.params;
      const { likes, source } = await this._service.getAlbumLikes(id);

      return h.response({
        status: 'success',
        data: { likes },
      }).header('X-Data-Source', source);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async postAlbumLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._service.getAlbumById(albumId);
      await this._service.addAlbumLike(albumId, userId);

      try {
        await this._cacheService.delete(`album_likes:${albumId}`);
      } catch (cacheError) {
        console.error('Cache delete error:', cacheError);
      }

      return h.response({
        status: 'success',
        message: 'Album berhasil disukai',
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }

  async deleteAlbumLikeHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._service.getAlbumById(albumId);
      await this._service.removeAlbumLike(userId, albumId);

      try {
        await this._cacheService.delete(`album_likes:${albumId}`);
      } catch (cacheError) {
        console.error('Cache delete error:', cacheError);
      }

      return {
        status: 'success',
        message: 'Album batal disukai',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
      }
      console.error(error);
      return h.response({ status: 'error', message: 'Maaf, terjadi kegagalan pada server kami.' }).code(500);
    }
  }
}

module.exports = AlbumsHandler;