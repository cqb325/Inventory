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
        Provider.save(params).then((ret, err)=>{
            console.log(ret, err);
        });
    }
};