const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{albumId}/likes',
        handler: handler.postUserAlbumLikeHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{albumId}/likes',
        handler: handler.getUserAlbumLikesHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{albumId}/likes',
        handler: handler.deleteUserAlbumLikeHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    }
];

module.exports = routes;
