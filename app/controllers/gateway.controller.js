const db = require("../models");
const { defaultDate } = require("../utility/date_utils");
const { SendRequest } = require("../utility/axios_request");
const Gateway = db.Gateways;
const SensorData = db.SensorDatas;
const GatewayType = db.GatewayTypes;
const Op = db.Sequelize.Op;
const config = require("../config.js");

async function createUnique(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({ where })
        .catch(err => {
            return { item: {}, status: 500 };
        });
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
            .catch(err => {
                return { item: {}, status: 500 };
            });
        return { item, status: 200 };
    }
    else {
        return { item: foundItem, status: 201 }
    }
}

// Create and Save a new Gateway
exports.create = (req, res) => {
    // Validate request
    if (!req.body.imei) {
        res.status(400).send({
            message: "IMEI can not be empty!"
        });
        return;
    }
    // Checking billing status (compare current device counts with available device counts)
    SendRequest("GET", config.billing_check_url, billingRes => {
        var condition = { status: 1, tenant_id: req.params.tenant_id };
        Gateway.count({ where: condition })
            .then(cnt => {
                if (cnt >= 100) {
                    res.status(400).send({
                        message: "Cannot add a new gateway more than " + billingRes.count
                    })
                } else {

                    // Create a Gateway
                    const gateway = {
                        name: req.body.name,
                        tenant_id: req.params.tenant_id,
                        imei: req.body.imei,
                        type: req.body.typeOfFacility,
                        phone_number: req.body.phoneNumber,
                        remark: req.body.remark,
                        created_at: defaultDate(0),
                        updated_at: defaultDate(0)
                    };
                    // Save Gateway in the database
                    Gateway.findOne({ where: { imei: req.body.imei, status: 1, tenant_id: req.params.tenant_id } })
                        .then(function (obj) {
                            if (obj) {  // check if same value exist already in db
                                obj.duplicated = true;
                                res.status(400).send("Cannot add a new Gateway with the same Imei!");
                                return;
                            }
                            Gateway.create(gateway)
                                .then(async data => {
                                    update_data = { imei_registered: true }
                                    data['duplicated'] = false;
                                    await SensorData.update(update_data, {
                                        where: {
                                            imei: req.body.imei,
                                            imei_registered: false
                                        }
                                    });
                                    res.status(201).send(data);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send({
                                        message:
                                            err.message || "Some error occurred while creating the Gateway."
                                    });
                                });
                        })
                        .catch(err => {
                            res.status(500).send({
                                message:
                                    err.message || "Some error occurred while retrieving Gateways."
                            });
                        });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving Gateways."
                });
            });
    });

};

// Retrieve all Gateways from the database.
exports.findAll = (req, res) => {
    const type = req.query.type ? req.query.type : { [Op.iLike]: `%%` };
    const imei = req.query.key ? req.query.key : { [Op.iLike]: `%%` };

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Gateway.findAll({
        // where: db.sequelize.where(
        //     db.sequelize.cast(db.sequelize.col('devices.type'), 'varchar'),
        //     {[Op.iLike]: `%%`}
        // ),
        where: {
            [Op.and]: [
                { imei: imei, status: 1, tenant_id: req.params.tenant_id },
                db.sequelize.where(
                    db.sequelize.cast(db.sequelize.col('gateway.type'), 'varchar'),
                    type
                ),
            ],
        },
        order: [["id", "ASC"]], limit: page_size, offset: offset
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Gateways."
            });
        });
};

// get total counts of Gateways.
exports.getCount = (req, res) => {
    var condition = { status: 1, tenant_id: req.params.tenant_id };
    Gateway.count({ where: condition })
        .then(cnt => {
            res.send({ count: cnt });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Gateways."
            });
        });
};

// Find a single Gateway with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Gateway.findOne({
        where: {
            id: id,
            tenant_id: req.params.tenant_id
        }
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Gateway with id=" + id
            });
        });


    // Gateway.findByPk(id)
    //     .then(data => {
    //         res.send(data);
    //     })
    //     .catch(err => {
    //         res.status(500).send({
    //             message: "Error retrieving Device with id=" + id
    //         });
    //     });
};

// Update a Gateway by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    const gateway = {
        name: req.body.name,
        // type: req.body.published ? req.body.published : false
        type: req.body.typeOfFacility,
        phone_number: req.body.phoneNumber,
        remark: req.body.remark,
        updated_at: defaultDate(0)
    };
    Gateway.update(gateway, {
        where: { id: id, status: 1, tenant_id: req.params.tenant_id }
    })
        .then(num => {
            if (num == 1) {
                Gateway.findOne({ where: { id: id, status: 1, tenant_id: req.params.tenant_id } })
                    .then(function (data) {
                        res.send(data);
                    });

            } else {
                res.send({
                    message: `Cannot update Gateway with id=${id}. Maybe Gateway was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Gateway with id=" + id
            });
        });
};

// Delete a Gateway with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    /*
    Device.destroy({
        where: {id: id}
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Device was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Device with id=${id}. Maybe Device was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Device with id=" + id
            });
        });
    */
    const gateway = {
        status: 0,
        updated_at: defaultDate(0)
    };
    Gateway.update(gateway, {
        where: { id: id, tenant_id: req.params.tenant_id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Gateway was deleted successfully."
                });
            } else {
                res.send({
                    message: `Cannot delete Gateway with id=${id}. Maybe Gateway was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error deleting Device with id=" + id
            });
        });
};

// Delete all Gateways from the database.
exports.deleteAll = (req, res) => {
    Gateway.destroy({
        where: { tenant_id: req.params.tenant_id },
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} Gateways were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Gateways."
            });
        });
};



// Get list of Facility types
exports.getTypes = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;
    GatewayType.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Device Types."
            });
        });
}

