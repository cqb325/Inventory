/**
 * Created by cqb32_000 on 2016-07-21.
 */
var Sequelize = require('sequelize');

// initialize database connection
var sequelize = new Sequelize("inventory", "root", "123456", {
    port: 3306,
    host: "127.0.0.1",
    dialect: 'mysql',
    logging: console.log,

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    define: {
        timestamps: false,
        freezeTableName: true
    }
});

module.exports.db = sequelize;


var fs = require('fs');
var loadmodels = function(root){
    var files = fs.readdirSync(root+"/models");
    if(files){
        files.forEach(function(file){
            var name = file.replace(".js","");
            module.exports[name] = sequelize.import(root+'/models/' + name);
        });
    }
    // describe relationships
    (function(m) {

    })(module.exports);
};

loadmodels(__dirname);