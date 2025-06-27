const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");
const emailHandler = require("../Libraries/EmailHandler/EmailHandler");
const { generateOTP } = require("../Helper");
const SmsHandler = require("../Libraries/SmsHandler");
const constants = require("../config/constants")

class UserOTP extends RestModel {

    constructor() {
        super("user_otp")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'email', 'mobile_no'
        ];
    }



    showColumns() {
        return [
            'slug', 'email', 'mobile_no'
        ];
    }

    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.otp = generateOTP()

    }

    async afterCreateHook(record, request, params) {
        const result = record.toJSON()
        if (constants.EMAIL_VERIFICATION && result.email) {
            const email = await emailHandler.sendOTP(result.email, result.otp);
        }

        if (constants.SMS_VERIFICATION && result.mobile_no) {
            const mobile_no = await SmsHandler.instance().sendOTP(result.mobile_no, result.otp)
        }
    }

    async verifyOTP(request, params) {
        const email = params?.email || '';
        const otp = params.otp;

        const record = await this.orm.findOne({
            where: {
                email: email,
                deletedAt: null,
            },
            order: [['createdAt', 'DESC']],
        })

        if (_.isEmpty(record) || (record?.toJSON().otp != otp)) return {}

        return record.toJSON()

    }

    async deleteRecord(email = '', mobile_no = '') {
        const conditions = {};
        if (email) {
            conditions.email = email
        }
        if (mobile_no) {
            conditions.mobile_no = mobile_no
        }

        const query = await this.orm.update({
            deletedAt: new Date()
        }, {
            where: conditions
        })
        return true;

    }






}

module.exports = UserOTP