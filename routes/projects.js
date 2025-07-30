const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery, executeTransaction } = require('../config/database');

const router = express.Router();

// Validation rules for project creation/update
const projectValidationRules = [
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('region').isIn(['AMESA', 'AMERICAS', 'EU', 'EAP']).withMessage('Invalid region'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('projectLeader').notEmpty().withMessage('Project leader is required'),
    body('process').notEmpty().withMessage('Process is required'),
    body('projectStartDate').isISO8601().toDate().withMessage('Invalid start date'),
    body('plannedCompletionDate').isISO8601().toDate().withMessage('Invalid completion date')
];

// Generate new project ID
async function generateProjectId() {
    try {
        const result = await executeQuery(
            'SELECT id FROM projects WHERE id LIKE "NPD-%" ORDER BY id DESC LIMIT 1'
        );
        
        if (result.length === 0) {
            return 'NPD-001';
        }
        
        const lastId = result[0].id;
        const number = parseInt(lastId.split('-')[1]) + 1;
        return `NPD-${String(number).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating project ID:', error);
        throw error;
    }
}

// GET /api/projects - Get all projects with optional filtering
router.get('/', async (req, res) => {
    try {
        const { search, region, status, page = 1, limit = 10 } = req.query;
        
        let sql = `
            SELECT p.*, pm.define_date, pm.measure_date, pm.analyze_date, 
                   pm.improve_date, pm.control_date
            FROM projects p
            LEFT JOIN project_milestones pm ON p.id = pm.project_id
            WHERE 1=1
        `;
        const params = [];
        
        // Add search filter
        if (search) {
            sql += ` AND (p.project_name LIKE ? OR p.project_leader LIKE ? OR p.process LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Add region filter
        if (region) {
            sql += ` AND p.region = ?`;
            params.push(region);
        }
        
        // Add status filter
        if (status) {
            sql += ` AND p.current_status = ?`;
            params.push(status);
        }
        
        sql += ` ORDER BY p.created_date DESC`;
        
        // Add pagination
        const offset = (page - 1) * limit;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const projects = await executeQuery(sql, params);
        
        // Get total count for pagination
        let countSql = 'SELECT COUNT(*) as total FROM projects p WHERE 1=1';
        const countParams = [];
        
        if (search) {
            countSql += ` AND (p.project_name LIKE ? OR p.project_leader LIKE ? OR p.process LIKE ?)`;
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (region) {
            countSql += ` AND p.region = ?`;
            countParams.push(region);
        }
        
        if (status) {
            countSql += ` AND p.current_status = ?`;
            countParams.push(status);
        }
        
        const countResult = await executeQuery(countSql, countParams);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT p.*, pm.define_date, pm.measure_date, pm.analyze_date, 
                   pm.improve_date, pm.control_date
            FROM projects p
            LEFT JOIN project_milestones pm ON p.id = pm.project_id
            WHERE p.id = ?
        `;
        
        const projects = await executeQuery(sql, [id]);
        
        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            data: projects[0]
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message
        });
    }
});

// POST /api/projects - Create new project
router.post('/', projectValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const projectId = await generateProjectId();
        const {
            projectName, region, unit, projectLeader, process, projectDescription,
            currentStatus, expectedBenefit, capexNeeded, approvedCapexValue,
            keyMetric, secondaryMetric, businessCase, problemStatement,
            goalStatement, teamMembers, projectStartDate, plannedCompletionDate,
            actualCompletionDate, expectedSaving, actualSaving, uploadDate,
            milestones = {}
        } = req.body;
        
        const queries = [
            {
                sql: `INSERT INTO projects (
                    id, project_name, region, unit, project_leader, process,
                    project_description, current_status, expected_benefit,
                    capex_needed, approved_capex_value, key_metric, secondary_metric,
                    business_case, problem_statement, goal_statement, team_members,
                    project_start_date, planned_completion_date, actual_completion_date,
                    expected_saving, actual_saving, upload_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                params: [
                    projectId, projectName, region, unit, projectLeader, process,
                    projectDescription, currentStatus || 'Initiated', expectedBenefit,
                    capexNeeded, approvedCapexValue, keyMetric, secondaryMetric,
                    businessCase, problemStatement, goalStatement, teamMembers,
                    projectStartDate, plannedCompletionDate, actualCompletionDate,
                    expectedSaving, actualSaving, uploadDate || new Date().toISOString().split('T')[0]
                ]
            },
            {
                sql: `INSERT INTO project_milestones (
                    project_id, define_date, measure_date, analyze_date, improve_date, control_date
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                params: [
                    projectId, milestones.define || null, milestones.measure || null,
                    milestones.analyze || null, milestones.improve || null, milestones.control || null
                ]
            }
        ];
        
        await executeTransaction(queries);
        
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { id: projectId }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', projectValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { id } = req.params;
        const {
            projectName, region, unit, projectLeader, process, projectDescription,
            currentStatus, expectedBenefit, capexNeeded, approvedCapexValue,
            keyMetric, secondaryMetric, businessCase, problemStatement,
            goalStatement, teamMembers, projectStartDate, plannedCompletionDate,
            actualCompletionDate, expectedSaving, actualSaving, uploadDate,
            milestones = {}
        } = req.body;
        
        // Check if project exists
        const existingProject = await executeQuery('SELECT id FROM projects WHERE id = ?', [id]);
        if (existingProject.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        const queries = [
            {
                sql: `UPDATE projects SET
                    project_name = ?, region = ?, unit = ?, project_leader = ?, process = ?,
                    project_description = ?, current_status = ?, expected_benefit = ?,
                    capex_needed = ?, approved_capex_value = ?, key_metric = ?, secondary_metric = ?,
                    business_case = ?, problem_statement = ?, goal_statement = ?, team_members = ?,
                    project_start_date = ?, planned_completion_date = ?, actual_completion_date = ?,
                    expected_saving = ?, actual_saving = ?, upload_date = ?
                    WHERE id = ?`,
                params: [
                    projectName, region, unit, projectLeader, process,
                    projectDescription, currentStatus, expectedBenefit,
                    capexNeeded, approvedCapexValue, keyMetric, secondaryMetric,
                    businessCase, problemStatement, goalStatement, teamMembers,
                    projectStartDate, plannedCompletionDate, actualCompletionDate,
                    expectedSaving, actualSaving, uploadDate, id
                ]
            },
            {
                sql: `INSERT INTO project_milestones (
                    project_id, define_date, measure_date, analyze_date, improve_date, control_date
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    define_date = VALUES(define_date),
                    measure_date = VALUES(measure_date),
                    analyze_date = VALUES(analyze_date),
                    improve_date = VALUES(improve_date),
                    control_date = VALUES(control_date)`,
                params: [
                    id, milestones.define || null, milestones.measure || null,
                    milestones.analyze || null, milestones.improve || null, milestones.control || null
                ]
            }
        ];
        
        await executeTransaction(queries);
        
        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
        });
    }
});

module.exports = router;