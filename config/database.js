const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'npd_tracking',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database (create tables if they don't exist)
const initializeDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Check if tables exist, if not create them
        const [tables] = await connection.execute("SHOW TABLES LIKE 'projects'");
        
        if (tables.length === 0) {
            console.log('⚙️ Creating database tables...');
            // Read and execute schema file would go here
            // For now, we'll assume tables are created manually
        }
        
        connection.release();
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};