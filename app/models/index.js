const config = require("../config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    host: config.HOST,
    port: config.PORT,    
    dialect: config.dialect,
    // timezone: "+8:00", 
    define: {
        underscored: true,
        freezeTableName: true, //use singular table name
        timestamps: false,  // I do not want timestamp fields by default
    },
    ssl: config.ssl,              // this is for DB hosting
    dialectOptions: {
        // ssl:config.ssl,
        ssl: {
            require: config.ssl,
            rejectUnauthorized: false // <<<<<<< YOU NEED THIS
        },
        useUTC: false,  //for reading from database
        dateStrings: true,
        typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATE') {
                return field.string()
            }
            return next()
        },
    },
    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
    }
});

sequelize.authenticate().then(function (err) {
    if (err) console.log('Unable to connect to the PostgreSQL database:', err);
    console.log('Connection has been established successfully.');
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Devices = require("./device.model.js")(sequelize, Sequelize);
db.Alarms = require("./alarm.model.js")(sequelize, Sequelize);
db.DeviceTypes = require("./devicetype.model.js")(sequelize, Sequelize);
db.Groups = require("./group.model.js")(sequelize, Sequelize);
db.Records = require("./record.model.js")(sequelize, Sequelize);
db.SensorDatas = require("./sensordata.model.js")(sequelize, Sequelize);
db.Reports = require('./report.model.js')(sequelize, Sequelize);
db.Gateways = require('./gateway.model.js')(sequelize, Sequelize);
db.GatewayTypes = require('./gatewaytype.model.js')(sequelize, Sequelize);

module.exports = db;
