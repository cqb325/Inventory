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

        params.prov_name = params.prov_name ? params.prov_name : "";
        let param = ["%" + (params.prov_name) + "%", pageSize, offset];
        let sql = "select * from provider a, district b where a.prov_name like ? and b.dist_id=a.prov_areaid order by prov_ctime desc LIMIT ? OFFSET ?";
        let count_sql = "select count(*) as count from ( select * from provider a, district b where a.prov_name like ? and b.dist_id=a.prov_areaid ) t";
        db.query(count_sql, {raw: true, type: db.QueryTypes.SELECT,replacements: ["%" + (params.prov_name) + "%"]}).then(function(ret){
            let count = ret[0].count;
            db.query(sql, {raw: true, type: db.QueryTypes.SELECT,replacements:param})
                .then(function(ret){
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

    /**
     * 保存
     */
    save(params, callback){
        params.prov_id = uuid.v1();
        params.prov_ctime = new Date();
        Provider.build(params).save().then((ret)=>{
            callback(true);
        }).catch(function(error) {
            console.error(error);
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
        let sql = "select * from provider a, district b where a.prov_id=? and b.dist_id=a.prov_areaid";
        db.query(sql, {raw: true, type: db.QueryTypes.SELECT,replacements:[id]}).then(function(results){
            if(results.length) {
                callback(results[0]);
            }else{
                callback({});
            }
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