/**
 * Created by cqb32_000 on 2016-09-13.
 */


module.exports = {
    /**
     * 分页列表
     */
    getPageList(params, callback){
        let pageNum = params.pageNum || 1;
        let pageSize = params.pageSize || 15;
        let offset = (pageNum - 1) * pageSize;

        let param = [];

        let sql = "select a.*,b.amount,b.sto_time from product a, stock b where a.prod_id=b.prod_id";
        if (params.prod_name) {
            sql += " and a.prod_name like ? ";
            param.push("%"+params.prod_name+"%");
        }
        let count_sql = "select count(*) as count from ( "+sql+" ) t";

        db.query(count_sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: param
        }).then(function (ret) {
            let count = ret[0].count;
            sql += " order by sto_time desc LIMIT ? OFFSET ?";
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
                }).catch(function(error){
                    console.log(error);
                    callback(null);
                });
        }).catch(function(error){
            console.log(error);
            callback(null);
        });
    },

    getStockHistory(prod_id, callback){
        StockHistory.findAll({where: {prod_id: prod_id}, order: [["time","DESC"]]}).then(function(list){
            if(list){
                list = list.map(function(item){
                    return item.dataValues;
                });
            }
            callback(list, null);
        }).catch(function(error){
            callback(null, error);
        });
    },

    getFundHistory(startDate, endDate, callback){
        let sql = `select sum(fund) as fund, opdate, sign from (
            select fund,date(time) as opdate,sign from order_fund where time between ? and ?
        ) t GROUP BY opdate,sign`;

        db.query(sql, {
            raw: true,
            type: db.QueryTypes.SELECT,
            replacements: [startDate, endDate]
        }).then(function (ret) {
            if(ret){
                let map = new Map();
                ret.forEach(function(item){
                    item.fund = eval(item.sign + item.fund);
                    if(map.get(item.opdate)){
                        let obj = map.get(item.opdate);

                        obj.fund = obj.fund+item.fund;
                    }else {
                        map.set(item.opdate,item);
                    }
                });

                ret = [...map.values()];
                console.log(ret);
                ret.sort(function(a, b){
                    return a.opdate.getTime() - b.opdate.getTime();
                });

                callback(ret, null);
            }else{
                callback(null, null);
            }
        });
    }
};