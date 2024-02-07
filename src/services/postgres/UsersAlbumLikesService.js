const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class UsersAlbumLikesService {
    constructor(albumsService, cacheService){
        this._pool = new Pool();
        this._albumsService = albumsService;
        this._cacheService = cacheService;
    }

    async addUserAlbumLike(userId, albumId){
        await this._albumsService.verifyAlbumExist(albumId);
        await this.verifyUserAlreadyLikedAlbum(userId, albumId);

        const id = `user_album_like-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };
        
        const result = await this._pool.query(query);

        await this._cacheService.delete(`album-likes:${albumId}`);

        if(!result.rows.length){
            throw new InvariantError('Gagal menambahkan like album');
        }
    }

    async getTotalAlbumLikes(albumId){
        try {
            // mendapatkan data dari cache
            const result = await this._cacheService.get(`album-likes:${albumId}`);
            return {count: JSON.parse(result), source: 'cache'};
        } catch (error) {
            // mendapatkan data dari database
            const query = {
                text: 'SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);

            await this._cacheService.set(`album-likes:${albumId}`, result.rows[0].count);

            return {count: result.rows[0].count, source: 'database'};
        }
    }

    async deleteUserAlbumLike(userId, albumId){
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        await this._cacheService.delete(`album-likes:${albumId}`);

        if(!result.rows.length){
            throw new InvariantError('Gagal menghapus like album');
        }
    }

    async verifyUserAlreadyLikedAlbum(userId, albumId){
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if(result.rows.length > 0 && result.rows[0].user_id === userId){
            throw new InvariantError('Gagal menambahkan like album. User sudah menambahkan like album');
        }
    }
    
}

module.exports = UsersAlbumLikesService;
