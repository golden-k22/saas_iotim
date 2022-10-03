module.exports = app => {
    const alarms = require("../controllers/alarm.controller.js");

    var router = require("express").Router();

    // Set as seen the alarm record
    router.post("/:tenant_id/alarms/records/:id", alarms.set_RecordSeen);    
    // Get the list of alarm records
    router.get("/:tenant_id/alarms/records", alarms.get_Records);
    // Get alarm record count with params alarm_type
    router.get("/:tenant_id/alarms/records/counts", alarms.getRecordCount);

    // Add a Alarm Setting by device
    router.post("/:tenant_id/alarms/", alarms.create_Alarm); 
    // Add multiple Alarm Settings
    router.post("/:tenant_id/alarms/multiple", alarms.create_multiple_Alarms);   
    // Update a Alarm with id
    router.post("/:tenant_id/alarms/:id", alarms.update_Alarm);
    // Retrieve all Alarm with pagenation
    router.get("/:tenant_id/alarms/", alarms.get_Alarms); 
    // Get alarm setting count with params alarm_type
    router.get("/:tenant_id/alarms/counts", alarms.getCount);
    // Delete a Device with id
    router.delete("/:tenant_id/alarms/:id", alarms.delete);  
    
    

    app.use("/iot-service/v1", router);
};