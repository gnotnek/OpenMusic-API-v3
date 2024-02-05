class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
 
    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }
 
  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);
 
    const fileLocation = await this._service.writeFile(cover, cover.hapi);
 
    const response = h.response({
      status: 'success',
      mesaage: 'Sampul berhasil diunggah',
      data: {
        fileLocation: fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}
 
module.exports = UploadsHandler;