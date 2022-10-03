module.exports = app => {
    const devices = require("../controllers/device.controller.js");
    const groups = require("../controllers/group.controller.js");
    var router_device = require("express").Router();
    var router_group = require("express").Router();

    // var router_type = require("express").Router();

    // // Get the list of Types
    // router_type.get("/", devices.getTypes);      
    // // 1.1 Add new Type
    // router_type.post("/", devices.addType);
    // // update Type
    // router_type.post("/:id", devices.updateType);

    // app.use("/iot-service/v1/types", router_type);

    // 1.1 Add new Group
    router_group.post("/:tenant_id/groups/", groups.addGroup);
    // update Group
    router_group.post("/:tenant_id/groups/:id", groups.updateGroup);
    // get total count of groups 
    router_group.get("/:tenant_id/groups/counts", groups.getCount);    
    // Get the list of groups with pagenation and name search
    router_group.get("/:tenant_id/groups/", groups.getGroups);
    // Delete a Group with id
    router_group.delete("/:tenant_id/groups/:id", groups.delete);

    app.use("/iot-service/v1", router_group);

    
    // Get the list of Device Types
    router_device.get("/devices/types", devices.getTypes); 

    // Create a new Device
    router_device.post("/:tenant_id/devices/", devices.create);
    // Create multiple Devices from csv file
    router_device.post("/:tenant_id/devices/multiple", devices.createMultiDevices);

    // Update a Device with id
    router_device.post("/:tenant_id/devices/:id", devices.update);
    // get total count of devices 
    router_device.get("/:tenant_id/devices/counts", devices.getCount);
    // Retrieve all Devices with Pagenation
    router_device.get("/:tenant_id/devices/", devices.findAll);
    // Retrieve a single Device with id
    router_device.get("/:tenant_id/devices/:id", devices.findOne);     
    // Delete a Device with id
    router_device.delete("/:tenant_id/devices/:id", devices.delete);
    // Delete all Devices
    router_device.delete("/:tenant_id/devices/", devices.deleteAll);

    app.use("/iot-service/v1", router_device);
};
