module.exports = app => {
    const sensordata = require("../controllers/history.controller.js");

    var router_history = require("express").Router();    
    router_history.get("/:id", sensordata.get_History);

    var router_report = require("express").Router();
    // make a report of sensor data for given sensor id
    router_report.post("/:device_id", sensordata.make_Report);
    // download report 
    router_report.get("/download/:report_id", sensordata.download_Report);
    // get list of all reports regarding to the device having given id.
    router_report.get("/:device_id", sensordata.get_ReportList);
    // Delete a Report with report id
    router_report.delete("/:id", sensordata.delete_Report);

    var router_status = require("express").Router();  
    // get latest status of all devices
    router_status.get("/latest", sensordata.get_LatestStatus);

    app.use("/iot-service/v1/history", router_history);
    app.use("/iot-service/v1/reports", router_report);
    app.use("/iot-service/v1/status", router_status);
};