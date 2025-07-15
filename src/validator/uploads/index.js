const { validateCoverHeaders } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UploadsValidator = {
  validateCoverHeaders: (headers) => {
    const { error } = validateCoverHeaders(headers);
    if (error) {
      throw new InvariantError('Format file tidak valid. Hanya mendukung .jpg, .jpeg, dan .png');
    }
  },
};

module.exports = UploadsValidator;
