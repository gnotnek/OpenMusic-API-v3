class UserAlbumLikesHandler {
    constructor(service){
        this._service = service;
        
        this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
        this.getUserAlbumLikesHandler = this.getUserAlbumLikesHandler.bind(this);
        this.deleteUserAlbumLikeHandler = this.deleteUserAlbumLikeHandler.bind(this);
    }

    async postUserAlbumLikeHandler(request, h){
        const { id: credentialId } = request.auth.credentials;
        const { albumId } = request.params;

        await this._service.addUserAlbumLike(credentialId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Like album berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async getUserAlbumLikesHandler(request, h){
        const { albumId } = request.params;

        const totalLikes = await this._service.getTotalAlbumLikes(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes: parseInt(totalLikes.count, 10),
            },
        });
        if(totalLikes.source === 'cache'){
            response.header('X-Data-Source', 'cache');
        }
        response.code(200);
        return response;
    }

    async deleteUserAlbumLikeHandler(request, h){
        const { id: credentialId } = request.auth.credentials;
        const { albumId } = request.params;

        await this._service.deleteUserAlbumLike(credentialId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Like album berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = UserAlbumLikesHandler;