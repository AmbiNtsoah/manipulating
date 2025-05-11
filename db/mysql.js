const mysql = require('mysql2/promise');

const connexion = mysql.createPool({
    host: process.env.DB_HOST || 'mysql', // 'mysql' = nom du service MySQL
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'missie'
});

connexion.getConnection()
    .then(() => {
        console.log('Connection to MySQL database established successfully!');
    })
    .catch((err) => {
        console.error('Error connecting to MySQL database:', err);
    });

module.exports = connexion;
