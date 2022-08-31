const db = require("../models");
const Group = db.Groups;
const Device = db.Devices;
const Op = db.Sequelize.Op;
const { defaultDate } = require("../utility/date_utils");

async function createUnique(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({where})
        .catch(err => {
            return {item: {}, status: 500};
        });
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
            .catch(err => {
                return {item: {}, status: 500};
            });
        return {item, status: 201};
    }
    else {
        return {item: foundItem, status: 302}
    }
}

// Add new Group
exports.addGroup = async (req, res) => {
    // Validate request
    console.log(req.params.tenant_id);
    if (!req.params.tenant_id){
        res.status(400).send({
            message: "Tenant ID can not be empty!"
        });
        return;
    }
    console.log(req.body.name);
    if (!req.body.name) {
        res.status(400).send({
            message: "Type name can not be empty!"
        });
        return;
    }

    new_group = {
        name: req.body.name,
        tenant_id : req.params.tenant_id,
        remark: req.body.remark,
        created_at: defaultDate(0),
        updated_at: defaultDate(0)
    }
    let result = await createUnique(Group, {name: req.body.name, status: 1}, new_group);
    // console.log("---------resulted types here ------------", result);
    res.status(result['status']).send(result['item']);
}

// Update Group
exports.updateGroup = async (req, res) => {
    // Validate request
    if (!req.params.id) {
        res.status(400).send({
            message: "Group id can not be empty!"
        });
        return;
    }
    if(!req.params.tenant_id){
        res.status(400).send({
            message: "Tenant id can not be empty!"
        });
        return;
    }

    group = {
        name: req.body.name,
        remark: req.body.remark,
        updated_at: defaultDate(0)
    }
    Group.update(group, {
        where: {id: req.params.id, tenant_id:req.params.tenant_id}
    })
        .then(num => {
            if (num == 1) {
                Group.findOne({where: {id: req.params.id, tenant_id:req.params.tenant_id}})
                .then(function (data) {
                    res.send(data);
                });
                
            } else {
                res.send({
                    message: `Cannot update Group with id=${req.params.id}. Maybe Device was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Group with id=" + req.params.id
            });
        });
}

// Retrieve all Groups with pagenation and name search.
exports.getGroups = (req, res) => {
    const name = req.query.name? {[Op.iLike]: `%${req.query.name}%`} : {[Op.iLike]: `%%`};
    var condition = {name: name, status: 1, tenant_id: req.params.tenant_id};

    var page_num = req.query.page_number ? Math.floor(req.query.page_number) : 0;
    var page_size = req.query.page_size ? Math.floor(req.query.page_size) : 0;

    var offset = (page_num - 1) * page_size;
    page_size = req.query.type || req.query.key ? 0 : page_size;

    if (page_size == 0) {
        offset = null;
        page_size = null;
    }

    Group.findAll({where: condition, order: [["id", "ASC"]], limit: page_size, offset: offset})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Groups."
            });
        });
};

// get total counts of groups.
exports.getCount = (req, res) => {    
    var condition = {status: 1, tenant_id: req.params.tenant_id};
    Group.count({where: condition})
        .then(cnt => {
            res.send({count: cnt});
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Groups."
            });
        });
};

// Delete a Group with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;
    let devices = await Device.findOne({
        attributes: ['id'],
        where: {
            status: 1,
            group : id
        }
    })
    if (devices) {
        res.send({
            message: "Group had been assigend alrady.", is_used: 1 
        });
        return;
    }

    const group = {
        status: 0,
        updated_at: defaultDate(0)
    };
    Group.update(group, {
        where: {id: id,tenant_id: req.params.tenant_id}
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Group was deleted successfully.", is_used: 0 
                });
            } else {
                res.send({
                    message: `Cannot delete Group with id=${id}. Maybe Group was not found or req.body is empty!`, is_used: -1
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error deleting Group with id=" + id
            });
        });
};
