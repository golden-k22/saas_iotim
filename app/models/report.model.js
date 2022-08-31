const moment = require('moment');
const {defaultDate} = require('../utility/date_utils');
module.exports = (sequelize, Sequelize) => {
    const Report = sequelize.define("report", {                
        device_id: {
            type: Sequelize.INTEGER,
            allowNull: false // name MUST have a value
        },
        url: {
            type: Sequelize.STRING,
        },
        from: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('from')).format('YYYY-MM-DD HH:mm');
                // return moment(this.getDataValue('sensor_time'))
                //     .utcOffset(this.getDataValue('offset'));
            },
        },
        to: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('to')).format('YYYY-MM-DD HH:mm');
                // return moment(this.getDataValue('sensor_time'))
                //     .utcOffset(this.getDataValue('offset'));
            },
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm');
            },
            defaultValue: defaultDate(0)
        },        
        // createdAt: {
        //     type: Sequelize.DATE,
        //     get() {
        //         return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm');
        //     },
        //     defaultValue: Sequelize.NOW,
        //     allowNull: false
        // } ,
        // updatedAt: {
        //     type: Sequelize.DATE,
        //     get() {
        //         return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm');
        //     },
        //     defaultValue: Sequelize.NOW,
        //     allowNull: false
        // } 
               
    });
    return Report;
};
  