module.exports = app => {
    const sensordata = require("../controllers/history.controller.js");

    var router_history = require("express").Router();    
    router_history.get("/:tenant_id/history/:id", sensordata.get_History);

    var router_report = require("express").Router();
    // make a report of sensor data for given sensor id
    router_report.post("/:tenant_id/reports/:device_id", sensordata.make_Report);
    // download report 
    router_report.get("/:tenant_id/reports/download/:report_id", sensordata.download_Report);
    // get list of all reports regarding to the device having given id.
    router_report.get("/:tenant_id/reports/:device_id", sensordata.get_ReportList);
    // Delete a Report with report id
    router_report.delete("/:tenant_id/reports/:id", sensordata.delete_Report);

    var router_status = require("express").Router();  
    // get latest status of all devices
    router_status.get("/:tenant_id/status/latest", sensordata.get_LatestStatus);

    app.use("/iot-service/v1", router_history);
    app.use("/iot-service/v1", router_report);
    app.use("/iot-service/v1", router_status);
};