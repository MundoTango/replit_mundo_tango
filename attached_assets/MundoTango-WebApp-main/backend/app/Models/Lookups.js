const _ = require("lodash")

const RestModel = require("./RestModel");
const { sequelize } = require("../Database");
const User = require("./User");

class Lookup extends RestModel {

    constructor() {
        super("lookups")
    }

    softdelete() {
        return false;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'sports_type'
        ];
    }

    showColumns() {
        return [
            'sports_type'
        ];
    }



    async deleteRecord(request, params, slug) {
        const keys = Object.keys(params);
        const bind = {};
        let key_no;
        if (!keys.length) return;
        let query = 'UPDATE lookups SET'
        for (let i = 0; i < keys.length; i++) {
            key_no = i * 8; // 8 because we have 8 keys to be use in condition
            const key = keys[i];
            const value = params[key];
            if (i > 0) query += ',';
            query += `
            ${key} =
                CASE WHEN ${key} LIKE :var${key_no} THEN REPLACE(${key}, :var${key_no + 1}, '')
                WHEN ${key} LIKE :var${key_no + 2} THEN REPLACE(${key}, :var${key_no + 3}, '')
                WHEN ${key} LIKE :var${key_no + 4} THEN REPLACE(${key}, :var${key_no + 5}, '')
                WHEN ${key} LIKE :var${key_no + 6} THEN REPLACE(${key}, :var${key_no + 7}, NULL)
                ELSE ${key}
            END
            `
            bind[`var${key_no}`] = `%,${value}`
            bind[`var${key_no + 1}`] = `,${value}`
            bind[`var${key_no + 2}`] = `${value},%`
            bind[`var${key_no + 3}`] = `${value},`
            bind[`var${key_no + 4}`] = `%${value},%`
            bind[`var${key_no + 5}`] = `${value},`
            bind[`var${key_no + 6}`] = `${value}`
            bind[`var${key_no + 7}`] = `${value}`
        }
        query += ';';
        console.log("Bind Object : ", bind)
        await sequelize.query(query, {
            replacements: bind,
        });

        await User.instance().removeUserSelection(params);
        return;
    }

    async updateRecord(request, params, slug) {
        const keys = Object.keys(params);
        const bind = {};
        let key_no = 0;
        if (!keys.length) return;

        let query = 'UPDATE lookups SET'
        for (let i = 0; i < keys.length; i++) {
            key_no = i * 3;
            const key = keys[i];
            const value = params[key];
            if (i > 0) query += ',';
            query += `
            ${key} =
                CASE WHEN ${key} LIKE '%,%' THEN Concat(${key},:var${key_no})
                WHEN LENGTH(${key}) > 0 THEN Concat(${key},:var${key_no + 1})
                ELSE :var${key_no + 2}
            END
            `
            bind[`var${key_no}`] = `,${value}`
            bind[`var${key_no + 1}`] = `,${value}`
            bind[`var${key_no + 2}`] = `${value}`
        }
        query += ';';

        console.log("Bind Object ", bind)
        await sequelize.query(query, {
            replacements: bind,
        });
        return;
    }


    async reorderRecord(request, params, slug) {
        let record;
        if (!_.isEmpty(params)) {
            const fields = this.getFields();
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                if (_.isEmpty(params[field]) || !Array.isArray(params[field])) {
                    delete params[field]
                }
                else {
                    params[field] = params[field].join(",")
                }
            }

            record = await this.orm.update(params, {
                where: {
                    slug: slug
                }
            })

        }

        record = await this.getRecordByCondition(request, { slug });
        return record;


    }



}

module.exports = Lookup