/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("order_product", {
        id                  : { type: DataTypes.STRING, primaryKey: true },
        ord_no              : DataTypes.STRING,
        prod_id             : DataTypes.STRING,
        prod_amount         : DataTypes.FLOAT,
        prod_fund           : DataTypes.FLOAT,
        prod_price          : DataTypes.FLOAT
    });
};