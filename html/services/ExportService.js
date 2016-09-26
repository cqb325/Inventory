/**
 * Created by cqb32_000 on 2016-08-01.
 */

const uuid = require("uuid");
const Format = require("../format");
const moment = require("../lib/moment");
const StockService = require("./StockService");
module.exports = {
    /**
     * 分页列表
     */
    getPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum - 1) * pageSize;

        params.cli_name = params.cli_name ? params.cli_name : "";
        let param = ["%" + (params.cli_name) + "%", Format.ORDER_TYPE.OUT];

        let sql = "select a.*,b.cli_name,b.cli_areaid from orders a, client b where b.cli_name like ? and b.cli_id=a.prov_id and a.order_type=? ";
        if(params.ord_contract){
            sql += " and a.ord_contract=? ";
            param.push(params.ord_contract);
        }
        if(params.startDate){
            sql += " and a.ord_time >= ? ";
            param.push(params.startDate+" 00:00:00");
        }
        if(params.endDate){
            sql += " and a.ord_time <= ? ";
            param.push(params.endDate+" 23:59:59");
        }
        if(params.ord_status){
            sql += " and a.ord_status = ? ";
            param.push(params.ord_status);
        }

        let count_sql = "select count(*) as count from ( "+sql+" ) t";
        db.query(count_sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: param
        }).then(function (ret) {
            let count = ret[0].count;
            sql += " order by ord_time desc LIMIT ? OFFSET ?";
            param.push(pageSize);
            param.push(offset);
            db.query(sql, {raw: true, type: db.QueryTypes.SELECT, replacements: param})
                .then(function (ret) {
                    let data = {
                        total: count,
                        pageNum: pageNum,
                        pageSize: pageSize,
                        data: ret
                    };

                    callback(data);
                });
        });
    },

    getInnerBorrowPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum - 1) * pageSize;

        params.staff_name = params.staff_name ? params.staff_name : "";
        let param = ["%" + (params.staff_name) + "%", Format.ORDER_TYPE.INNER_BORROW];

        let sql = "select a.*,b.staff_name from orders a, staff b where b.staff_name like ? and b.staff_id=a.prov_id and a.order_type=? ";
        if(params.startDate){
            sql += " and a.ord_time >= ? ";
            param.push(params.startDate+" 00:00:00");
        }
        if(params.endDate){
            sql += " and a.ord_time <= ? ";
            param.push(params.endDate+" 23:59:59");
        }

        let count_sql = "select count(*) as count from ( "+sql+" ) t";
        db.query(count_sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: param
        }).then(function (ret) {
            let count = ret[0].count;
            sql += " order by ord_time desc LIMIT ? OFFSET ?";
            param.push(pageSize);
            param.push(offset);
            db.query(sql, {raw: true, type: db.QueryTypes.SELECT, replacements: param})
                .then(function (ret) {
                    let data = {
                        total: count,
                        pageNum: pageNum,
                        pageSize: pageSize,
                        data: ret
                    };

                    callback(data);
                });
        });
    },

    addOrder(params, importParams, callback){
        params.ord_no = uuid.v1();
        params.ord_status = 0;
        params.ord_fund_remain = params.ord_fund;
        params.order_type = Format.ORDER_TYPE.OUT;

        Orders.build(params).save().then((ret)=>{
            this.addProducts(ret, importParams, callback);
        }).catch(function(error) {
            callback(false);
        });
    },

    borrow(params, importParams, callback){
        params.ord_no = uuid.v1();
        params.sale_contract = uuid.v1();
        params.ord_status = Format.ORDER_STATUS.FUNDED;
        params.ord_fund_remain = params.ord_fund;
        params.order_type = Format.ORDER_TYPE.INNER_BORROW;
        params.fund_time = params.ord_time;

        Orders.build(params).save().then((ret)=>{
            this.addProducts(ret, importParams, callback);
        }).catch(function(error) {
            callback(false);
        });
    },

    /**
     * 添加订单产品
     */
    addProducts(order, params, callback){
        params.forEach((item)=>{
            item.ord_no = order.ord_no;
            item.id = uuid.v1();
        });

        OrderProduct.destroy({where: {
            ord_no: order.ord_no
        }}).then(function(){
            OrderProduct.bulkCreate(params).then(function(){
                callback(order.ord_no);
            }).catch(function(error){
                callback(false);
            });
        }).catch(function(error){
            callback(false);
        });
    },

    getOrder(ord_no, type, callback){
        let sql = "select * from orders a, client b where a.ord_no=? and a.prov_id=b.cli_id";
        if(type){
            if(type == Format.ORDER_TYPE.INNER_BORROW){
                sql = "select * from orders a, staff b where a.ord_no=? and a.prov_id=b.staff_id";
            }
        }
        db.query(sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: [ord_no]
        }).then(function (ret) {
            if(ret.length) {
                callback(ret[0]);
            }else{
                callback(null);
            }
        }).catch(function(error){
            callback(null);
        });
    },

    getProducts(ord_no, callback){
        let sql = "select b.*,a.id, a.ord_no, a.prod_amount, a.prod_fund, a.prod_price as price from order_product a, product b where a.ord_no=? and a.prod_id=b.prod_id";
        db.query(sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: [ord_no]
        }).then(function (ret) {
            callback(ret);
        }).catch(function(error){
            callback(null);
        });
    },

    payFund(params, order, callback){
        params.fund_id = uuid.v1();
        params.time = new Date();
        let remain = order.ord_fund_remain - params.fund;
        params.remain = remain;
        params.sign = "-";

        OrderFund.build(params).save().then(function(){
            let orderParam = {
                ord_fund_remain: remain
            };
            if(remain == 0){
                if(order.ord_status < Format.ORDER_STATUS.FUNDED) {
                    orderParam.ord_status = Format.ORDER_STATUS.FUNDED;
                    orderParam.fund_time = new Date();
                }
            }else{
                if(order.ord_status < Format.ORDER_STATUS.FUND) {
                    orderParam.ord_status = Format.ORDER_STATUS.FUND;
                }
            }
            Orders.update(orderParam, {where: {ord_no: order.ord_no}}).then(function(){
                callback(true);
            }).catch(function(error){
                callback(false);
            });
        }).catch(function(error){
            console.log(error);
            callback(false);
        });
    },

    getPayFunds(ord_no, callback){
        OrderFund.findAll({where : {ord_no: ord_no}, order: [["time","DESC"]]}).then(function(funds){
            let ret = funds.map(function(item){
                let data = item.dataValues;
                data.time = moment(data.time).format("YYYY-MM-DD HH:mm:ss");
                return data;
            });
            callback(ret);
        }).catch(function(error){
            callback(null);
        });
    },

    setSendStatus(ord_no, status, time, send_tracking, callback){
        this.setStatus(ord_no, status, time, callback, send_tracking);
    },

    /**
     *
     */
    setStatus(ord_no, status, time, callback, tracking){
        //已出库的话更新库存信息
        if(status == Format.ORDER_STATUS.SEND){
            let p = new Promise((resolve)=> {
                this.getOrder(ord_no, function(order){
                    if(order && order.ord_fund_remain > 0){
                        status = Format.ORDER_STATUS.FUND_SEND;
                        resolve(status);
                    }else{
                        resolve(status);
                    }
                });
            }).then((sta)=>{
                StockService.removeStockByOrder(ord_no, ()=>{
                    this.updateStatus(ord_no, status, time, callback, tracking);
                });
            });
        }else {
            this.updateStatus(ord_no, status, time, callback);
        }
    },

    updateStatus(ord_no, status, time, callback, tracking){
        let param = {
            ord_status: status
        };
        if(tracking){
            param["send_tracking"] = tracking;
        }

        if(status == Format.ORDER_STATUS.IMPORTED){
            param.arrival_time = time;
        }
        if(status == Format.ORDER_STATUS.SEND){
            param.send_time = time;
        }
        Orders.update(param, {where: {ord_no: ord_no}}).then(function (ret) {
            callback(true);
        }).catch(function (error) {
            console.log(error);
            callback(false);
        });
    },

    setVoucher(ord_no, voucher, callback){
        Orders.update({
            voucher: voucher
        }, {where: {ord_no: ord_no}}).then(function (ret) {
            callback(true);
        }).catch(function (error) {
            callback(false);
        });
    },

    saveInvoice(ord_no, params, callback){
        Orders.update(params, {where: {ord_no: ord_no}}).then(function (ret) {
            callback(true);
        }).catch(function (error) {
            console.log(error);
            callback(false);
        });
    }
};