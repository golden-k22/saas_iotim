const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    const Alarm = sequelize.define("alarms", {
        name: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        tenant_id: {
            type: Sequelize.STRING,
            allowNull: false // tenant id MUST have a value
        },
        device_sn: {
            type: Sequelize.STRING,
            allowNull: true 
        },
        group: {
            type: Sequelize.STRING,
            allowNull: true 
        },
        alarm_type: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        low_warning: {
            type: Sequelize.DOUBLE
        },
        high_warning: {
            type: Sequelize.DOUBLE
        },
        low_threshold: {
            type: Sequelize.DOUBLE
        },
        high_threshold: {
            type: Sequelize.DOUBLE
        },
        offline_time: {
            type: Sequelize.INTEGER,
            validate: {
                min: 0,
                max: 10000
                // note: many validations need to be defined in the "validate" object
                // allowNull is so common that it's the exception
            },
            defaultValue: 10   // mins
        },
        repeat: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: [1,1,1,1,1,1,1]
        },
        date_from: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('date_from')).format('YYYY-MM-DD');
            },
            defaultValue: moment.now()
        },
        date_to: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('date_to')).format('YYYY-MM-DD');
            },
            defaultValue: moment().add(2, 'months')
        },
        time_from: {
            type: Sequelize.TIME,
        },
        time_to: {
            type: Sequelize.TIME,
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm');
            },
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
    
    return Alarm;
};
  