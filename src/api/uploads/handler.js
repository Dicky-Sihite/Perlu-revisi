const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(storageService, validator, albumsService) {
    this._storageService = storageService;
    this._validator = validator;
    this._albumsService = albumsService;

    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params;

      // Validasi: pastikan ada file dikirim
      if (!cover) {
      return h.response({
        status: 'fail',
        message: 'Tidak ada file yang dikirim',
      }).code(400);
    }

      // Validasi header file (Content-Type, dll)
      this._validator.validateCoverHeaders(cover.hapi.headers);

      // Upload ke Amazon S3
      const fileUrl = await this._storageService.writeFileS3(cover, cover.hapi);

      // Simpan URL ke database
      await this._albumsService.addAlbumCover(id, fileUrl);

      // Respons sukses
      return h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
        data: {
          fileUrl,
        },
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
        message: 'Terjadi kesalahan pada server.',
      }).code(500);
    }
  }
}

module.exports = UploadsHandler;
