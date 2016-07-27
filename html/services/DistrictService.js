/**
 * Created by cqb32_000 on 2016-07-27.
 */

module.exports = {
    /**
     *
     */
    getChildrenByParentId(parentid, callback){
        District.findAll({where: {dist_parentid: parentid}}).then(function(districts){
            if(districts){
                let items = districts.map(function(district){
                    return {
                        id: district.dataValues.dist_id,
                        text: district.dataValues.dist_shortname,
                        children: []
                    };
                });
                callback(items);
            }else{
                callback([]);
            }
        }).catch(function(error){
            callback(null);
        });
    }
};