/**
 * Created by cqb32_000 on 2016-07-21.
 */

const uuid = require("uuid");

module.exports = {
    /**
     * 分页列表
     */
    getPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum-1) * pageSize;

        let condition = {
            offset: offset,
            limit: pageSize
        };

        if(params.prov_name){
            condition.where = {
                prov_name: {
                    $like: "%" + (params.prov_name) + "%"
                }
            };
        }
        Provider.findAndCountAll(condition).then(function(ret){
            let data = {
                total: ret.count,
                pageNum: pageNum,
                pageSize: pageSize,
                data: ret.rows
            };

            callback(data);
        });
    },

    /**
     * 保存
     */
    save(params, callback){
        params.prov_id = uuid.v1();
        params.prov_ctime = new Date();
        Provider.build(params).save().then((ret)=>{
            callback(true);
        }).catch(function(error) {
            callback(false);
        });
    },

    /**
     *
     */
    deleteById(id, callback){
        Provider.destroy({where : {prov_id: id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    getProvider(id, callback){
        Provider.findOne({where : {prov_id: id}}).then(function(provider){
            callback(provider.dataValues);
        }).catch(function(error){
            callback(null);
        });
    },

    saveEdit(params, callback){
        //let provider = Provider.build(params);
        Provider.update(params,{where: {prov_id: params.prov_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    }
};