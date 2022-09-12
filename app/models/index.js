const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,    
    dialect: dbConfig.dialect,
    // timezone: "+8:00", 
    define: {
        underscored: true,
        freezeTableName: true, //use singular table name
        timestamps: false,  // I do not want timestamp fields by default
    },
    ssl: dbConfig.ssl,              // this is for DB hosting
    dialectOptions: {
        ssl: dbConfig.ssl,     // this is for DB hosting
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
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
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
