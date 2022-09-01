const db = require("../models");
const Alarm = db.Alarms;
const Alarm_Records = db.Records;
const Op = db.Sequelize.Op;
const { defaultDate, asUTCDate } = require("../utility/date_utils");

// Create and Save a new Alarm
exports.create_Alarm = (req, res) => {
    // Validate request
    if (!req.body.objectId) {
        res.status(400).send({
            message: "Device sn can not be empty!"
        });
        return;
    }
    // Create a Alarm
    console.log(req.body);
    const alarm = {
        name: req.body.alarmName,
        tenant_id:req.params.tenant_id,
        device_sn: req.body.objectId,
        alarm_type: req.body.alarmType, // 0-temperature, 1-humidity, 2-voltage
        low_warning: req.body.lowWarning,
        high_warning: req.body.highWarning,
        low_threshold: req.body.lowThreshold,
        high_threshold: req.body.highThreshold,
        offline_time: req.body.offlineTime,
        repeat: req.body.repeat,
        date_from: asUTCDate(req.body.effectiveDateFrom),
        date_to: asUTCDate(req.body.effectiveDateTo),
        time_from: req.body.effectiveTimeFrom,
        time_to: req.body.effectiveTimeTo, 
        created_at: defaultDate(0)
    };
    // Save Alarm in the database
    Alarm.findOne({where: {device_sn: req.body.objectId, alarm_type: req.body.alarmType, tenant_id: req.params.tenant_id}})
        .then(function (obj) {
            if (obj) {  // check if same alarm exist already in db
                res.status(500).send({error: "Same alarm item exists already!"});
                return;
            }
            Alarm.create(alarm)
                .then(data => {
                    res.status(201).send(data);
                })
                .catch(err => {
                    console.log("--------"+err);
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Alarm."
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};
// get total counts of alarms.
exports.getCount = (req, res) => {  
    var condition = req.query.alarm_type ? {alarm_type: req.query.alarm_type, status: 1, tenant_id: req.params.tenant_id} : { status: 1, tenant_id: req.params.tenant_id};
    
    Alarm.count({where: condition})
        .then(cnt => {
            res.send({count: cnt});
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Alarm counts."
            });
        });
};

// Get the list of alarms.
exports.get_Alarms = (req, res) => {
    const sn = req.query.device_sn ? req.query.device_sn : {[Op.iLike]: `%%`};
    const named_sn = req.query.device_name ? req.query.device_name : sn;
    var condition = req.query.alarm_type ? {alarm_type: req.query.alarm_type, device_sn: named_sn, status: 1, tenant_id:req.params.tenant_id} : {device_sn: named_sn, status: 1, tenant_id:req.params.tenant_id};

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Alarm.findAll({where: condition, order: [["id", "ASC"]], limit: page_size, offset: offset})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Alarms."
            });
        });
};

// Create and Save a new Humidity Alarm
exports.create_H_Alarm = (req, res) => {
    // Validate request
    if (!req.body.objectId) {
        res.status(400).send({
            message: "Object ID can not be empty!"
        });
        return;
    }
    console.log(req.body);
    // Create a Alarm
    const alarm = {
        name: req.body.alarmName,
        device_sn: req.body.objectId,
        // type: req.body.published ? req.body.published : false
        alarm_type: 1, // 0-temperature, 1-humidity, 2-voltage
        low_warning: req.body.lowWarning,
        high_warning: req.body.highWarning,
        low_threshold: req.body.lowThreshold,
        high_threshold: req.body.highThreshold,
        repeat: req.body.repeat,
        date_from: asUTCDate(req.body.effectiveDateFrom),
        date_to: asUTCDate(req.body.effectiveDateTo),
        time_from: req.body.effectiveTimeFrom,
        time_to: req.body.effectiveTimeTo,
        created_at: defaultDate(0)
    };
    // Save Alarm in the database
    Alarm.findOne({where: {device_sn: req.body.objectId, alarm_type: 1}})
        .then(function (obj) {
            if (obj) {  // check if same alarm exist already in db
                res.status(500).send({error: "Same alarm item exists already!"});
                return;
            }
            Alarm.create(alarm)
                .then(data => {
                    res.status(201).send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Alarm."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};

// Get the list of humidity alarms.
exports.findAll_H_Alarms = (req, res) => {
    const sn = req.query.device_sn;
    var condition = sn ? {alarm_type: 1, device_sn: sn} : {alarm_type: 1};

    Alarm.findAll({where: condition})
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

// Create and Save a new Voltage Alarm
exports.create_V_Alarm = (req, res) => {
    // Validate request
    if (!req.body.objectId) {
        res.status(400).send({
            message: "Object ID can not be empty!"
        });
        return;
    }
    console.log(req.body);
    // Create a Alarm for voltage
    const alarm = {
        name: req.body.alarmName,
        device_sn: req.body.objectId,
        // type: req.body.published ? req.body.published : false
        alarm_type: 2, // 0-temperature, 1-humidity, 2-voltage
        
        low_threshold: req.body.lowVolage,
        repeat: req.body.repeat,
        date_from: asUTCDate(req.body.effectiveDateFrom),
        date_to: asUTCDate(req.body.effectiveDateTo),
        time_from: req.body.effectiveTimeFrom,
        time_to: req.body.effectiveTimeTo,
        created_at: defaultDate(0)
    };
    // Save Alarm in the database
    Alarm.findOne({where: {device_sn: req.body.objectId, alarm_type: 2}})
        .then(function (obj) {
            if (obj) {  // check if same alarm exist already in db
                res.status(500).send({error: "Same alarm item exists already!"});
                return;
            }
            Alarm.create(alarm)
                .then(data => {
                    res.status(201).send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Alarm."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};

// Get the list of Voltage alarms.
exports.findAll_V_Alarms = (req, res) => {
    const sn = req.query.device_sn;
    var condition = sn ? {alarm_type: 2, device_sn: sn} : {alarm_type: 2};

    Alarm.findAll({where: condition})
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

// Create and Save a new Security Alarm
exports.create_S_Alarm = (req, res) => {
    // Validate request
    if (!req.body.objectId || !req.body.offlineTime) {
        res.status(400).send({
            message: "ojectID and offlineTime can not be empty!"
        });
        return;
    }
    console.log(req.body);
    // Create a Alarm for voltage
    const alarm = {
        name: req.body.alarmName,
        device_sn: req.body.objectId,
        // type: req.body.published ? req.body.published : false
        alarm_type: 3, // 0-temperature, 1-humidity, 2-voltage, 3-security
        
        offline_time: req.body.offlineTime,
        repeat: req.body.repeat,
        date_from: asUTCDate(req.body.effectiveDateFrom),
        date_to: asUTCDate(req.body.effectiveDateTo),
        time_from: req.body.effectiveTimeFrom,
        time_to: req.body.effectiveTimeTo,
        created_at: defaultDate(0)
    };
    // Save Alarm in the database
    Alarm.findOne({where: {device_sn: req.body.objectId, alarm_type: 3}})
        .then(function (obj) {
            if (obj) {  // check if same alarm exist already in db
                res.status(500).send({error: "Same alarm item exists already!"});
                return;
            }
            Alarm.create(alarm)
                .then(data => {
                    res.status(201).send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Alarm."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};

// Get the list of Security alarms.
exports.findAll_S_Alarms = (req, res) => {
    const sn = req.query.device_sn;
    var condition = sn ? {alarm_type: 3, device_sn: sn} : {alarm_type: 3};

    Alarm.findAll({where: condition})
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

// Find a single Device with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Alarm.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Device with id=" + id
            });
        });
};

// Update a Alarm by the id in the request
exports.update_Alarm = (req, res) => {    
    const alarm = {
        name: req.body.alarmName,
        // device_sn: req.body.objectId,
        // // type: req.body.published ? req.body.published : false
        // alarm_type: 0, // 0-temperature, 1-humidity, 2-voltage
        low_warning: req.body.lowWarning,
        high_warning: req.body.highWarning,
        low_threshold: req.body.lowThreshold,
        high_threshold: req.body.highThreshold,
        offline_time: req.body.offlineTime,
        repeat: req.body.repeat,
        date_from: asUTCDate(req.body.effectiveDateFrom),
        date_to: asUTCDate(req.body.effectiveDateTo),
        time_from: req.body.effectiveTimeFrom,
        time_to: req.body.effectiveTimeTo
    };
    console.log(alarm);
    console.log(req.body);
    Alarm.update(alarm, {
        where: {id: req.params.id, tenant_id:req.params.tenant_id}
    })
        .then(num => {
            if (num == 1) {
                Alarm.findOne({where: {id: req.params.id, tenant_id:req.params.tenant_id}})
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

// Delete a alarm with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    Alarm.destroy({
        where: {id: id, tenant_id:req.params.tenant_id}
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Alarm was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Alarm with id=${id}. Maybe Alarm was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Device with id=" + id
            });
        });
};


// Get the alarm records.
exports.get_Records = (req, res) => {
    const sn = req.query.device_sn ? req.query.device_sn : {[Op.iLike]: `%%`};
    const named_sn = req.query.device_name ? req.query.device_name : sn;
    var condition1 = req.query.alarm_type ? {alarm_type: req.query.alarm_type, sn: named_sn, status: req.query.is_read} : {sn: named_sn, status: req.query.is_read};
    var condition2 = req.query.alarm_type ? {alarm_type: req.query.alarm_type, sn: named_sn} : {sn: named_sn};
    var condition = req.query.is_read ? condition1 : condition2;
    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }
    page_size = req.query.limit? req.query.limit : page_size;
    offset = req.query.limit? 0 : offset;
    
 
    Alarm_Records.belongsTo(db.Devices, {foreignKey: 'sn', targetKey: 'sn'})
    Alarm_Records.findAll({where: condition, order: [["created_at", "DESC"]], limit: page_size, offset: offset,
        include: [
            {
                model: db.Devices, 
                attributes: ['tenant_id'],
                where:{ 
                    tenant_id:req.params.tenant_id
                },
                required: true
            }
        ]})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Alarms."
            });
        });
};

// Update a Alarm Record as seen by the record id in the request
exports.set_RecordSeen = (req, res) => {    
    const id = req.params.id;
    const seen_record = {
        status: 0
    };
    if (id == 0)
    {
        Alarm_Records.update(seen_record, {
            where: {status: 1}
        })
        .then(num => {
            res.status(200).send({
                count: num[0]
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating all Records"
            });
        });
    }
    else {
        Alarm_Records.update(seen_record, {
            where: {id: id}
        })
            .then(num => {
                if (num == 1) {
                    Alarm_Records.findOne({where: {id: id}})
                    .then(function (data) {
                        res.send(data);
                    });
                } else {
                    res.send({
                        message: `Cannot set as seen Record with id=${id}. Maybe Record was not found or req.body is empty!`
                    });
                }
            })        
            .catch(err => {
                res.status(500).send({
                    message: "Error updating Record with id=" + id
                });
            });
    }
    
};

// get total counts of alarms.
exports.getRecordCount = (req, res) => { 
    const sn = req.query.device_sn ? req.query.device_sn : {[Op.iLike]: `%%`};
    const is_read = req.query.is_read? req.query.is_read: null;
    var condition1 = req.query.alarm_type ? {alarm_type: req.query.alarm_type, sn:sn} : {sn: sn};
    var condition2 = req.query.alarm_type ? {alarm_type: req.query.alarm_type, sn:sn, status: is_read} : {sn: sn, status: is_read};
    var condition = req.query.is_read ? condition2 : condition1;
    
    Alarm_Records.belongsTo(db.Devices, {foreignKey: 'sn', targetKey: 'sn'})
    Alarm_Records.count({where: condition,
        include: [
            {
                model: db.Devices, 
                attributes: ['tenant_id'],
                where:{ 
                    tenant_id:req.params.tenant_id
                },
                required: true
            }
        ]})
        .then(cnt => {
            res.send({count: cnt});
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Alarm counts."
            });
        });
};
