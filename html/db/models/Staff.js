/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("staff", {
        staff_id              : { type: DataTypes.STRING, primaryKey: true },
        staff_name            : DataTypes.STRING,
        staff_phone           : DataTypes.STRING
    });
};