const db = require("../models");
const fs = require("fs");
var path = require('path');
const moment = require('moment');
const {getDatenow, asUTCDate, defaultDate, getLocalDatenow, toLocalDate} = require("../utility/date_utils");
const {makeReport} = require("../utility/make_report");
// const { Gateways } = require("../models");
const SensorData = db.SensorDatas;
const Device = db.Devices;
const Gateway = db.Gateways;
const Report = db.Reports;
const Op = db.Sequelize.Op;

// Get the list of alarms.
exports.get_History = async (req, res) => {
    const device_id = req.params.id;
    let from_date = req.query.from ? req.query.from : null;    
    let to_date = req.query.to ? req.query.to : null;

    from_date = asUTCDate(from_date);   // 2021-12-29 10:00
    to_date = asUTCDate(to_date);       // 2021-12-29 10:00

    Device.findOne({
        where: {
            id: device_id, status: 1, tenant_id:req.params.tenant_id
        },
    }).then(async dev_data => {
        let latest_state = await SensorData.findOne({
            where: { 
                sn:  dev_data['sn'],
            },
            order: [ [ 'sensor_time', 'DESC' ]],
        });
        let imei_registered = false;
        if (latest_state) {
            imei_registered = latest_state['imei_registered'];
        }
        let is_list = imei_registered ? [true, false] : [true];

        SensorData.findAll({where: {
                                sn: dev_data['sn'],
                                sensor_time: {
                                    [Op.between]: [from_date, to_date]
                                },
                                imei_registered : {
                                    [Op.in] : is_list
                                }
                            },
                            attributes: ['voltage', 'temperature', 'humidity', 'sensor_time'],
                                order: [["sensor_time", "ASC"]], 
                                limit: null, offset: null}
            ).then(data => {
                    let datetime = [];
                    let voltage = [];
                    let temperature = [];
                    let humidity = [];
                    let res_data = {};
                    data.map(item => {
                        // console.log(item);
                        datetime.push(item['sensor_time']);
                        voltage.push(item['voltage']);
                        temperature.push(item['temperature']);
                        humidity.push(item['humidity']);
                    });
                    res_data['sensor_time'] = datetime;
                    res_data['voltage'] = voltage;
                    res_data['temperature'] = temperature;
                    res_data['humidity'] = humidity;
                    res.send(res_data);
                })
                .catch(err => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving Alarms."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Device."
            });
        });

    
};

// Make and Send Report document
exports.make_Report = async (req, res) => {
    // Validate request
    if (!req.params.device_id || !req.query.from || !req.query.to) {
        res.status(400).send({
            message: "device_id, from_date and to_date can not be empty!"
        });
        return;
    }
    const device_id = req.params.device_id;
    const img_base64 = req.body.base64Chart;
    let from_date = asUTCDate(req.query.from);  // 2021-12-29 10:00
    let to_date = asUTCDate(req.query.to);   // 2021-12-29 10:00
    let device_info = {};
    console.log(req.query);
    console.log(from_date, to_date);
    
    Device.belongsTo(db.DeviceTypes, {foreignKey: 'type', targetKey: 'id'})
    Device.findOne({
        where: {
            id: device_id, status: 1, tenant_id:req.params.tenant_id
        },
        include: {
            model: db.DeviceTypes,
        }
    }).then(async dev_data => {
        let latest_state = await SensorData.findOne({
            where: { 
                sn:  dev_data['sn'],
            },
            order: [ [ 'sensor_time', 'DESC' ]],
        });
        let imei_registered = false;
        if (latest_state) {
            imei_registered = latest_state['imei_registered'];
        }

        let is_list = imei_registered ? [true, false] : [true];

        console.log(dev_data['device_type']['name']);
        device_info = dev_data;
        SensorData.findAll({where: {
                                sn: dev_data['sn'],
                                sensor_time: {
                                    [Op.between]: [from_date, to_date]
                                },
                                imei_registered: {
                                    [Op.in]: is_list
                                }
                            },                            
                            attributes: ['temperature',
                             'humidity',
                             'sensor_time'
                            ],
                            order: [["sensor_time", "ASC"]], 
                            limit: null, offset: null}
            ).then(data => {  
                    let datetime = [];
                    let temperature = [];
                    let humidity = [];                  
                    let report_detail = {};
                    let max_temp = -100;
                    let max_hum = -100;
                    let min_temp = 300;
                    let min_hum = 100;
                    let avg_temp = 0;
                    let avg_hum = 0;
                    for (let i = 0; i < data.length; i++){
                        data[i]['sensor_time'] = toLocalDate(data[i]['sensor_time']);
                    }
                    data.map(item => {
                        // console.log(item);
                        let temp_float = parseFloat(item['temperature']);
                        let hum_float = parseFloat(item['humidity']);
                        datetime.push(item['sensor_time']);
                        temperature.push(temp_float);
                        humidity.push(hum_float);
                        avg_hum += hum_float;
                        avg_temp += temp_float;
                        
                        if(max_temp < temp_float)
                        {
                            max_temp = temp_float;
                        }
                        if(min_temp > temp_float)
                        {
                            min_temp = temp_float;
                        }
                        if(max_hum < hum_float)
                        {
                            max_hum = hum_float;
                        }
                        if(min_hum > hum_float)
                        {
                            min_hum = hum_float;
                        }
                    });
                    avg_temp = avg_temp / data.length;
                    avg_hum = avg_hum / data.length;
                    report_detail['device_sn'] = device_info['sn'];
                    report_detail['max_temp'] = max_temp;
                    report_detail['min_temp'] = min_temp;
                    report_detail['max_hum'] = max_hum;
                    report_detail['min_hum'] = min_hum;
                    report_detail['avg_temp'] = avg_temp.toFixed(1);
                    report_detail['avg_hum'] = avg_hum.toFixed(1);
                    report_detail['file_created_date'] = getLocalDatenow();
                    report_detail['device_type'] = device_info['device_type']['name'];
                    report_detail['log_interval'] = device_info['interval'];
                    if (data.length == 0) {
                        report_detail['first_point'] = "--/--/--";
                        report_detail['stop_time'] = "--/--/--";
                    }
                    else {
                        report_detail['first_point'] = data[0]['sensor_time']
                        report_detail['stop_time'] = data[data.length - 1]['sensor_time'];
                    }
                    report_detail['num_of_points'] = data.length;
                    report_detail['data_logs'] = data;
                    report_detail['base64_str'] = img_base64;
                    let timestamp = new Date();
                    timestamp = timestamp.getTime();
                    let report_url = "storage/" + device_info['sn'] + '_' + timestamp + '.pdf';
                    makeReport(report_detail, report_url);

                    // res_data = {pdflink : `/storage/` + device_info['sn'] + '_' + timestamp + '.pdf', full: req.protocol + '://' + req.get('host') + req.originalUrl}
                    res_data = {pdflink : '/'+report_url}
                    
                    let new_report = {
                        device_id : device_id,
                        url: '/'+report_url,
                        from: from_date,
                        to: to_date,
                        created_at: defaultDate(0)
                    }

                    Report.create(new_report)
                        .then(data => {
                            res.status(201).send(data);
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).send({
                                message:
                                    err.message || "Some error occurred while creating the Device."
                            });
                        });
                    // console.log(report_detail);
                })
                .catch(err => {
                    console.log("-------------------------");
                    console.log(err);
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while retrieving Alarms."
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Device."
            });
        });    
};

exports.get_ReportList = (req, res) => {
    if (!req.params.device_id) {
        res.status(400).send({
            message: "device_id can not be empty!"
        });
        return;
    }
    const device_id = req.params.device_id;

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Report.findAll({
        where: {device_id: device_id},
        // where: {
        //     [Op.and]: [
        //       {sn: sn, status: 1},
        //       db.sequelize.where(
        //         db.sequelize.cast(db.sequelize.col('devices.type'), 'varchar'),
        //         type
        //       ),
        //     ],
        //   },
        order: [["created_at", "DESC"]], limit: page_size, offset: offset})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Reports."
            });
        });
};

// Delete a Report with the given id
exports.delete_Report = (req, res) => {
    const id = req.params.id;
    Report.findByPk(id)
        .then(report => {
            const report_path = path.join(__dirname,"../../"+report['url']);
            fs.unlink(report_path, (err) => {
                
            });
            Report.destroy({
                where: {id: report['id']}
            })
                .then(num => {
                    if (num == 1) {
                        res.send({
                            id: id
                        });
                    } else {
                        res.send({
                            message: `Cannot delete Report with id=${id}. Maybe Report was not found!`
                        });
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Could not delete Report with id=" + id
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Report with id=" + id
            });
        });
    
    
    
};

// Download a Report with the given report id
exports.download_Report = (req, res) => {
    const id = req.params.report_id;
    Report.findByPk(id)
        .then(report => {
            const report_path = path.join(__dirname,"../../"+report['url']);
            res.download(report_path);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Report with id=" + id
            });
        });
    
};


//  Get latest status of all devices
exports.get_LatestStatus = async (req, res) => {
    let result = [];
    
    Device.findAll({
        where: {
            status : 1,
            tenant_id:req.params.tenant_id
            // expire_at: {
            //     [Op.gt]: defaultDate(0),
            // }
        },
        order: [["id", "ASC"]], limit: null, offset: null})
        .then(async devices => {    
            console.log(devices.length);  
            let dev_num = 0;      
            for (let i = 0; i < devices.length; i++){
                let device = devices[i];
                let status = {};
                status['device_id'] = device['id'];
                status['name'] = device['name'];
                status['device_sn'] = device['sn'];
                let latest_state = await SensorData.findOne({
                    where: { 
                        sn:  device['sn'],
                        imei_registered: true
                    },
                    order: [ [ 'sensor_time', 'DESC' ]],
                });
                status['voltage'] = '--';
                status['temperature'] = '--';
                status['humidity'] = '--';
                status['signal'] = '--';
                status['time'] = '--/--/-- --:--';
                if (latest_state) {
                    status['voltage'] = latest_state['voltage'];
                    status['temperature'] = latest_state['temperature'];
                    status['humidity'] = latest_state['humidity'];
                    status['signal'] = latest_state['rssi'];
                    status['time'] = latest_state['sensor_time'];
                }
                result.push(status);
            }
            res.send(result);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Devices."
            });
        });
};



