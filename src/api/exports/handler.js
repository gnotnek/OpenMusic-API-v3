class ExportsHandler {
    constructor(producerService, playlistService, validator) {
        this._ProducerService = producerService;
        this._PlaylistService = playlistService;
        this._validator = validator;
    
        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);

        const playlistId = request.params.playlistId;
        const { id: credentialId } = request.auth.credentials;

        await this._PlaylistService.verifyPlaylistAccess(playlistId, credentialId);

        const message = {
            playlistId: request.params.playlistId,
            targetEmail: request.payload.targetEmail,
        };
        
        await this._ProducerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
