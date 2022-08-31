module.exports = app => {
    const gateway = require("../controllers/gateway.controller.js");
    var router_gateway = require("express").Router();

    
    // Get the list of Gateway Types
    router_gateway.get("/gateways/types", gateway.getTypes);
    // Create a new Device
    router_gateway.post("/:tenant_id/gateways/", gateway.create);
    // Update a Device with id
    router_gateway.post("/:tenant_id/gateways/:id", gateway.update);
    // get total count of gateway 
    router_gateway.get("/:tenant_id/gateways/counts", gateway.getCount);
    // Retrieve all gateway with Pagenation
    router_gateway.get("/:tenant_id/gateways/", gateway.findAll);
    // Retrieve a single Device with id
    router_gateway.get("/:tenant_id/gateways/:id", gateway.findOne);     
    // Delete a Device with id
    router_gateway.delete("/:tenant_id/gateways/:id", gateway.delete);
    // Delete all gateway
    router_gateway.delete("/:tenant_id/gateways/", gateway.deleteAll);

    app.use("/iot-service/v1", router_gateway);
};
