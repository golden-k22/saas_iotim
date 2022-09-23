const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    const Utilization = sequelize.define("utilizations", {
        type: {
            type: Sequelize.STRING,
            allowNull: false // type MUST have a value
        },
        tenant_id: {
            type: Sequelize.STRING,
            allowNull: false // tenant id MUST have a value
        },
        to_address: {
            type: Sequelize.STRING,
            allowNull: false // address MUST have a value
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false // content MUST have a value
        },
        created_at: {
            type: Sequelize.DATE,
            get() {
                return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm');
            },
        }
    });
    
    return Utilization;
};
  