const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const fs = require('fs');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum(name, year) {
        const id = `album-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows[0];
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async addCoverByAlbumId(id, coverUrl) {
        const query = {
            text: 'UPDATE albums SET cover = $2 WHERE id = $1 RETURNING id, cover',
            values: [id, coverUrl],
        };

        const result = await this._pool.query(query);
        
        if (!result.rows.length) {
            throw new InvariantError('Cover gagal ditambahkan');
        }
    }

    async getCoversByAlbumId(id) {
        const coverDir = 'src/api/uploads/file/images'
        const coverFiles = await fs.promises.readdir(coverDir);

        const coverFileName = coverFiles.find(fileName => fileName.includes(id));

        if (!coverFileName) {
            return null;
        } else {
            const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${coverFileName}`;
            return coverUrl; 
        }
    }
}

module.exports = AlbumsService;
