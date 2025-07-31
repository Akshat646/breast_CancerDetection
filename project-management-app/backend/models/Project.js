const pool = require('../config/database');

class Project {
  // Get all projects
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get project by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new project
  static async create(projectData) {
    try {
      const {
        s_project_name, s_region, s_unit, s_project_leader, s_process,
        s_project_description, s_current_status, s_expected_benefit,
        s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
        s_business_case, s_problem_statement, s_goal_statement, s_team_members,
        d_project_start_date, d_planned_completion_date, d_actual_completion_date,
        s_expected_saving, s_actual_saving, define_date, measure_date,
        analyze_date, improve_date, control_date, d_upload_date, status
      } = projectData;

      const query = `
        INSERT INTO projects (
          s_project_name, s_region, s_unit, s_project_leader, s_process,
          s_project_description, s_current_status, s_expected_benefit,
          s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
          s_business_case, s_problem_statement, s_goal_statement, s_team_members,
          d_project_start_date, d_planned_completion_date, d_actual_completion_date,
          s_expected_saving, s_actual_saving, define_date, measure_date,
          analyze_date, improve_date, control_date, d_upload_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        s_project_name, s_region, s_unit, s_project_leader, s_process,
        s_project_description, s_current_status, s_expected_benefit,
        s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
        s_business_case, s_problem_statement, s_goal_statement, s_team_members,
        d_project_start_date, d_planned_completion_date, d_actual_completion_date,
        s_expected_saving, s_actual_saving, define_date, measure_date,
        analyze_date, improve_date, control_date, d_upload_date, status
      ];

      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...projectData };
    } catch (error) {
      throw error;
    }
  }

  // Update project
  static async update(id, projectData) {
    try {
      const {
        s_project_name, s_region, s_unit, s_project_leader, s_process,
        s_project_description, s_current_status, s_expected_benefit,
        s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
        s_business_case, s_problem_statement, s_goal_statement, s_team_members,
        d_project_start_date, d_planned_completion_date, d_actual_completion_date,
        s_expected_saving, s_actual_saving, define_date, measure_date,
        analyze_date, improve_date, control_date, d_upload_date, status
      } = projectData;

      const query = `
        UPDATE projects SET
          s_project_name = ?, s_region = ?, s_unit = ?, s_project_leader = ?, s_process = ?,
          s_project_description = ?, s_current_status = ?, s_expected_benefit = ?,
          s_capex_needed = ?, s_approved_capex_value = ?, s_key_metric = ?, s_secondary_metric = ?,
          s_business_case = ?, s_problem_statement = ?, s_goal_statement = ?, s_team_members = ?,
          d_project_start_date = ?, d_planned_completion_date = ?, d_actual_completion_date = ?,
          s_expected_saving = ?, s_actual_saving = ?, define_date = ?, measure_date = ?,
          analyze_date = ?, improve_date = ?, control_date = ?, d_upload_date = ?, status = ?
        WHERE id = ?
      `;

      const values = [
        s_project_name, s_region, s_unit, s_project_leader, s_process,
        s_project_description, s_current_status, s_expected_benefit,
        s_capex_needed, s_approved_capex_value, s_key_metric, s_secondary_metric,
        s_business_case, s_problem_statement, s_goal_statement, s_team_members,
        d_project_start_date, d_planned_completion_date, d_actual_completion_date,
        s_expected_saving, s_actual_saving, define_date, measure_date,
        analyze_date, improve_date, control_date, d_upload_date, status, id
      ];

      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete project
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Search projects
  static async search(searchTerm) {
    try {
      const query = `
        SELECT * FROM projects 
        WHERE s_project_name LIKE ? 
        OR s_project_leader LIKE ? 
        OR s_region LIKE ? 
        OR s_unit LIKE ?
        ORDER BY created_at DESC
      `;
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await pool.execute(query, [searchPattern, searchPattern, searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;