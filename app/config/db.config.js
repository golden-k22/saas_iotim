module.exports = {
    HOST: "private-app-82ccd341-8d5f-42fb-a861-ba64cd35858b-do-user-103446.b.db.ondigitalocean.com",
    PORT: '25060',
    USER: "temptestdb",
    PASSWORD: "BFZSImyMF0LeDeQY",
    DB: "iotim",
    dialect: "postgres",
    timezone: "Europe/London",  // this means UTC timezone
    local_timezone: "Asia/Singapore", 
    ssl: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
