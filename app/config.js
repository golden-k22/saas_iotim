// module.exports = {
//     HOST: "localhost",
//     PORT: '5432',
//     USER: "postgres",
//     PASSWORD: "postgres",
//     DB: "iotim",
//     dialect: "postgres",    
//     // timezone: "Atlantic/Reykjavik",  // this means UTC timezone
//     timezone: "Europe/London",  // this means UTC timezone
//     local_timezone: "Asia/Singapore", 
//     ssl: false,
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },
//     billing_check_url:"http://10.99.4.7:8000/api/subscription/plan?tenant="
// };

// Host setting
module.exports = {
    HOST: "private-app-82ccd341-8d5f-42fb-a861-ba64cd35858b-do-user-103446.b.db.ondigitalocean.com",
    PORT: '25060',
    USER: "saas_iotim360",
    PASSWORD: "AVNS_hbxq1Qzy46wiynSdVLq",
    DB: "saasiotim",
    dialect: "postgres",
    timezone: "Europe/London",  // this means UTC timezone
    local_timezone: "Asia/Singapore", 
    ssl: true,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    billing_check_url:"https://iotwave.tpitservice.com/api/subscription/plan?tenant="
};