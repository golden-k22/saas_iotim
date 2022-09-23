const addOne = require("./crud_utils.js");
const db = require("../models");
module.exports = async function initDB() {    
    db.sequelize.query("CREATE TABLE IF NOT EXISTS group (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, status INTEGER DEFAULT 1, remark TEXT, created_at TIMESTAMP WITHOUT TIME ZONE, updated_at TIMESTAMP WITHOUT TIME ZONE,tenant_id VARCHAR(255) NOT NULL);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS alarms(Id SERIAL PRIMARY KEY, name VARCHAR(60), device_sn VARCHAR(20),  alarm_type INT2, low_warning REAL, high_warning REAL, low_threshold REAL, high_threshold REAL, offline_time INT2, repeat int[], date_from timestamp without time zone, date_to timestamp without time zone, time_from TIME, time_to TIME, created_at timestamp without time zone, status INT2,tenant_id VARCHAR(255) NOT NULL );")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS report(Id SERIAL PRIMARY KEY, device_id INT2, url VARCHAR(255), \"from\" timestamp without time zone, \"to\" timestamp without time zone, created_at timestamp without time zone);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS devices(Id SERIAL PRIMARY KEY, name VARCHAR(60), SN VARCHAR(20),  type INT2, \"group\" INT2, password VARCHAR(30),  interval INT2, remark VARCHAR(100), status INT2, created_at timestamp without time zone, updated_at timestamp without time zone, expire_at timestamp without time zone,tenant_id VARCHAR(255) NOT NULL);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS gateway(Id SERIAL PRIMARY KEY, name VARCHAR(60), imei VARCHAR(20),  type INT2, phone_number VARCHAR(20), remark VARCHAR(100), status INT2, created_at timestamp without time zone, updated_at timestamp without time zone,tenant_id VARCHAR(255) NOT NULL);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS sensor_data(Id SERIAL PRIMARY KEY, SN VARCHAR(20), Voltage VARCHAR(6), Temperature VARCHAR(7), Humidity VARCHAR(5), RSSI VARCHAR(5), Sensor_Time timestamp without time zone, imei VARCHAR(30), imei_registered BOOL);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS alarm_records(Id SERIAL PRIMARY KEY, alarm_name VARCHAR(60), sn VARCHAR(20), alarm_type INT2, alarm_item INT2, current_value REAL, setting_value REAL, message VARCHAR(130), status INT2, alarm_time timestamp without time zone, created_at timestamp without time zone, updated_at timestamp without time zone);")
    db.sequelize.query("CREATE TABLE IF NOT EXISTS utilizations(Id SERIAL PRIMARY KEY, type VARCHAR(10) NOT NULL,tenant_id VARCHAR(255) NOT NULL, to_address VARCHAR(255) NOT NULL, content VARCHAR(255) NOT NULL, created_at timestamp without time zone);")
    
    new_types = [
        {name: "TZ-WF501"},
        {name: "TZ-TT18(4G)"},
        {name: "TZ-TAG08"},
        {name: "TZ-TAG08B"},
        {name: "TZ-TAG07"},
        {name: "TZ-LoRaWan"},
        {name: "TZ-TAG07C"},
        {name: "TZ-TT11(3G)"},
        {name: "TZ-D01"},
        {name: "TZ-LoRa"},
        {name: "TZ-TAG06B"},
        {name: "TZ-TAG06"},
        {name: "TZ-TAG05"},
        {name: "TZ-TT03"},
        {name: "TZ-TT01"},
        {name: "TZ-BT04"},
        {name: "TZ-TAG04"},
        {name: "TZ-TT18"},
        {name: "TT11"}        
    ]
    db.DeviceTypes.sync().then(() => {
        db.DeviceTypes.count({where: {status: 1}})
        .then(cnt => {
            if (cnt == 0){
                console.log("adding new Device types.");
                new_types.map(async (new_type) => {
                    await addOne(db.DeviceTypes, new_type);
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    })

    gateway_types = [
        {name: "TZ-LoRaWan"},
        {name: "TZ-LoRa Gateway"},
        {name: "TZ-RD06"},
        {name: "TZ-RD05"},
        {name: "TZ-RD07 4G"},
        {name: "TZ-WINCE07"},
        {name: "TZ-AVL05 3G"},
        {name: "TZ-AVL19"},
        {name: "TZ-AVL11"}   
    ]
    db.GatewayTypes.sync().then(() => {
        db.GatewayTypes.count({where: {status: 1}})
        .then(cnt => {
            if (cnt == 0){
                console.log("adding new Gateway types.");
                gateway_types.map(async (new_type) => {
                    await addOne(db.GatewayTypes, new_type);
                })
            }
        })
        .catch(err => {
            console.log(err);
        });
    })
    
}
