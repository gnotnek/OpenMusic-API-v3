class ExportsHandler {
    constructor(producerService, playlistService, validator) {
        this._producerService = producerService;
        this._playlistService = playlistService;
        this._validator = validator;
    
        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        console.log(request.payload);
        this._validator.validateExportPlaylistPayload(request.payload);

        const playlistId = request.params.playlistId;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
        await this._playlistService.verifyPlaylistExist(playlistId);

        const message = {
            playlistId: request.params.playlistId,
            targetEmail: request.payload.targetEmail,
        };
        
        await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
