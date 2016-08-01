/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("client", {
        cli_id              : { type: DataTypes.STRING, primaryKey: true },
        cli_name            : DataTypes.STRING,
        cli_areaid          : DataTypes.STRING,
        cli_phone           : DataTypes.STRING,
        cli_address         : DataTypes.STRING,
        cli_contact         : DataTypes.STRING,
        cli_ctime           : DataTypes.DATE
    });
};