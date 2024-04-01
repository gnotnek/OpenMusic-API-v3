const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlistsongs',
    version: '1.0.0',
    register: async (server, { playlistSongsService, playlistsService, playlistactivitiesService, validator }) => {
        const playlistSongsHandler = new PlaylistSongsHandler(
        playlistSongsService,
        playlistsService,
        playlistactivitiesService,
        validator,
        );
        server.route(routes(playlistSongsHandler));
    },
};