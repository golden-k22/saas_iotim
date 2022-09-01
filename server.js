const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use('/storage', express.static('storage')); // <-- This right here
const initDB = require("./app/utility/psqldb_init.js");


const hostname = "http://127.0.0.1";
const serverPort = 8082;
const crossPort = 8008;

var corsOptions = {
    origin: hostname+":"+crossPort
};

const corsOpts = {
    origin: '*',
  
    methods: [
        'GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'
    ],
  
    allowedHeaders: [
      'Content-Type','Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept'
    ],
  };

app.use(cors(corsOpts));


// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));



// const db = require("./app/models");
initDB();

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
// app.get("/", (req, res) => {
//     res.json({message: "Welcome to IoT Service Integration Middleware."});
// });

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
    next();
  });

require("./app/routes/device.routes")(app);
require("./app/routes/gateway.routes")(app);
require("./app/routes/alarm.routes")(app);
require("./app/routes/history.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || serverPort;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    const { asUTCDate, defaultDate, getDatenow, getLocalDatenow, toLocalDate } = require("./app/utility/date_utils");
    const utcdate_str = "2021-12-29 10:00";
    console.log(toLocalDate(utcdate_str));
    console.log(asUTCDate(utcdate_str));
});
