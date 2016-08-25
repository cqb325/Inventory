/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("order_fund", {
        fund_id                  : { type: DataTypes.STRING, primaryKey: true },
        ord_no                   : DataTypes.STRING,
        fund                     : DataTypes.FLOAT,
        time                     : DataTypes.DATE,
        comment                  : DataTypes.STRING
    });
};