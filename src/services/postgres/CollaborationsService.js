const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }
    
    async addCollaborator({ playlistId, userId }) {
        const id = `collab-${nanoid(16)}`;
    
        const query = {
        text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
        values: [id, playlistId, userId],
        };

        const result = await this._pool.query(query);
        
        if (!result.rows[0].id) {
        throw new InvariantError('Collaborator gagal ditambahkan');
        }
    
        return result.rows[0].id;
    }
    
    async deleteCollaborator({ playlistId, userId }) {
        const query = {
        text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
        values: [playlistId, userId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
        throw new InvariantError('Collaborator gagal dihapus');
        }
    }
    
    async verifyCollaborator({ playlistId, userId }) {
        const query = {
        text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
        values: [playlistId, userId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
        throw new InvariantError('Collaborator gagal diverifikasi');
        }
    }

    async getCollaborations(credentialId) {
        const query = {
        text: `SELECT playlists.id, playlists.name, users.username FROM collaborations
            LEFT JOIN playlists ON playlists.id = collaborations.playlist_id
            LEFT JOIN users ON users.id = collaborations.user_id
            WHERE collaborations.user_id = $1`,
        values: [credentialId],
        };
    
        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = CollaborationsService;
