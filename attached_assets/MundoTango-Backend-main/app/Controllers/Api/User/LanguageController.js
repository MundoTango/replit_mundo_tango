const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Attachment = require('../../../Models/Attachment')
const User = require('../../../Models/User')
const {BASE_URL} = require("../../../config/constants");

class LanguageController extends RestController {

    constructor() {
        super('Language')

        this.resource = 'Language';
        this.__collection = false

        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }
}


module.exports = LanguageController