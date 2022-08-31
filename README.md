# IOT integration Middleware with Node.js, PostgreSQL and Express Rest APIs



## Ip and port 

In server.js, change following settings your server's ip
```
const hostname = "http://127.0.0.1";
const serverPort = 8082;    // Suggest to use this value
```

## DB Setting 

In app/config/db.config.js, change following settings according to your DB information.
```
    HOST: "localhost",      // hostname DB hosted
    PORT: '5432',
    USER: "postgres",       // DB user name
    PASSWORD: "done100",
    DB: "iotim",            // DB name
```

### Run
```
npm start
```
