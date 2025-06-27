const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");

class HelpSupportController extends RestController {

    constructor() {
        super('HelpSupport')
        this.resource = 'HelpSupport';
        // this.__collection = false
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
                    name: "required",
                    email: "required",
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }

}


module.exports = HelpSupportController