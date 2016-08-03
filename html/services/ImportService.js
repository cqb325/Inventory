/**
 * Created by cqb32_000 on 2016-08-01.
 */

const uuid = require("uuid");

module.exports = {
    /**
     * ∑÷“≥¡–±Ì
     */
    getPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum - 1) * pageSize;

        params.prov_name = params.prov_name ? params.prov_name : "";
        let param = ["%" + (params.prov_name) + "%"];

        let sql = "select a.*,b.prov_name,b.prov_areaid from order_in a, provider b where b.prov_name like ? and b.prov_id=a.prov_id ";
        if(params.ord_contract){
            sql += " and a.ord_contract=? ";
            param.push(params.ord_contract);
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
    }
};