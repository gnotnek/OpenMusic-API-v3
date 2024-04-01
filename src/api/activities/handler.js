class PlaylistActivitiesHandler {
    constructor(service) {
        this._service = service;

        this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
     }

    async getPlaylistActivitiesHandler(request, h) {
        const { id: playlistId } = request.params;
        const activities = await this._service.getPlaylistActivities(playlistId);

        const response = h.response({
            status: 'success',
            data: {
                activities,
            },
        });
        response.code(401);
        return response;
    }
}

module.exports = PlaylistActivitiesHandler;