/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("stock", {
        sto_id              : { type: DataTypes.STRING, primaryKey: true },
        prod_id             : DataTypes.STRING,
        amount              : DataTypes.INTEGER,
        sto_time            : DataTypes.DATE
    });
};