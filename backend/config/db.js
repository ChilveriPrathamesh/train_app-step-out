const mysql = require('mysql2')


const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'Pratham2807@',
    database : 'train_app'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql connected successfully...')
});

module.exports = db;