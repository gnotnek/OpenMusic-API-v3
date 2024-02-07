class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;
 
    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }
 
  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const { albumId } = request.params;

    const fileName = await this._storageService.writeFile(cover, cover.hapi, albumId);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${fileName}`;
    await this._albumsService.addCoverByAlbumId(albumId, fileLocation)
 
    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
      data: {
        fileLocation: fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}
 
module.exports = UploadsHandler;