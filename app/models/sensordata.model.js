const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    const SensorData = sequelize.define("sensor_data", {        
        sn: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        voltage: {
            type: Sequelize.STRING(10),
        },
        temperature: {
            type: Sequelize.STRING(10)
        },
        humidity: {
            type: Sequelize.STRING(10)
        },
        rssi: {
            type: Sequelize.STRING(10)
        },
        sensor_time: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('sensor_time')).format('YYYY-MM-DD HH:mm');
                // return moment(this.getDataValue('sensor_time'))
                //     .utcOffset(this.getDataValue('offset'));
            },
            
            defaultValue: Sequelize.NOW,
            allowNull: false
        },   
        imei: {
            type: Sequelize.STRING(20),
        },
        imei_registered: {
            type: Sequelize.BOOLEAN
        }     
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
    return SensorData;
};
  