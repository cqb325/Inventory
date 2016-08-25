/**
 * Created by cqb32_000 on 2016-08-24.
 */

const uuid = require("uuid");
module.exports = {

    /**
     * 添加历史
     */
    addHistories(data, callback){
        StockHistory.bulkCreate(data).then(function(){
            callback(true);
        }).catch(function(){
            callback(false);
        });
    }
};