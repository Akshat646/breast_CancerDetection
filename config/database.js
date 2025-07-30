const mysql = require('mysql');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'npd_tracking',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    multipleStatements: true
});

// Test database connection
function testConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Database connected successfully');
            connection.release();
            resolve(true);
        });
    });
}

// Execute query with error handling
function executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

// Execute transaction
function executeTransaction(queries) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
                return;
            }
            
            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    reject(err);
                    return;
                }
                
                let completedQueries = 0;
                const results = [];
                
                const executeNext = (index) => {
                    if (index >= queries.length) {
                        connection.commit((err) => {
                            if (err) {
                                connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                                return;
                            }
                            connection.release();
                            resolve(results);
                        });
                        return;
                    }
                    
                    const { sql, params } = queries[index];
                    connection.query(sql, params, (error, result) => {
                        if (error) {
                            connection.rollback(() => {
                                connection.release();
                                reject(error);
                            });
                            return;
                        }
                        
                        results.push(result);
                        executeNext(index + 1);
                    });
                };
                
                executeNext(0);
            });
        });
    });
}

// Graceful shutdown
function closePool() {
    return new Promise((resolve) => {
        pool.end(() => {
            console.log('Database pool closed');
            resolve();
        });
    });
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeTransaction,
    closePool
};