const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class PlaylistSongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSong({ playlistId, songId }) {
        await this.verifyPlaylistSongExist(songId);
        await this.verifyPlaylistSongExistInPlaylist(playlistId, songId);

        const id = `playlistsongs-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        return result.rows[0].id;
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
            LEFT JOIN songs ON songs.id = playlist_songs.song_id
            WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async deletePlaylistSongById(songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus dari playlist');
        }
    }

    async verifyPlaylistSong(playlistId, songId) {
        const query = {
            text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan di playlist');
        }
    }

    async verifyPlaylistSongOwner(playlistId, songId) {
        const query = {
            text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistSongAccess(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1 AND owner = $2',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistSongExist(songId) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
    }

    async verifyPlaylistSongExistInPlaylist(playlistId, songId) {
        const query = {
            text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (result.rows.length) {
            throw new InvariantError('Lagu sudah ada di playlist');
        }
    }  
}

module.exports = PlaylistSongsService;
