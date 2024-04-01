const routes = (handler) => [
    {
        method: 'GET',
        path: '/playlists/{playlistId}/activities',
        handler: handler.getPlaylistActivitiesHandler,
    },
]

module.exports = routes;