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

        params.cli_name = params.cli_name ? params.cli_name : "";
        let param = ["%" + (params.cli_name) + "%", pageSize, offset];

        let sql = "select * from client a, district b where a.cli_name like ? and b.dist_id=a.cli_areaid order by cli_ctime desc LIMIT ? OFFSET ?";
        let count_sql = "select count(*) as count from ( select * from client a, district b where a.cli_name like ? and b.dist_id=a.cli_areaid ) t";
        db.query(count_sql, {raw: true, type: db.QueryTypes.SELECT,replacements: ["%" + (params.cli_name) + "%"]}).then(function(ret){
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

    getAll(callback){
        Client.findAll({order: [["cli_name","ASC"]]}).then(function(clients){
            let ret = clients.map(function(client){
                let prod = client.dataValues;
                prod.id = prod.cli_id;
                prod.text = prod.cli_name;
                return prod;
            });
            callback(ret);
        }).catch(function(error) {
            callback(null);
        });
    },

    /**
     * 保存
     */
    save(params, callback){
        params.cli_id = uuid.v1();
        params.cli_ctime = new Date();
        Client.build(params).save().then((ret)=>{
            callback(true);
        }).catch(function(error) {
            callback(false);
        });
    },

    /**
     *
     */
    deleteById(id, callback){
        Client.destroy({where : {cli_id: id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    getClient(cli_id, callback){
        let sql = "select * from client a, district b where a.cli_id=? and b.dist_id=a.cli_areaid";
        db.query(sql, {raw: true, type: db.QueryTypes.SELECT,replacements:[cli_id]}).then(function(results){
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
        Client.update(params,{where: {cli_id: params.cli_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    }
};