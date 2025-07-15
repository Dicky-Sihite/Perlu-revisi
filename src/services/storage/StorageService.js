const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const mime = require('mime-types');

class StorageService {
  constructor() {
    this._s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this._bucketName = process.env.AWS_BUCKET_NAME;

    if (!this._bucketName) {
      throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
    }
  }

  async uploadToS3(file, meta) {
    const contentType = meta.headers['content-type'];
    const extension = mime.extension(contentType);

    if (!extension) {
      throw new Error('Unsupported file type');
    }

    const filename = `cover-${nanoid(16)}.${extension}`;

    const params = {
      Bucket: this._bucketName,
      Key: filename,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await this._s3.upload(params).promise();

    return result.Location; // Full public URL to access file
  }
}

module.exports = StorageService;
