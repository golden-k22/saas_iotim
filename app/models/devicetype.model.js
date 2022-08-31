module.exports = (sequelize, Sequelize) => {
    const DeviceType = sequelize.define("device_type", {
        name: {
            type: Sequelize.STRING,
            allowNull: false // name MUST have a value
        },
        status: {
            type: Sequelize.INTEGER,
            validate: {
                min: 0,
                max: 3
                // note: many validations need to be defined in the "validate" object
                // allowNull is so common that it's the exception
            },
            defaultValue: 1  // 0-deleted, 1-active
        }
    });
    return DeviceType;
};
  