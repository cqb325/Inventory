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

        params.prov_name = params.prov_name ? params.prov_name : "";
        let param = ["%" + (params.prov_name) + "%", Format.ORDER_TYPE.IN];

        let sql = "select a.*,b.prov_name,b.prov_areaid from orders a, provider b where b.prov_name like ? and b.prov_id=a.prov_id and a.order_type=? ";
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

    addOrder(params, importParams, callback){
        params.ord_no = uuid.v1();
        params.ord_status = 0;
        params.ord_time = new Date();
        params.ord_fund_remain = params.ord_fund;
        params.order_type = Format.ORDER_TYPE.IN;

        Orders.build(params).save().then((ret)=>{
            this.addProducts(ret, importParams, callback);
        }).catch(function(error) {
            callback(false);
        });
    },

    /**
     * 添加订单产品
     */
    addProducts(order, importParams, callback){
        importParams.forEach((item)=>{
            item.ord_no = order.ord_no;
            item.id = uuid.v1();
        });

        OrderProduct.destroy({where: {
            ord_no: order.ord_no
        }}).then(function(){
            OrderProduct.bulkCreate(importParams).then(function(){
                callback(order.ord_no);
            }).catch(function(error){
                callback(false);
            });
        }).catch(function(error){
            callback(false);
        });
    },

    getOrderIn(ord_no, callback){
        let sql = "select * from orders a, provider b where a.ord_no=? and a.prov_id=b.prov_id";
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
        let sql = "select b.*,a.id, a.ord_no, a.prod_amount, a.prod_fund from order_product a, product b where a.ord_no=? and a.prod_id=b.prod_id";
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

        OrderFund.build(params).save().then(function(){
            let remain = order.ord_fund_remain - params.fund;
            let orderParam = {
                ord_fund_remain: remain
            };
            if(remain == 0){
                if(order.ord_status < Format.ORDER_STATUS.FUNDED) {
                    orderParam.ord_status = Format.ORDER_STATUS.FUNDED;
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
            callback(false);
        });
    },

    getPayFunds(ord_no, callback){
        OrderFund.findAll({where : {ord_no: ord_no}}).then(function(funds){
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

    /**
     *
     */
    setStatus(ord_no, status, callback){
        //已入库的话更新库存信息
        if(status == Format.ORDER_STATUS.SEND){
            let p = new Promise((resolve)=> {
                this.getOrderIn(ord_no, function(order){
                    if(order && order.ord_fund_remain > 0){
                        status = Format.ORDER_STATUS.FUND_SEND;
                        resolve(status);
                    }else{
                        resolve(status);
                    }
                });
            }).then((sta)=>{
                this.updateStatus(ord_no, sta, callback);
            });
        }else if(status == Format.ORDER_STATUS.IMPORTED){
            StockService.addStockByOrder(ord_no, ()=>{
                this.updateStatus(ord_no, status, callback);
            });
        }else {
            this.updateStatus(ord_no, status, callback);
        }
    },

    updateStatus(ord_no, status, callback){
        Orders.update({
            ord_status: status
        }, {where: {ord_no: ord_no}}).then(function (ret) {
            callback(true);
        }).catch(function (error) {
            console.log(error);
            callback(false);
        });
    },

    /**
     * 删除合同
     */
    deleteOrder(ord_no, callback){
        Orders.destroy({where: {ord_no: ord_no}}).then(function(){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    }
};