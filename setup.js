#!/usr/bin/env node

const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function createConnection(config) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(config);
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(connection);
        });
    });
}

function executeQuery(connection, sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

async function setupDatabase() {
    console.log('🚀 NPD Tracking System Database Setup\n');
    
    let connection;
    
    try {
        // Get database credentials from user or use env defaults
        const dbHost = process.env.DB_HOST || await question('MySQL Host (default: localhost): ') || 'localhost';
        const dbPort = process.env.DB_PORT || await question('MySQL Port (default: 3306): ') || '3306';
        const dbUser = process.env.DB_USER || await question('MySQL Username (default: root): ') || 'root';
        const dbPassword = process.env.DB_PASSWORD || await question('MySQL Password: ');
        
        console.log('\n📡 Testing MySQL connection...');
        
        // Test connection without database first
        const connectionConfig = {
            host: dbHost,
            port: parseInt(dbPort),
            user: dbUser,
            password: dbPassword,
            multipleStatements: true
        };
        
        connection = await createConnection(connectionConfig);
        console.log('✅ MySQL connection successful');
        
        console.log('📊 Creating database and tables...');
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the entire schema as multiple statements
        await executeQuery(connection, schema);
        
        console.log('✅ Database schema created successfully');
        
        // Test with the new database
        await executeQuery(connection, 'USE npd_tracking');
        const tables = await executeQuery(connection, 'SHOW TABLES');
        
        console.log('📋 Created tables:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Test sample data
        const projects = await executeQuery(connection, 'SELECT COUNT(*) as count FROM projects');
        console.log(`📝 Sample projects loaded: ${projects[0].count}`);
        
        // Update .env file if needed
        if (!process.env.DB_HOST) {
            const envContent = `# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=npd_tracking

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_here
`;
            fs.writeFileSync('.env', envContent);
            console.log('📝 .env file updated with database configuration');
        }
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('📖 Next steps:');
        console.log('   1. Run: npm start');
        console.log('   2. Open: http://localhost:3000');
        console.log('   3. Check API: http://localhost:3000/api/health');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Ensure MySQL is running');
        console.log('   2. Check your credentials');
        console.log('   3. Verify MySQL service is accessible');
        console.log('   4. Make sure MySQL user has CREATE privileges');
    } finally {
        if (connection) {
            connection.end();
        }
        rl.close();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };