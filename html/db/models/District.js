/**
 * Created by cqb32_000 on 2016-07-21.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define ("district", {
        dist_id               : { type: DataTypes.STRING, primaryKey: true },
        dist_name             : DataTypes.STRING,
        dist_parentid         : DataTypes.STRING,
        dist_shortname        : DataTypes.STRING,
        dist_level            : DataTypes.STRING,
        dist_mergername       : DataTypes.STRING,
        dist_zipcode          : DataTypes.STRING,
        dist_lon              : DataTypes.DOUBLE,
        dist_lat              : DataTypes.DOUBLE,
        dist_pinyin           : DataTypes.STRING
    });
};