const db = require("../models");
const { defaultDate } = require("../utility/date_utils");
const Device = db.Devices;
const DeviceType = db.DeviceTypes;
const SensorData = db.SensorDatas;
const Alarm_Records = db.Records;
const Alarm = db.Alarms;
const Report = db.Reports;
const Group = db.Groups;
const Op = db.Sequelize.Op;
const fs = require("fs");
var path = require('path');
const { SendRequest } = require('../utility/axios_request');
const config = require("../config.js");
let Promise = require('promise');



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


// Create and Save a new Device
exports.create = (req, res) => {
    // Validate request
    if (!req.body.serialNo) {
        res.status(400).send({
            message: "Serial Number can not be empty!"
        });
        return;
    }

    // Checking billing status (compare current device counts with available device counts)
    SendRequest("GET", config.billing_check_url, billingRes => {
        var condition = { status: 1, tenant_id: req.params.tenant_id };
        Device.count({ where: condition })
            .then(cnt => {
                if (cnt >= 100) {
                    res.status(400).send({
                        message: "Cannot add a new device more than " + billingRes.count
                    })
                } else {

                    // Create a Device
                    const device = {
                        name: req.body.name,
                        tenant_id: req.params.tenant_id,
                        sn: req.body.serialNo,
                        // type: req.body.published ? req.body.published : false
                        type: req.body.typeOfFacility,
                        group: req.body.group,
                        password: req.body.devicePassword,
                        interval: req.body.dataInterval,
                        remark: req.body.remark,
                        created_at: defaultDate(0),
                        updated_at: defaultDate(0),
                        expire_at: defaultDate(3)
                    };
                    // Save Device in the database
                    Device.findOne({ where: { sn: req.body.serialNo, status: 1, tenant_id: req.params.tenant_id } })
                        .then(function (obj) {
                            if (obj) {  // check if same value exist already in db
                                obj['duplicated'] = true;
                                res.status(400).send("Cannot add a new device with the same Serial Number!");
                                return;
                            }
                            Device.create(device)
                                .then(data => {
                                    data['duplicated'] = false;
                                    res.status(201).send(data);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send({
                                        message:
                                            err.message || "Some error occurred while creating the Device."
                                    });
                                });
                        })
                        .catch(err => {
                            res.status(500).send({
                                message:
                                    err.message || "Some error occurred while retrieving Devices."
                            });
                        });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving Devices."
                });
            });
    });


};

// Retrieve all Devices from the database.
exports.findAll = (req, res) => {
    const type = req.query.type ? req.query.type : { [Op.iLike]: `%%` };
    const sn = req.query.key ? req.query.key : { [Op.iLike]: `%%` };

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Device.findAll({
        // where: db.sequelize.where(
        //     db.sequelize.cast(db.sequelize.col('devices.type'), 'varchar'),
        //     {[Op.iLike]: `%%`}
        // ),
        where: {
            [Op.and]: [
                { sn: sn, status: 1, tenant_id: req.params.tenant_id },
                db.sequelize.where(
                    db.sequelize.cast(db.sequelize.col('devices.type'), 'varchar'),
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
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};

// get total counts of devices.
exports.getCount = (req, res) => {
    var condition = { status: 1, tenant_id: req.params.tenant_id };
    Device.count({ where: condition })
        .then(cnt => {
            res.send({ count: cnt });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};

// Find a single Device with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Device.findOne({
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
                message: "Error retrieving Device with id=" + id
            });
        });
    // Device.findByPk(id)
    //     .then(data => {
    //         res.send(data);
    //     })
    //     .catch(err => {
    //         res.status(500).send({
    //             message: "Error retrieving Device with id=" + id
    //         });
    //     });
};

// Update a Device by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    const device = {
        name: req.body.name,
        // type: req.body.published ? req.body.published : false
        type: req.body.typeOfFacility,
        group: req.body.group,
        password: req.body.devicePassword,
        interval: req.body.dataInterval,
        remark: req.body.remark,
        updated_at: defaultDate(0)
    };
    Device.update(device, {
        where: { id: id, status: 1, tenant_id: req.params.tenant_id }
    })
        .then(num => {
            if (num == 1) {
                Device.findOne({ where: { id: id, status: 1 } })
                    .then(function (data) {
                        res.send(data);
                    });

            } else {
                res.send({
                    message: `Cannot update Device with id=${id}. Maybe Device was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Device with id=" + id
            });
        });
};

// Delete a Device with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    const tenant_id = req.params.tenant_id;
    deleteDeviceById(id, tenant_id).then(del_result => {
        if (del_result == 1) {
            res.send({
                message: "Device was deleted successfully!"
            })
        } else if (del_result == 2) {
            res.status(400).send({
                message: "Could not delete Alarm Record Data with id=" + id
            });
        } else if (del_result == 3) {
            res.status(400).send({
                message: "Could not delete Sensor Data with id=" + id
            });
        } else if (del_result == 4) {
            res.status(400).send({
                message: `Cannot delete Device with id=${id}. Maybe Device was not found!`
            });
        } else if (del_result == 5) {
            res.status(400).send({
                message: "Could not delete Device with id=" + id
            });
        } else if (del_result == 6) {
            res.status(400).send({
                message: "Error retrieving Device with id=" + id
            });
        } else {
            res.status(400).send({
                message: "Exception in Delete with id=" + id
            });
        }
    });


    // const device = {
    //     status: 0
    // };
    // Device.update(device, {
    //     where: {id: id, tenant_id: req.params.tenant_id}
    // })
    //     .then(num => {
    //         if (num == 1) {
    //             res.send({
    //                 message: "Device was deleted successfully."
    //             });
    //         } else {
    //             res.send({
    //                 message: `Cannot delete Device with id=${id}. Maybe Device was not found or req.body is empty!`
    //             });
    //         }
    //     })
    //     .catch(err => {
    //         res.status(500).send({
    //             message: "Error deleting Device with id=" + id
    //         });
    //     });
};

// Delete all Devices from the database.
exports.deleteAll = (req, res) => {
    
    Device.findAll({
        where: {  tenant_id: req.params.tenant_id,status: 1 }
    })
        .then(devices => {
            let del_promise=new Promise(function(resolve, reject){
                if(devices.length==0){
                    resolve(0);
                }else{
                    for(let i=0;i<devices.length;i++){
                        device=devices[i];
                        deleteDeviceById(device["id"], req.params.tenant_id)
                        .then(del_result => {
                            if (del_result != 1) {
                                reject(device["id"]);
                            }else{
                                if(i==devices.length-1){
                                    resolve(devices.length);
                                }
                            }
                        })
                        .catch(err=>{
                            console.log(err);
                        })
                    }
                }                
            })
            del_promise.then(
                function(value){
                    res.send({ message: `${value} Devices were deleted successfully!` });
                },
                function(error){
                    res.status(400).send({message: "Could not delete Device with id=" + error});
                }
            )
            // res.send({ message: `Devices were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Devices."
            });
        });


    // Device.destroy({
    //     where: { tenant_id: req.params.tenant_id },
    //     truncate: false
    // })
    //     .then(nums => {
    //         res.send({ message: `${nums} Devices were deleted successfully!` });
    //     })
    //     .catch(err => {
    //         res.status(500).send({
    //             message:
    //                 err.message || "Some error occurred while removing all Devices."
    //         });
    //     });
};

const deleteDeviceById = (id, tenant_id) => {

    const new_device = {
        status: 0,
        updated_at: defaultDate(0)
    };

    return new Promise(function (resolve, reject) {

        Device.findByPk(id)
            .then(device => {
                Device.update(new_device, {
                    where: { id: id, tenant_id: tenant_id }
                })
                    .then(num => {
                        if (num == 1) {
                            SensorData.destroy({
                                where: { sn: device['sn'] }
                            })
                                .then(num => {
                                    Alarm.destroy({
                                        where: { device_sn: device['sn'] }
                                    })
                                        .then(num => {
                                        })
                                        .catch(err => {
                                            console.log("Cannot delete Alarm setting.")
                                        });

                                    Report.findAll({
                                        where: { device_id: device['id'] }
                                    })
                                        .then(reports => {
                                            reports.map(report => {

                                                const report_path = path.join(__dirname, "../../" + report['url']);
                                                fs.unlink(report_path, (err) => {
                                                    // console.log(err);
                                                });
                                                report.destroy()
                                                .then(num=>{})
                                                .catch(err=>{
                                                    console.log("Cannot delete Report!");
                                                })
                                            })
                                        })

                                    Alarm_Records.destroy({
                                        where: { sn: device['sn'] }
                                    })
                                        .then(num => {
                                            resolve(1);
                                        })
                                        .catch(err => {
                                            resolve(2);
                                        });

                                })
                                .catch(err => {
                                    resolve(3);
                                });

                        } else {
                            resolve(4);
                        }
                    })
                    .catch(err => {
                        resolve(5);
                    });
            })
            .catch(err => {
                resolve(6);
            });
    });

}

// find all published Device
exports.findAllPublished = (req, res) => {
    Device.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};


// Add new device type
exports.addType = async (req, res) => {
    // Validate request
    if (!req.body.name) {
        res.status(400).send({
            message: "Type name can not be empty!"
        });
        return;
    }

    new_type = {
        name: req.body.name
    }
    let result = await createUnique(DeviceType, { name: req.body.name }, new_type);
    // console.log("---------resulted types here ------------", result);
    res.status(result['status']).send(result['item']);
}

// Update type
exports.updateType = async (req, res) => {
    // Validate request
    if (!req.params.id) {
        res.status(400).send({
            message: "Type id can not be empty!"
        });
        return;
    }

    type = {
        name: req.body.name
    }
    DeviceType.update(type, {
        where: { id: req.params.id }
    })
        .then(num => {
            if (num == 1) {
                DeviceType.findOne({ where: { id: req.params.id } })
                    .then(function (data) {
                        res.send(data);
                    });

            } else {
                res.send({
                    message: `Cannot update Device with id=${req.params.id}. Maybe Device was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Device with id=" + req.params.id
            });
        });
}

// Get list of Facility types
exports.getTypes = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;
    DeviceType.findAll({ where: condition })
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

