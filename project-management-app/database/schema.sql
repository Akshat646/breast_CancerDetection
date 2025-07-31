-- Create database
CREATE DATABASE IF NOT EXISTS project_management;
USE project_management;

-- Create projects table with all specified fields
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  s_project_name VARCHAR(255),
  s_region VARCHAR(100),
  s_unit VARCHAR(100),
  s_project_leader VARCHAR(100),
  s_process VARCHAR(100),
  s_project_description TEXT,
  s_current_status VARCHAR(100),
  s_expected_benefit TEXT,
  s_capex_needed VARCHAR(100),
  s_approved_capex_value VARCHAR(100),
  s_key_metric VARCHAR(100),
  s_secondary_metric VARCHAR(100),
  s_business_case TEXT,
  s_problem_statement TEXT,
  s_goal_statement TEXT,
  s_team_members TEXT,
  d_project_start_date DATE,
  d_planned_completion_date DATE,
  d_actual_completion_date DATE,
  s_expected_saving VARCHAR(100),
  s_actual_saving VARCHAR(100),
  define_date DATE,
  measure_date DATE,
  analyze_date DATE,
  improve_date DATE,
  control_date DATE,
  d_upload_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO projects (
  s_project_name, s_region, s_unit, s_project_leader, s_process, 
  s_project_description, s_current_status, s_expected_benefit, 
  s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
  d_project_start_date, d_planned_completion_date, s_expected_saving
) VALUES 
(
  'Process Optimization Initiative', 'North America', 'Manufacturing', 
  'John Smith', 'Lean Six Sigma', 'Streamline production workflow to reduce waste',
  'In Progress', 'Reduce production time by 15%', '50000', '45000',
  'Production Time', 'Cost Reduction', '2024-01-15', '2024-06-30', '100000'
),
(
  'Quality Improvement Project', 'Europe', 'Quality Assurance', 
  'Sarah Johnson', 'DMAIC', 'Improve product quality and reduce defects',
  'Planning', 'Reduce defect rate by 20%', '30000', '28000',
  'Defect Rate', 'Customer Satisfaction', '2024-02-01', '2024-08-15', '75000'
);