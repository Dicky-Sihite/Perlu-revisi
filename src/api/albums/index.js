const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, storageService, validator, cacheService }) => {
    const handler = new AlbumsHandler(service, storageService, validator, cacheService); 
    server.route(routes(handler));
  },
};
