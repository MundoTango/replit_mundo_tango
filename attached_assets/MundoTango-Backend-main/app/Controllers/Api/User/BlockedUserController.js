const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Attachment = require('../../../Models/Attachment')
const User = require('../../../Models/User')
const {BASE_URL} = require("../../../config/constants");

class BlockedUserController extends RestController {

    constructor() {
        super('BlockedUser')

        this.resource = 'BlockedUser';
        this.__collection = false

        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;
        let customMessages = {
            required: 'You forgot to give a :attribute',
            'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
            same: ":attribute is not same as password"

        }

        switch (action) {
            case "store":
                rules = {
                    blocked_user_id: "required"
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }
}


module.exports = BlockedUserController