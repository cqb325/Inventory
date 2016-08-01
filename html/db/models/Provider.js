/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("provider", {
        prov_id             : { type: DataTypes.STRING, primaryKey: true },
        prov_name           : DataTypes.STRING,
        prov_areaid         : DataTypes.STRING,
        prov_address        : DataTypes.STRING,
        prov_phone          : DataTypes.STRING,
        prov_contactName    : DataTypes.STRING,
        prov_type           : DataTypes.INTEGER,
        prov_ctime          : DataTypes.DATE
    });
};