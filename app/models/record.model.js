const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    const Record = sequelize.define("alarm_records", {
        alarm_name: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },    
        sn: {
            type: Sequelize.STRING,
            allowNull: false // sn MUST have a value
        },   
        imei: {
            type: Sequelize.STRING,
            allowNull: false // imei MUST have a value
        },
        alarm_type: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        alarm_item: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        current_value: {
            type: Sequelize.DOUBLE
        },
        setting_value: {
            type: Sequelize.DOUBLE
        },
        message: {
            type: Sequelize.TEXT
        },        
        alarm_time: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('alarm_time')).format('YYYY-MM-DD HH:mm');
            },
            defaultValue: moment.now()
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss');
            },
            defaultValue: moment.now()
        },
        updated_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('updated_at')).format('YYYY-MM-DD HH:mm');
            },
            defaultValue: moment.now()
        },
        status: {
            type: Sequelize.INTEGER,
            validate: {
                min: 0,
                max: 10
                // note: many validations need to be defined in the "validate" object
                // allowNull is so common that it's the exception
            },
            defaultValue: 1   // 0-deleted, 1-active
        }
    });
    return Record;
};
  