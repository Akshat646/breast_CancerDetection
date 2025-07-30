-- NPD Tracking Database Schema
CREATE DATABASE IF NOT EXISTS npd_tracking;
USE npd_tracking;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    n_project_id INT AUTO_INCREMENT PRIMARY KEY,
    s_project_name VARCHAR(255) NOT NULL,
    s_region ENUM('AMESA', 'AMERICAS', 'EU', 'EAP') NOT NULL,
    s_unit VARCHAR(255) NOT NULL,
    s_project_leader TEXT,
    s_process VARCHAR(255),
    s_project_description TEXT,
    s_current_status VARCHAR(100),
    s_expected_benefit TEXT,
    s_capex_needed DECIMAL(15,2),
    s_approved_capex_value DECIMAL(15,2),
    s_key_metric VARCHAR(255),
    s_secondary_metric VARCHAR(255),
    s_business_case TEXT,
    s_problem_statement TEXT,
    s_goal_statement TEXT,
    s_team_members TEXT,
    d_project_start_date DATE,
    d_planned_completion_date DATE,
    d_actual_completion_date DATE,
    s_expected_saving DECIMAL(15,2),
    s_actual_saving DECIMAL(15,2),
    d_upload_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    n_milestone_id INT AUTO_INCREMENT PRIMARY KEY,
    n_project_id INT NOT NULL,
    milestone_type ENUM('define', 'measure', 'analyze', 'improve', 'control') NOT NULL,
    milestone_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (n_project_id) REFERENCES projects(n_project_id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_milestone (n_project_id, milestone_type)
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
    n_attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    n_project_id INT NOT NULL,
    s_filename VARCHAR(255) NOT NULL,
    s_original_name VARCHAR(255) NOT NULL,
    s_file_path VARCHAR(500) NOT NULL,
    s_file_type VARCHAR(100),
    n_file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (n_project_id) REFERENCES projects(n_project_id) ON DELETE CASCADE
);

-- Work trail/audit log table
CREATE TABLE IF NOT EXISTS work_trail (
    n_trail_id INT AUTO_INCREMENT PRIMARY KEY,
    n_project_id INT NOT NULL,
    s_action VARCHAR(100) NOT NULL,
    s_description TEXT,
    s_old_values JSON,
    s_new_values JSON,
    s_user VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (n_project_id) REFERENCES projects(n_project_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO projects (
    s_project_name, s_region, s_unit, s_project_leader, s_process, 
    s_project_description, s_current_status, s_expected_benefit, s_capex_needed, 
    s_approved_capex_value, s_key_metric, s_business_case, d_project_start_date, 
    d_planned_completion_date, d_upload_date
) VALUES 
(
    'Tube Sealing Efficiency', 'EU', 'Berlin Plant', 'John Smith', 'Packaging',
    'Improvement of tube sealing efficiency.', 'In Progress', 'Cost Reduction, Improved Quality',
    50000, 45000, 'Seal Quality Rate (%)', 
    'Frequent rework due to poor seals, costing over $100K yearly.',
    '2024-01-15', '2024-09-30', '2024-07-05'
),
(
    'Filling Line Automation', 'AMESA', 'Mumbai Plant', 'Anjali Patel', 'Filling Process',
    'Automation of manual filling lines.', 'Initiated', 'Increased Productivity',
    75000, 60000, 'Throughput (Units/hr)',
    'Manual filling causes inconsistency and high labor cost.',
    '2024-03-10', '2024-12-15', '2024-07-09'
),
(
    'Digital Printing Upgrade', 'AMERICAS', 'Chicago Plant', 'Maria Lopez', 'Tube Printing',
    'Upgrade to digital printing for better quality.', 'Complete', 'Customer Satisfaction, Waste Reduction',
    30000, 30000, 'Rejection Rate (%)',
    'Current method causes 5% rejection due to smudges.',
    '2024-02-01', '2024-08-01', '2024-07-06'
);

-- Insert sample milestones
INSERT INTO milestones (n_project_id, milestone_type, milestone_date) VALUES
(1, 'define', '2024-01-15'),
(1, 'measure', '2024-03-01'),
(2, 'define', '2024-03-10'),
(2, 'measure', '2024-04-15'),
(3, 'define', '2024-02-01'),
(3, 'measure', '2024-03-01'),
(3, 'analyze', '2024-04-01'),
(3, 'improve', '2024-05-01'),
(3, 'control', '2024-06-01');