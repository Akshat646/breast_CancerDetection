const mysql = require('mysql');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Akshat04sin@',
    database: 'npd_tracking',
    charset: 'utf8mb4'
};

// Create connection pool for better performance
const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    charset: dbConfig.charset,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Function to execute queries
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results, fields) => {
            if (error) {
                console.error('Database query error:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Function to create database if not exists
function createDatabase() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                reject(err);
                return;
            }

            console.log('Connected to MySQL server');

            const createDbQuery = `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`;
            connection.query(createDbQuery, (err, result) => {
                if (err) {
                    console.error('Error creating database:', err);
                    reject(err);
                } else {
                    console.log('Database created or already exists');
                    resolve(result);
                }
                connection.end();
            });
        });
    });
}

// Function to create tables
async function createTables() {
    try {
        const createProjectsTable = `
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(20) PRIMARY KEY,
                project_name VARCHAR(255) NOT NULL,
                region VARCHAR(50),
                unit VARCHAR(100),
                project_leader VARCHAR(100),
                process VARCHAR(100),
                project_description TEXT,
                current_status VARCHAR(50),
                expected_benefit TEXT,
                capex_needed DECIMAL(15,2),
                approved_capex_value DECIMAL(15,2),
                key_metric VARCHAR(255),
                secondary_metric VARCHAR(255),
                business_case TEXT,
                problem_statement TEXT,
                goal_statement TEXT,
                team_members TEXT,
                project_start_date DATE,
                planned_completion_date DATE,
                actual_completion_date DATE,
                expected_saving DECIMAL(15,2),
                actual_saving DECIMAL(15,2),
                upload_date DATE,
                created_date DATE,
                last_updated DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        const createMilestonesTable = `
            CREATE TABLE IF NOT EXISTS milestones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id VARCHAR(20),
                define_date DATE,
                measure_date DATE,
                analyze_date DATE,
                improve_date DATE,
                control_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `;

        await executeQuery(createProjectsTable);
        await executeQuery(createMilestonesTable);
        
        console.log('Tables created successfully');
        
        // Insert sample data if tables are empty
        await insertSampleData();
        
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

// Function to insert sample data
async function insertSampleData() {
    try {
        const countResult = await executeQuery('SELECT COUNT(*) as count FROM projects');
        if (countResult[0].count === 0) {
            console.log('Inserting sample data...');
            
            const sampleProjects = [
                {
                    id: 'NPD-001',
                    project_name: 'Tube Sealing Improvement',
                    region: 'EU',
                    unit: 'GER_BER',
                    project_leader: 'John Smith',
                    process: 'Packaging',
                    project_description: 'Improvement of tube sealing efficiency.',
                    current_status: 'In Progress',
                    expected_benefit: 'Cost Reduction, Improved Quality',
                    capex_needed: 50000,
                    approved_capex_value: 45000,
                    key_metric: 'Seal Quality Rate (%)',
                    business_case: 'Frequent rework due to poor seals, costing over $100K yearly.',
                    project_start_date: '2024-01-15',
                    planned_completion_date: '2024-09-30',
                    upload_date: '2024-01-15',
                    created_date: '2024-01-15',
                    last_updated: '2024-07-05'
                },
                {
                    id: 'NPD-002',
                    project_name: 'Filling Process Automation',
                    region: 'AMESA',
                    unit: 'IND_MUM',
                    project_leader: 'Anjali Patel',
                    process: 'Filling Process',
                    project_description: 'Automation of manual filling lines.',
                    current_status: 'Initiated',
                    expected_benefit: 'Increased Productivity',
                    capex_needed: 75000,
                    approved_capex_value: 60000,
                    key_metric: 'Throughput (Units/hr)',
                    business_case: 'Manual filling causes inconsistency and high labor cost.',
                    project_start_date: '2024-03-10',
                    planned_completion_date: '2024-12-15',
                    upload_date: '2024-03-10',
                    created_date: '2024-03-10',
                    last_updated: '2024-07-09'
                },
                {
                    id: 'NPD-003',
                    project_name: 'Digital Printing Upgrade',
                    region: 'AMERICAS',
                    unit: 'USA_CHI',
                    project_leader: 'Maria Lopez',
                    process: 'Tube Printing',
                    project_description: 'Upgrade to digital printing for better quality.',
                    current_status: 'Complete',
                    expected_benefit: 'Customer Satisfaction, Waste Reduction',
                    capex_needed: 30000,
                    approved_capex_value: 30000,
                    key_metric: 'Rejection Rate (%)',
                    business_case: 'Current method causes 5% rejection due to smudges.',
                    project_start_date: '2024-02-01',
                    planned_completion_date: '2024-08-01',
                    upload_date: '2024-02-01',
                    created_date: '2024-02-01',
                    last_updated: '2024-07-06'
                }
            ];

            const sampleMilestones = [
                {
                    project_id: 'NPD-001',
                    define_date: '2024-02-01',
                    measure_date: '2024-03-01'
                },
                {
                    project_id: 'NPD-002',
                    define_date: '2024-03-15',
                    measure_date: '2024-04-15'
                },
                {
                    project_id: 'NPD-003',
                    define_date: '2024-02-05',
                    measure_date: '2024-03-05',
                    analyze_date: '2024-04-05',
                    improve_date: '2024-05-05',
                    control_date: '2024-06-05'
                }
            ];

            // Insert projects
            for (const project of sampleProjects) {
                const columns = Object.keys(project).join(', ');
                const placeholders = Object.keys(project).map(() => '?').join(', ');
                const values = Object.values(project);
                
                await executeQuery(
                    `INSERT INTO projects (${columns}) VALUES (${placeholders})`,
                    values
                );
            }

            // Insert milestones
            for (const milestone of sampleMilestones) {
                const columns = Object.keys(milestone).join(', ');
                const placeholders = Object.keys(milestone).map(() => '?').join(', ');
                const values = Object.values(milestone);
                
                await executeQuery(
                    `INSERT INTO milestones (${columns}) VALUES (${placeholders})`,
                    values
                );
            }

            console.log('Sample data inserted successfully');
        }
    } catch (error) {
        console.error('Error inserting sample data:', error);
    }
}

// Initialize database
async function initializeDatabase() {
    try {
        await createDatabase();
        await createTables();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    executeQuery,
    initializeDatabase,
    pool
};