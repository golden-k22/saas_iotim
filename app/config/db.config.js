module.exports = {
    HOST: "localhost",
    PORT: '5432',
    USER: "postgres",
    PASSWORD: "postgres",
    DB: "iotim",
    dialect: "postgres",
    timezone: "Europe/London",  // this means UTC timezone
    local_timezone: "Asia/Singapore", 
    ssl: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
