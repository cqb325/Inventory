/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("orders", {
        ord_no              : { type: DataTypes.STRING, primaryKey: true },
        ord_status          : DataTypes.INTEGER,
        ord_contract        : DataTypes.STRING,
        prov_id             : DataTypes.STRING,
        ord_fund            : DataTypes.FLOAT,
        ord_time            : DataTypes.DATE,
        ord_fund_remain     : DataTypes.FLOAT,
        ord_comment         : DataTypes.STRING,
        order_type          : DataTypes.INTEGER
    });
};