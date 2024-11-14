var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'coffee_shop'
});

conn.connect(function(err){
    if (err) throw err;
    console.log('Database is Connected successfully!');
});

module.exports = conn;