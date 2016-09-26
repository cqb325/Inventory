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
        if (params.staff_name) {
            condition.where.staff_name = {
                $like: "%" + (params.staff_name) + "%"
            }
        }
        Staff.findAndCountAll(condition).then(function (ret) {
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
        Staff.findAll().then(function(staffs){
            let ret = staffs.map(function(staff){
                let prod = staff.dataValues;
                prod.id = prod.staff_id;
                prod.text = prod.staff_name;
                return prod;
            });
            callback(ret);
        }).catch(function(error) {
            callback(null);
        });
    },

    getAllHasBorrow(callback){
        let sql = "select a.* from staff a,orders b where a.staff_id=b.prov_id";
        db.query(sql, {raw: true, type: db.QueryTypes.SELECT,replacements: []}).then(function(staffs){
            let ret = staffs.map(function(staff){
                let prod = {};
                prod.id = staff.staff_id;
                prod.text = staff.staff_name;
                return prod;
            });
            callback(ret);
        }).catch(function(e){
            callback(null);
        });
    },

    /**
     * 删除员工
     */
    deleteById(staff_id, callback){
        Staff.destroy({where : {staff_id: staff_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    save(params, callback){
        params.staff_id = uuid.v1();
        Staff.build(params).save().then((ret)=>{
            callback(true);
        }).catch(function(error) {
            callback(false);
        });
    },

    getStaff(staff_id, callback){
        Staff.findOne({where : {staff_id: staff_id}}).then(function(staff){
            callback(staff.dataValues);
        }).catch(function(error){
            callback(null);
        });
    },

    saveEdit(params, callback){
        Staff.update(params,{where: {staff_id: params.staff_id}}).then(function(ret){
            callback(true);
        }).catch(function(error){
            callback(false);
        });
    },

    importData(data, callback){
        let params = data.map(function(item, index){
            return {
                staff_id: uuid.v1(),
                staff_name: item["姓名"],
                staff_phone: item["电话"]
            };
        });

        Staff.bulkCreate(params).then(function(){
            callback(true);
        }).catch(function(){
            callback(false);
        });
    }
};