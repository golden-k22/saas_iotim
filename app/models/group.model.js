const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    const Group = sequelize.define("group", {
        name: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        tenant_id: {
            type: Sequelize.STRING,
            allowNull: false // tenant id MUST have a value
        },
        status: {
            type: Sequelize.INTEGER,
            validate: {
                min: 0,
                max: 3
                // note: many validations need to be defined in the "validate" object
                // allowNull is so common that it's the exception
            },
            defaultValue: 1  // 0-deleted, 1-active
        },
        remark: {
            type: Sequelize.TEXT
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm');
            }
        },
        updated_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('updated_at')).format('YYYY-MM-DD HH:mm');
            }
        },
    });
    return Group;
};
  