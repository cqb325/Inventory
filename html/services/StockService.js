/**
 * Created by cqb32_000 on 2016-08-24.
 */

const uuid = require("uuid");
const StockHistoryService = require("./StockHistoryService");
module.exports = {

    addStockByOrder(ord_no, callback){
        //获取库存中已存在的产品和没有入过库的产品
        this.getOrderStoredProducts(ord_no, (ret)=>{
            if(ret){
                //库存产品
                let storedProducts = ret[0];
                //未入库产品
                let unStoredProducts = ret[1];

                let updateProducts,insertProducts,histories = [];
                let p1, p2;
                if(storedProducts){
                    //创建库存产品更新数据
                    updateProducts = this._buildUpdateProducts(storedProducts);

                    this._buildHistories(histories, ord_no, storedProducts, "入库");

                    p1 = new Promise((resolve)=> {
                        this.update(updateProducts, resolve);
                    });

                }
                if(unStoredProducts){
                    insertProducts = this._buildInsertProducts(unStoredProducts);

                    this._buildHistories(histories, ord_no, unStoredProducts, "入库");

                    p2 = new Promise((resolve)=> {
                        this.insert(insertProducts, resolve);
                    });
                }

                let p3 = new Promise((resolve)=> {
                    StockHistoryService.addHistories(histories, resolve);
                });

                Promise.all([p1, p2, p3]).then(function(){
                    callback();
                });
            }
        });
    },

    removeStockByOrder(ord_no, callback){
        //获取库存中已存在的产品
        this.getOrderStoredProducts(ord_no, (ret)=>{
            if(ret){
                //库存产品
                let storedProducts = ret[0];

                let updateProducts,histories = [];
                let p1;
                if(storedProducts){
                    //创建库存产品更新数据
                    updateProducts = this._buildUpdateProducts2(storedProducts);

                    this._buildHistories(histories, ord_no, storedProducts, "出库");

                    p1 = new Promise((resolve)=> {
                        this.update(updateProducts, resolve);
                    });

                }
                let p3 = new Promise((resolve)=> {
                    StockHistoryService.addHistories(histories, resolve);
                });

                Promise.all([p1, p3]).then(function(){
                    callback();
                });
            }
        });
    },

    /**
     * 创建历史
     */
    _buildHistories(history, ord_no, products, type){
        products.forEach((item)=>{
            history.push({
                stoh_id: uuid.v1(),
                ord_no: ord_no,
                prod_id: item.prod_id,
                amount: item.prod_amount,
                fund: item.prod_fund,
                time: new Date(),
                op: type
            });
        });
    },

    /**
     * 创建更新产品信息
     */
    _buildUpdateProducts(products){
        return products.map((item)=>{
            return {
                sto_id: item.sto_id,
                prod_id: item.prod_id,
                amount: item.amount + item.prod_amount,
                sto_time: new Date()
            };
        });
    },

    /**
     * 创建更新产品信息
     */
    _buildUpdateProducts2(products){
        return products.map((item)=>{
            return {
                sto_id: item.sto_id,
                prod_id: item.prod_id,
                amount: item.amount - item.prod_amount,
                sto_time: new Date()
            };
        });
    },

    /**
     * 创建新入库的产品信息
     */
    _buildInsertProducts(products){
        return products.map((item)=>{
            return {
                sto_id: uuid.v1(),
                prod_id: item.prod_id,
                amount: item.prod_amount,
                sto_time: new Date()
            };
        });
    },

    update(products, callback){
        let rets = products.map((product)=>{
            return new Promise(function (resolve) {
                Stock.update(product,{where: {sto_id: product.sto_id}}).then(function(ret){
                    resolve(true);
                }).catch(function(error){
                    resolve(false);
                });
            });
        });

        Promise.all(rets).then(function(ret){
            callback(true);
        });
    },

    /**
     *
     */
    insert(products, callback){
        Stock.bulkCreate(products).then(function(){
            callback(true);
        }).catch(function(){
            callback(false);
        });
    },

    getOrderStoredProducts(ord_no, callback){
        let sql = "select b.*,a.prod_amount,a.prod_fund from order_product a, stock b where a.ord_no=? and a.prod_id=b.prod_id";

        let param = [ord_no];

        let p1 = new Promise(function (resolve) {
            db.query(sql, {
                raw: true,
                type: db.QueryTypes.SELECT,
                replacements: param
            }).then(function (ret) {
                resolve(ret);
            }).catch(function(){
                resolve(null);
            });
        });

        sql = "select a.prod_id,a.prod_amount,a.prod_fund from order_product a where a.ord_no=? and a.prod_id not in (select prod_id from stock)";

        let p2 = new Promise(function (resolve) {
            db.query(sql, {
                raw: true,
                type: db.QueryTypes.SELECT,
                replacements: param
            }).then(function (ret) {
                resolve(ret);
            }).catch(function(){
                resolve(null);
            });
        });

        Promise.all([p1, p2]).then(function (result) {
            callback(result);
        });
    }
};