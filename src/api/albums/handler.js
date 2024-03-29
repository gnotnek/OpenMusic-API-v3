const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(albumsService, songsService, validator) {
        this._albumsService = albumsService;
        this._songsService = songsService;
        this._validator = validator;
        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const {name, year} = request.payload;

        const albumId = await this._albumsService.addAlbum( name, year );

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });

        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;
        const album = await this._albumsService.getAlbumById(id);
        const songs = await this._songsService.getSongsByAlbumId(id);

        const data = {
            id: album.id,
            name: album.name,
            year: album.year,
            songs: songs.map((song) => ({
                id: song.id,
                title: song.title,
                performer: song.performer,
            })),
            coverUrl: album.cover,
        };

        return {
            status: 'success',
            data: {
                album: data,
            }
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;

        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }
}

module.exports = AlbumsHandler;
