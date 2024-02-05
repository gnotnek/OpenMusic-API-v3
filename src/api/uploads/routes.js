const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{albumId}/covers',
        handler: handler.postUploadImageHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                output: 'stream',
                maxBytes: 512000,
            }
        }
    }
];

module.exports = routes;
