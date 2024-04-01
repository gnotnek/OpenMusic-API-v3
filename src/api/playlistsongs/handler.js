const autoBind = require('auto-bind');

class PlaylistSongsHandler {
    constructor(playlistSongsService, playlistsService, playlistActivitiesService, validator) {
        this._playlistSongsService = playlistSongsService;
        this._playlistsService = playlistsService;
        this._playlistActivitiesService = playlistActivitiesService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongsService.addPlaylistSong({ playlistId, songId, credentialId });
        await this._playlistActivitiesService.addPlaylistActivity({ playlistId, userId: credentialId, activity: 'add' });

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const songs = await this._playlistSongsService.getPlaylistSongs(playlistId);

        const playlist = await this._playlistsService.getPlayListById(playlistId);

        return {
            status: 'success',
            data: {
                playlist:{
                    id: playlist.id,
                    name: playlist.name,
                    username: playlist.username,
                    songs,
                }
            },
        };
    }

    async deletePlaylistSongHandler(request) {
        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongsService.deletePlaylistSongById(songId);
        await this._playlistActivitiesService.addPlaylistActivity({ playlistId, userId: credentialId, activity: 'delete' });

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}

module.exports = PlaylistSongsHandler;
