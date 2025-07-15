const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    try {
      this._validator.validateExportPlaylistsPayload(request.payload);
      
      const userId = request.auth.credentials.id;
      const { playlistId } = request.params;

      await this._playlistsService.getPlaylistById(playlistId);

      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage('export:playlists', JSON.stringify(message));

      return h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      console.error(error);
      return h.response({
        status: 'error',
        message: error.message,
      }).code(500);
    }
  }
}

module.exports = ExportsHandler;
