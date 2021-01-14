const mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'aolai'
});
console.log('mysql连接成功');
module.exports = connection;