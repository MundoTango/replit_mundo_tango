const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");

class GroupVisitorController extends RestController {

    constructor() {
        super('GroupVisitor')
        this.resource = 'GroupVisitor';
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
                    group_id: "required",
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }

    async beforeStoreLoadModel() {
        let record = await this.modal.orm.findOne({
            where: {
                group_id: this.request.body.group_id,
                user_id: this.request.user.id
            }
        })

        if(record) {
            return this.sendResponse(200, "Group already visited", record)
        }
    }}


module.exports = GroupVisitorController