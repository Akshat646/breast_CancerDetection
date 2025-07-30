const { pool } = require('../config/database');

class Project {
    // Get all projects with pagination and search
    static async getAll(page = 1, limit = 10, search = '') {
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT p.*, 
                       GROUP_CONCAT(
                           CONCAT(m.milestone_type, ':', m.milestone_date) 
                           ORDER BY m.milestone_type SEPARATOR '|'
                       ) as milestones
                FROM projects p
                LEFT JOIN milestones m ON p.n_project_id = m.n_project_id
            `;
            
            let params = [];
            
            if (search) {
                query += ` WHERE p.s_project_name LIKE ? OR p.s_region LIKE ? OR p.s_unit LIKE ? OR p.s_process LIKE ?`;
                const searchTerm = `%${search}%`;
                params = [searchTerm, searchTerm, searchTerm, searchTerm];
            }
            
            query += ` GROUP BY p.n_project_id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            
            const [rows] = await pool.execute(query, params);
            
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM projects';
            let countParams = [];
            
            if (search) {
                countQuery += ` WHERE s_project_name LIKE ? OR s_region LIKE ? OR s_unit LIKE ? OR s_process LIKE ?`;
                const searchTerm = `%${search}%`;
                countParams = [searchTerm, searchTerm, searchTerm, searchTerm];
            }
            
            const [countResult] = await pool.execute(countQuery, countParams);
            const total = countResult[0].total;
            
            return {
                projects: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching projects: ${error.message}`);
        }
    }
    
    // Get project by ID
    static async getById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT p.*, 
                        GROUP_CONCAT(
                            CONCAT(m.milestone_type, ':', m.milestone_date) 
                            ORDER BY m.milestone_type SEPARATOR '|'
                        ) as milestones
                 FROM projects p
                 LEFT JOIN milestones m ON p.n_project_id = m.n_project_id
                 WHERE p.n_project_id = ?
                 GROUP BY p.n_project_id`,
                [id]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return rows[0];
        } catch (error) {
            throw new Error(`Error fetching project: ${error.message}`);
        }
    }
    
    // Create new project
    static async create(projectData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Insert project
            const [result] = await connection.execute(
                `INSERT INTO projects (
                    s_project_name, s_region, s_unit, s_project_leader, s_process,
                    s_project_description, s_current_status, s_expected_benefit, s_capex_needed,
                    s_approved_capex_value, s_key_metric, s_secondary_metric, s_business_case,
                    s_problem_statement, s_goal_statement, s_team_members, d_project_start_date,
                    d_planned_completion_date, d_actual_completion_date, s_expected_saving,
                    s_actual_saving, d_upload_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    projectData.s_project_name, projectData.s_region, projectData.s_unit,
                    projectData.s_project_leader, projectData.s_process, projectData.s_project_description,
                    projectData.s_current_status, projectData.s_expected_benefit, projectData.s_capex_needed,
                    projectData.s_approved_capex_value, projectData.s_key_metric, projectData.s_secondary_metric,
                    projectData.s_business_case, projectData.s_problem_statement, projectData.s_goal_statement,
                    projectData.s_team_members, projectData.d_project_start_date, projectData.d_planned_completion_date,
                    projectData.d_actual_completion_date, projectData.s_expected_saving, projectData.s_actual_saving,
                    projectData.d_upload_date
                ]
            );
            
            const projectId = result.insertId;
            
            // Insert milestones if provided
            if (projectData.milestones) {
                for (const [type, date] of Object.entries(projectData.milestones)) {
                    if (date) {
                        await connection.execute(
                            'INSERT INTO milestones (n_project_id, milestone_type, milestone_date) VALUES (?, ?, ?)',
                            [projectId, type, date]
                        );
                    }
                }
            }
            
            await connection.commit();
            return projectId;
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error creating project: ${error.message}`);
        } finally {
            connection.release();
        }
    }
    
    // Update project
    static async update(id, projectData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Update project
            await connection.execute(
                `UPDATE projects SET 
                    s_project_name = ?, s_region = ?, s_unit = ?, s_project_leader = ?, s_process = ?,
                    s_project_description = ?, s_current_status = ?, s_expected_benefit = ?, s_capex_needed = ?,
                    s_approved_capex_value = ?, s_key_metric = ?, s_secondary_metric = ?, s_business_case = ?,
                    s_problem_statement = ?, s_goal_statement = ?, s_team_members = ?, d_project_start_date = ?,
                    d_planned_completion_date = ?, d_actual_completion_date = ?, s_expected_saving = ?,
                    s_actual_saving = ?, d_upload_date = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE n_project_id = ?`,
                [
                    projectData.s_project_name, projectData.s_region, projectData.s_unit,
                    projectData.s_project_leader, projectData.s_process, projectData.s_project_description,
                    projectData.s_current_status, projectData.s_expected_benefit, projectData.s_capex_needed,
                    projectData.s_approved_capex_value, projectData.s_key_metric, projectData.s_secondary_metric,
                    projectData.s_business_case, projectData.s_problem_statement, projectData.s_goal_statement,
                    projectData.s_team_members, projectData.d_project_start_date, projectData.d_planned_completion_date,
                    projectData.d_actual_completion_date, projectData.s_expected_saving, projectData.s_actual_saving,
                    projectData.d_upload_date, id
                ]
            );
            
            // Update milestones
            if (projectData.milestones) {
                // Delete existing milestones
                await connection.execute('DELETE FROM milestones WHERE n_project_id = ?', [id]);
                
                // Insert new milestones
                for (const [type, date] of Object.entries(projectData.milestones)) {
                    if (date) {
                        await connection.execute(
                            'INSERT INTO milestones (n_project_id, milestone_type, milestone_date) VALUES (?, ?, ?)',
                            [id, type, date]
                        );
                    }
                }
            }
            
            await connection.commit();
            return true;
            
        } catch (error) {
            await connection.rollback();
            throw new Error(`Error updating project: ${error.message}`);
        } finally {
            connection.release();
        }
    }
    
    // Delete project
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM projects WHERE n_project_id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting project: ${error.message}`);
        }
    }
    
    // Get units by region
    static async getUnitsByRegion(region) {
        try {
            const units = {
                'AMESA': ['Mumbai Plant', 'Durban Plant', 'Cairo Plant', 'Lagos Plant'],
                'AMERICAS': ['Chicago Plant', 'São Paulo Plant', 'Mexico City Plant', 'Toronto Plant'],
                'EU': ['Berlin Plant', 'Paris Plant', 'London Plant', 'Madrid Plant'],
                'EAP': ['Singapore Plant', 'Tokyo Plant', 'Sydney Plant', 'Bangkok Plant']
            };
            
            return units[region] || [];
        } catch (error) {
            throw new Error(`Error fetching units: ${error.message}`);
        }
    }
}

module.exports = Project;