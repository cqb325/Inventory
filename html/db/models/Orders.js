/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("orders", {
        ord_no              : { type: DataTypes.STRING, primaryKey: true },
        ord_status          : DataTypes.INTEGER,
        ord_contract        : DataTypes.STRING,
        sale_contract       : DataTypes.STRING,
        prov_id             : DataTypes.STRING,
        ord_fund            : DataTypes.FLOAT,
        ord_time            : DataTypes.DATE,
        ord_fund_remain     : DataTypes.FLOAT,
        ord_comment         : DataTypes.STRING,
        order_type          : DataTypes.INTEGER,
        send_time           : DataTypes.DATE,
        arrival_time        : DataTypes.DATE,
        fund_time           : DataTypes.DATE,
        voucher             : DataTypes.STRING,
        invoice_start       : DataTypes.DATE,
        invoice_arrival     : DataTypes.DATE,
        sign_user           : DataTypes.STRING,
        invoice_tracking    : DataTypes.STRING,
        send_tracking       : DataTypes.STRING
    });
};