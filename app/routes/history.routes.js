module.exports = app => {
    const history = require("../controllers/history.controller.js");

    var router_history = require("express").Router();    
    router_history.get("/:tenant_id/history/:id", history.get_History);

    var router_report = require("express").Router();
    // make a report of sensor data for given sensor id
    router_report.post("/:tenant_id/reports/:device_id", history.make_Report);
    // download report 
    router_report.get("/:tenant_id/reports/download/:report_id", history.download_Report);
    // get list of all reports regarding to the device having given id.
    router_report.get("/:tenant_id/reports/:device_id", history.get_ReportList);
    // Delete a Report with report id
    router_report.delete("/:tenant_id/reports/:id", history.delete_Report);

    var router_status = require("express").Router();  
    // get latest status of all devices
    router_status.get("/:tenant_id/status/latest", history.get_LatestStatus);

    var router_utilization=require("express").Router();
    router_utilization.get("/:tenant_id/utilizations/", history.get_utilization);


    app.use("/iot-service/v1", router_history);
    app.use("/iot-service/v1", router_report);
    app.use("/iot-service/v1", router_status);
    app.use("/iot-service/v1", router_utilization);
};