const moment = require('moment');
const {defaultDate} = require('../utility/date_utils')
module.exports = (sequelize, Sequelize) => {
    const Device = sequelize.define("devices", {
        name: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        tenant_id: {
            type: Sequelize.STRING,
            allowNull: false // tenant id MUST have a value
        },
        sn: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        type: {
            type: Sequelize.INTEGER
        },
        group: {
            type: Sequelize.INTEGER
        },
        password: {
            type: Sequelize.STRING
        },
        interval: {
            type: Sequelize.STRING
        },
        remark: {
            type: Sequelize.STRING
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm');
            }
        },
        expire_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('expire_at')).format('YYYY-MM-DD HH:mm');
            }
        },
        updated_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('updated_at')).format('YYYY-MM-DD HH:mm');
            }
        },
        status: {
            type: Sequelize.INTEGER,
            validate: {
                min: 0,
                max: 100
                // note: many validations need to be defined in the "validate" object
                // allowNull is so common that it's the exception
            },
            defaultValue: 1  // 0-deleted, 1-active
        }
    });
    return Device;
};
  