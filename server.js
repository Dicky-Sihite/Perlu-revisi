require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./src/exceptions/ClientError');

// Albums
const albums = require('./src/api/albums');
const AlbumsService = require('./src/services/postgres/AlbumsService');
const AlbumsValidator = require('./src/validator/albums');

// Songs
const songs = require('./src/api/songs');
const SongsService = require('./src/services/postgres/SongsService');
const SongsValidator = require('./src/validator/songs');

// Playlists
const playlists = require('./src/api/playlists');
const PlaylistsService = require('./src/services/postgres/PlaylistsService');
const PlaylistsValidator = require('./src/validator/playlists');

// Playlist Activities
const playlistActivities = require('./src/api/playlist_activities');
const PlaylistActivitiesService = require('./src/services/postgres/PlaylistActivitiesService');

// Users
const users = require('./src/api/users');
const UsersService = require('./src/services/postgres/UsersService');
const UsersValidator = require('./src/validator/users');

// Authentications
const authentications = require('./src/api/authentications');
const AuthenticationsService = require('./src/services/postgres/AuthenticationsService');
const TokenManager = require('./src/tokenize/TokenManager');
const AuthenticationsValidator = require('./src/validator/authentications');

// Collaborations
const collaborations = require('./src/api/collaborations');
const CollaborationsService = require('./src/services/postgres/CollaborationsService');
const CollaborationsValidator = require('./src/validator/collaborations');

// Exports
const _exports = require('./src/api/exports');
const ProducerService = require('./src/services/rabbitmq/ProducerService');
const ExportsValidator = require('./src/validator/exports');

// Uploads
const uploads = require('./src/api/uploads');
const StorageService = require('./src/services/storage/StorageService');
const UploadsValidator = require('./src/validator/uploads');

// Cache
const CacheService = require('./src/services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();

  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(collaborationsService, cacheService);

  const storageService = new StorageService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
      payload: {
        maxBytes: 1000000, // 1 MB
        output: 'data',
        parse: true,
        multipart: true,
      },
    },
  });

  await server.register([
    { plugin: Jwt },
    { plugin: Inert },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
        storageService,
        cacheService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        collaborationsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistActivities,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    // Tambahan untuk menangani error 413 (Payload Too Large)
    if (response.isBoom && response.output.statusCode === 413) {
      return h.response({
        status: 'fail',
        message: 'Ukuran file terlalu besar',
      }).code(413);
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
