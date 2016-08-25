/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("stock_history", {
        stoh_id             : { type: DataTypes.STRING, primaryKey: true },
        ord_no              : DataTypes.STRING,
        prod_id             : DataTypes.STRING,
        amount              : DataTypes.INTEGER,
        fund                : DataTypes.FLOAT,
        time                : DataTypes.DATE,
        op                  : DataTypes.STRING
    });
};