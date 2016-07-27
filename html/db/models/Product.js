/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("product", {
        prod_id             : { type: DataTypes.STRING, primaryKey: true },
        prov_id             : DataTypes.STRING,
        prod_name           : DataTypes.STRING,
        prod_price          : DataTypes.DOUBLE,
        prod_brand          : DataTypes.STRING,
        prod_type           : DataTypes.STRING,
        prod_model          : DataTypes.STRING,
        prod_specifications : DataTypes.STRING,
        prod_ctime          : DataTypes.DATE
    });
};