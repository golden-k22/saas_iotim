const db = require("../models");
const Alarm = db.Alarms;
const Alarm_Records = db.Records;
const Op = db.Sequelize.Op;
const { defaultDate, asUTCDate } = require("../utility/date_utils");
let moment = require('moment');

// Create and Save a new Alarm by device
exports.create_Alarm = async (req, res) => {
    // Validate request
    let alarm = req.body;
    let dup_Obj = {};
    if (alarm.objectId != "") {
        dup_Obj = await Alarm.findOne({ where: { device_sn: alarm.objectId, alarm_type: alarm.alarmType, tenant_id: req.params.tenant_id } });
    } else if (alarm.objectId == "" && alarm.group != null) {
        dup_Obj = await Alarm.findOne({ where: { group_no: alarm.group, alarm_type: alarm.alarmType, tenant_id: req.params.tenant_id } });
    } else {
        res.status(400).send({
            message: "Should select Device or Group!"
        });
        return;
    }

    if (dup_Obj) {
        res.status(400).send({ error: "Same alarm item exists already!" });
        return;
    }
    // Create a Alarm
    const new_alarm = {
        name: req.body.alarmName,
        tenant_id: req.params.tenant_id,
        device_sn: req.body.objectId,
        group_no: req.body.group,
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
    Alarm.create(new_alarm)
        .then(data => {
            res.status(201).send(data);
        })
        .catch(err => {
            console.log("--------" + err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Alarm."
            });
        });

};


// Create and Save a new Alarm
exports.create_multiple_Alarms = async (req, res) => {
    let alarm_list = req.body;

    let failed_list = [];
    let promises = [];

    for (let index = 0; index < alarm_list.length; index++) {
        let promise = {};
        let alarm = alarm_list[index];
        let dup_Obj = {};
        if (alarm.objectId != "") {
            dup_Obj = await Alarm.findOne({ where: { device_sn: alarm.objectId, alarm_type: alarm.alarmType, tenant_id: req.params.tenant_id } });
        } else if (alarm.objectId == "" && alarm.group != null) {
            dup_Obj = await Alarm.findOne({ where: { group_no: alarm.group, alarm_type: alarm.alarmType, tenant_id: req.params.tenant_id } });
        }

        if (dup_Obj) {
            let new_alarm = { ...alarm, "message": "cannot add duplicated alarm for the same device." };
            failed_list.push(new_alarm);
        } else {
            const new_alarm = {
                name: alarm.alarmName,
                tenant_id: req.params.tenant_id,
                device_sn: alarm.objectId,
                group_no: alarm.group,
                alarm_type: alarm.alarmType, // 0-temperature, 1-humidity, 2-voltage
                low_warning: alarm.lowWarning,
                high_warning: alarm.highWarning,
                low_threshold: alarm.lowThreshold,
                high_threshold: alarm.highThreshold,
                offline_time: alarm.offlineTime,
                repeat: alarm.repeat,
                date_from: asUTCDate(alarm.effectiveDateFrom),
                date_to: asUTCDate(alarm.effectiveDateTo),
                time_from: alarm.effectiveTimeFrom,
                time_to: alarm.effectiveTimeTo,
                created_at: defaultDate(0)

            };
            promise = Alarm.create(new_alarm)
                .then(data => {
                })
                .catch(err => {
                    let new_alarm = { ...alarm, "message": "Some error occurred while creating the Alarm." };
                    failed_list.push(new_alarm);
                });
        }
        promises.push(promise);

    }
    await Promise.all(promises);
    res.status(201).send(failed_list);
};


// get total counts of alarms.
exports.getCount = (req, res) => {
    var condition = req.query.alarm_type ? { alarm_type: req.query.alarm_type, status: 1, tenant_id: req.params.tenant_id } : { status: 1, tenant_id: req.params.tenant_id };

    Alarm.count({ where: condition })
        .then(cnt => {
            res.send({ count: cnt });
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
    const sn = req.query.device_sn ? req.query.device_sn : { [Op.iLike]: `%%` };
    const group = req.query.group ? req.query.group : { [Op.iLike]: `%%` };
    const named_sn = req.query.device_name ? req.query.device_name : sn;
    var condition = req.query.alarm_type ? { alarm_type: req.query.alarm_type, device_sn: named_sn, status: 1, tenant_id: req.params.tenant_id } : { device_sn: named_sn, status: 1, tenant_id: req.params.tenant_id };

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Alarm.findAll({
        where: {
            [Op.and]: [condition,
                ,
                db.sequelize.where(
                    db.sequelize.cast(db.sequelize.col('alarms.group_no'), 'varchar'),
                    group
                ),
            ]
        }, order: [["id", "ASC"]], limit: page_size, offset: offset
    })
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
        where: { id: req.params.id, tenant_id: req.params.tenant_id }
    })
        .then(num => {
            if (num == 1) {
                Alarm.findOne({ where: { id: req.params.id, tenant_id: req.params.tenant_id } })
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
        where: { id: id, tenant_id: req.params.tenant_id }
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
    const sn = req.query.device_sn ? req.query.device_sn : { [Op.iLike]: `%%` };
    const named_sn = req.query.device_name ? req.query.device_name : sn;
    var condition1 = req.query.alarm_type ? { alarm_type: req.query.alarm_type, sn: named_sn, status: req.query.is_read } : { sn: named_sn, status: req.query.is_read };
    var condition2 = req.query.alarm_type ? { alarm_type: req.query.alarm_type, sn: named_sn } : { sn: named_sn };
    var condition = req.query.is_read ? condition1 : condition2;
    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }
    page_size = req.query.limit ? req.query.limit : page_size;
    offset = req.query.limit ? 0 : offset;


    Alarm_Records.belongsTo(db.Devices, { foreignKey: 'sn', targetKey: 'sn' })
    Alarm_Records.findAll({
        where: condition, order: [["created_at", "DESC"]], limit: page_size, offset: offset,
        include: [
            {
                model: db.Devices,
                attributes: ['tenant_id'],
                where: {
                    tenant_id: req.params.tenant_id
                },
                required: true
            }
        ]
    })
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
    if (id == 0) {
        Alarm_Records.update(seen_record, {
            where: { status: 1 }
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
            where: { id: id }
        })
            .then(num => {
                if (num == 1) {
                    Alarm_Records.findOne({ where: { id: id } })
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
    const sn = req.query.device_sn ? req.query.device_sn : { [Op.iLike]: `%%` };
    const is_read = req.query.is_read ? req.query.is_read : null;
    var condition1 = req.query.alarm_type ? { alarm_type: req.query.alarm_type, sn: sn } : { sn: sn };
    var condition2 = req.query.alarm_type ? { alarm_type: req.query.alarm_type, sn: sn, status: is_read } : { sn: sn, status: is_read };
    var condition = req.query.is_read ? condition2 : condition1;

    Alarm_Records.belongsTo(db.Devices, { foreignKey: 'sn', targetKey: 'sn' })
    Alarm_Records.count({
        where: condition,
        include: [
            {
                model: db.Devices,
                attributes: ['tenant_id'],
                where: {
                    tenant_id: req.params.tenant_id
                },
                required: true
            }
        ]
    })
        .then(cnt => {
            res.send({ count: cnt });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Alarm counts."
            });
        });
};


// get total counts of security devices.
exports.getSecurityCounts =async (req, res) => {
    var condition = { alarm_type: 3, created_at: { 
        [Op.gte] : moment().subtract(60, 'minutes').toDate()
      } };

    Alarm_Records.belongsTo(db.Devices, { foreignKey: 'sn', targetKey: 'sn' })
    let records=await Alarm_Records.count({
        where: condition,
        include: [
            {
                model: db.Devices,
                attributes: ['tenant_id'],
                where: {
                    tenant_id: req.params.tenant_id
                },
                required: true,
            }
        ],
        
        distinct: true,
        col: 'sn'
    });
    console.log(records);
    res.status(200).send({count: records});
};

// get total counts of security devices.
exports.getAlarmedDeviceCounts =async (req, res) => {
    const alarm_type = req.query.type ? req.query.type : { [Op.iLike]: `%%` };
    var condition = { alarm_type: alarm_type, created_at: { 
        [Op.gte] : moment().subtract(60, 'minutes').toDate()
      } };

    Alarm_Records.belongsTo(db.Devices, { foreignKey: 'sn', targetKey: 'sn' })
    let total_cnt=await Alarm_Records.count({
        where: condition,
        include: [
            {
                model: db.Devices,
                attributes: ['tenant_id'],
                where: {
                    tenant_id: req.params.tenant_id
                },
                required: true,
            }
        ],
        
        distinct: true,
        col: 'sn'
    });
    var critical_condition = { alarm_type: alarm_type, alarm_item: {[Op.lt]:2},created_at: { 
        [Op.gte] : moment().subtract(60, 'minutes').toDate()
      } };
    let critical_cnt=await Alarm_Records.count({
        where: critical_condition,
        include: [
            {
                model: db.Devices,
                attributes: ['tenant_id'],
                where: {
                    tenant_id: req.params.tenant_id
                },
                required: true,
            }
        ],
        
        distinct: true,
        col: 'sn'
    });

    let warning_cnt=total_cnt-critical_cnt;
    res.status(200).send({warning: warning_cnt, critical: critical_cnt});
};
