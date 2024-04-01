const PlaylistActivitiesHandler = require('./handler')
const routes = require('./routes')

module.exports = {
    name: 'activities',
    version: '1.0.0',
    register: async (server, { service }) => {
        const playlistActivitiesHandler = new PlaylistActivitiesHandler(service)
        server.route(routes(playlistActivitiesHandler))
    }
}