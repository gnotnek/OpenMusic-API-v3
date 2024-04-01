const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');

class PlaylistActivitiesService {
    constructor(playlistService){
        this._pool = new Pool();
        this._playlistService = playlistService;
    }

    async addPlaylistActivity({ playlistId, userId, activity }) {
        const id = `playlistactivities-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, playlistId, userId, activity],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Activity gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylistActivities(playlistId) {
        await this._playlistService.verifyPlaylistExist(playlistId);

        const query = {
            text: `SELECT users.username,  playlist_song_activities.* FROM  playlist_song_activities
            LEFT JOIN users ON users.id =  playlist_song_activities.user_id
            WHERE  playlist_song_activities.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }
}

module.exports = PlaylistActivitiesService;