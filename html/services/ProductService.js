/**
 * Created by cqb32_000 on 2016-07-26.
 */

const uuid = require("uuid");
module.exports = {
    /**
     * 分页列表
     */
    getPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum - 1) * pageSize;

        let condition = {
            offset: offset,
            limit: pageSize
        };

        condition.where = {

        };
        if (params.prod_name) {
            condition.where.prod_name = {
                $like: "%" + (params.prod_name) + "%"
            }
        }
        Product.findAndCountAll(condition).then(function (ret) {
            let data = {
                total: ret.count,
                pageNum: pageNum,
                pageSize: pageSize,
                data: ret.rows
            };

            callback(data);
        });
    },

    getAll(callback){
        Product.findAll().then(function(products){
            let ret = products.map(function(product){
                return product.dataValues;
            });
            callback(ret);
        }).catch(function(error) {
            callback(null);
        });
    },

    /**
     * 删除产品
     */
    deleteById(prod_id, callback){
        Product.destroy({where : {prod_id: prod_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    save(params, callback){
        params.prod_id = uuid.v1();
        params.prod_ctime = new Date();
        Product.build(params).save().then((ret)=>{
            callback(true);
        }).catch(function(error) {
            callback(false);
        });
    },

    getProduct(prod_id, callback){
        Product.findOne({where : {prod_id: prod_id}}).then(function(product){
            callback(product.dataValues);
        }).catch(function(error){
            callback(null);
        });
    },

    saveEdit(params, callback){
        Product.update(params,{where: {prod_id: params.prod_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    /**
     * 获取所有库存中的产品
     */
    getAllStoredProducts(callback){
        let sql = "select a.*, b.amount from product a, stock b where a.prod_id=b.prod_id and b.amount > 0";
        db.query(sql, {
            raw: true,
            type: db.QueryTypes.SELECT
        }).then(function (ret) {
            callback(ret);
        }).catch(function(){
            callback(null);
        });
    }
};