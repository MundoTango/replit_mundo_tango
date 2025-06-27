const { baseUrl, baseUploadDir } = require("../Helper");
const FileHandler = require("../Libraries/FileHandler/FileHandler");
const Controller = require("./Controller");

class UploadController extends Controller {

    constructor() {
        super()
        this.request;
        this.response;
        this.params;
    }

    async uploadMedia({ request, response }) {
        this.request = request;
        this.response = response
        try {
            if (!request.files?.length) {
                return this.sendError(
                    "Unable to get file object",
                    {},
                    500
                )
            }
            let url = await FileHandler.doUpload(request.files[0], baseUploadDir());
            if (!url.startsWith('http')) {
                url = baseUrl() + url
            }
            this.__collection = false;
            this.__is_paginate = false
            this.sendResponse(
                200,
                "File Uploaded Successfully",
                { link: url }
            )


        }
        catch (err) {
            console.log(err)
            return this.sendError(
                "Failed to upload image",
                {},
                500
            )

        }
    }

}

module.exports = UploadController;