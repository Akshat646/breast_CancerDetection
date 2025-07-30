-- NPD Tracking System Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS npd_tracking;
USE npd_tracking;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(20) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    region ENUM('AMESA', 'AMERICAS', 'EU', 'EAP') NOT NULL,
    unit VARCHAR(100) NOT NULL,
    project_leader VARCHAR(255) NOT NULL,
    process VARCHAR(255) NOT NULL,
    project_description TEXT,
    current_status ENUM('Initiated', 'In Progress', 'Complete', 'On Hold', 'Cancelled') DEFAULT 'Initiated',
    expected_benefit TEXT,
    capex_needed DECIMAL(15,2),
    approved_capex_value DECIMAL(15,2),
    key_metric VARCHAR(255),
    secondary_metric VARCHAR(255),
    business_case TEXT,
    problem_statement TEXT,
    goal_statement TEXT,
    team_members TEXT,
    project_start_date DATE NOT NULL,
    planned_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    expected_saving DECIMAL(15,2),
    actual_saving DECIMAL(15,2),
    upload_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_status (current_status),
    INDEX idx_project_leader (project_leader),
    INDEX idx_start_date (project_start_date)
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    define_date DATE,
    measure_date DATE,
    analyze_date DATE,
    improve_date DATE,
    control_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create units/countries lookup table
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region ENUM('AMESA', 'AMERICAS', 'EU', 'EAP') NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    unit_name VARCHAR(100) NOT NULL,
    INDEX idx_region (region)
);

-- Insert default units data
INSERT INTO units (region, unit_code, unit_name) VALUES
-- AMESA Region
('AMESA', 'IND_MUM', 'India - Mumbai'),
('AMESA', 'IND_DEL', 'India - Delhi'),
('AMESA', 'UAE_DUB', 'UAE - Dubai'),
('AMESA', 'SA_JHB', 'South Africa - Johannesburg'),

-- AMERICAS Region
('AMERICAS', 'USA_CHI', 'USA - Chicago'),
('AMERICAS', 'USA_NY', 'USA - New York'),
('AMERICAS', 'BRA_SAO', 'Brazil - São Paulo'),
('AMERICAS', 'MEX_MEX', 'Mexico - Mexico City'),

-- EU Region
('EU', 'GER_BER', 'Germany - Berlin'),
('EU', 'UK_LON', 'UK - London'),
('EU', 'FRA_PAR', 'France - Paris'),
('EU', 'ITA_MIL', 'Italy - Milan'),

-- EAP Region
('EAP', 'CHN_SHA', 'China - Shanghai'),
('EAP', 'JPN_TOK', 'Japan - Tokyo'),
('EAP', 'KOR_SEO', 'South Korea - Seoul'),
('EAP', 'AUS_SYD', 'Australia - Sydney');

-- Insert sample data
INSERT INTO projects (
    id, project_name, region, unit, project_leader, process, project_description,
    current_status, expected_benefit, capex_needed, approved_capex_value,
    key_metric, business_case, project_start_date, planned_completion_date
) VALUES
('NPD-001', 'Tube Sealing Improvement', 'EU', 'GER_BER', 'John Smith', 'Packaging',
 'Improvement of tube sealing efficiency.', 'In Progress', 'Cost Reduction, Improved Quality',
 50000.00, 45000.00, 'Seal Quality Rate (%)', 
 'Frequent rework due to poor seals, costing over $100K yearly.',
 '2024-01-15', '2024-09-30'),

('NPD-002', 'Filling Process Automation', 'AMESA', 'IND_MUM', 'Anjali Patel', 'Filling Process',
 'Automation of manual filling lines.', 'Initiated', 'Increased Productivity',
 75000.00, 60000.00, 'Throughput (Units/hr)',
 'Manual filling causes inconsistency and high labor cost.',
 '2024-03-10', '2024-12-15'),

('NPD-003', 'Digital Printing Upgrade', 'AMERICAS', 'USA_CHI', 'Maria Lopez', 'Tube Printing',
 'Upgrade to digital printing for better quality.', 'Complete', 'Customer Satisfaction, Waste Reduction',
 30000.00, 30000.00, 'Rejection Rate (%)',
 'Current method causes 5% rejection due to smudges.',
 '2024-02-01', '2024-08-01');

-- Insert sample milestones
INSERT INTO project_milestones (project_id, define_date, measure_date, analyze_date, improve_date, control_date) VALUES
('NPD-001', '2024-02-01', '2024-03-01', NULL, NULL, NULL),
('NPD-002', '2024-03-15', '2024-04-15', NULL, NULL, NULL),
('NPD-003', '2024-02-05', '2024-03-05', '2024-04-05', '2024-05-05', '2024-06-05');