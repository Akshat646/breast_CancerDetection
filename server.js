const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { executeQuery, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database on server start
initializeDatabase().catch(console.error);

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Helper function to generate new project ID
async function generateProjectId() {
    try {
        const result = await executeQuery(
            "SELECT id FROM projects WHERE id LIKE 'NPD-%' ORDER BY id DESC LIMIT 1"
        );
        
        if (result.length === 0) {
            return 'NPD-001';
        }
        
        const lastId = result[0].id;
        const number = parseInt(lastId.split('-')[1]);
        return `NPD-${String(number + 1).padStart(3, '0')}`;
    } catch (error) {
        console.error('Error generating project ID:', error);
        return 'NPD-001';
    }
}

// Routes

// Get all projects with milestones
app.get('/api/projects', async (req, res) => {
    try {
        const projectsQuery = `
            SELECT p.*, 
                   m.define_date, m.measure_date, m.analyze_date, 
                   m.improve_date, m.control_date
            FROM projects p 
            LEFT JOIN milestones m ON p.id = m.project_id 
            ORDER BY p.created_at DESC
        `;
        
        const projects = await executeQuery(projectsQuery);
        
        // Format the response to match frontend expectations
        const formattedProjects = projects.map(project => ({
            id: project.id,
            projectName: project.project_name,
            region: project.region,
            unit: project.unit,
            projectLeader: project.project_leader,
            process: project.process,
            projectDescription: project.project_description,
            currentStatus: project.current_status,
            expectedBenefit: project.expected_benefit,
            capexNeeded: project.capex_needed,
            approvedCapexValue: project.approved_capex_value,
            keyMetric: project.key_metric,
            secondaryMetric: project.secondary_metric,
            businessCase: project.business_case,
            problemStatement: project.problem_statement,
            goalStatement: project.goal_statement,
            teamMembers: project.team_members,
            projectStartDate: formatDate(project.project_start_date),
            plannedCompletionDate: formatDate(project.planned_completion_date),
            actualCompletionDate: formatDate(project.actual_completion_date),
            expectedSaving: project.expected_saving,
            actualSaving: project.actual_saving,
            uploadDate: formatDate(project.upload_date),
            createdDate: formatDate(project.created_date),
            lastUpdated: formatDate(project.last_updated),
            milestones: {
                define: formatDate(project.define_date),
                measure: formatDate(project.measure_date),
                analyze: formatDate(project.analyze_date),
                improve: formatDate(project.improve_date),
                control: formatDate(project.control_date)
            }
        }));
        
        res.json(formattedProjects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single project by ID
app.get('/api/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const projectQuery = `
            SELECT p.*, 
                   m.define_date, m.measure_date, m.analyze_date, 
                   m.improve_date, m.control_date
            FROM projects p 
            LEFT JOIN milestones m ON p.id = m.project_id 
            WHERE p.id = ?
        `;
        
        const result = await executeQuery(projectQuery, [projectId]);
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const project = result[0];
        const formattedProject = {
            id: project.id,
            projectName: project.project_name,
            region: project.region,
            unit: project.unit,
            projectLeader: project.project_leader,
            process: project.process,
            projectDescription: project.project_description,
            currentStatus: project.current_status,
            expectedBenefit: project.expected_benefit,
            capexNeeded: project.capex_needed,
            approvedCapexValue: project.approved_capex_value,
            keyMetric: project.key_metric,
            secondaryMetric: project.secondary_metric,
            businessCase: project.business_case,
            problemStatement: project.problem_statement,
            goalStatement: project.goal_statement,
            teamMembers: project.team_members,
            projectStartDate: formatDate(project.project_start_date),
            plannedCompletionDate: formatDate(project.planned_completion_date),
            actualCompletionDate: formatDate(project.actual_completion_date),
            expectedSaving: project.expected_saving,
            actualSaving: project.actual_saving,
            uploadDate: formatDate(project.upload_date),
            createdDate: formatDate(project.created_date),
            lastUpdated: formatDate(project.last_updated),
            milestones: {
                define: formatDate(project.define_date),
                measure: formatDate(project.measure_date),
                analyze: formatDate(project.analyze_date),
                improve: formatDate(project.improve_date),
                control: formatDate(project.control_date)
            }
        };
        
        res.json(formattedProject);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new project
app.post('/api/projects', async (req, res) => {
    try {
        const projectData = req.body;
        const projectId = await generateProjectId();
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Insert project
        const insertProjectQuery = `
            INSERT INTO projects (
                id, project_name, region, unit, project_leader, process, 
                project_description, current_status, expected_benefit, 
                capex_needed, approved_capex_value, key_metric, secondary_metric,
                business_case, problem_statement, goal_statement, team_members,
                project_start_date, planned_completion_date, actual_completion_date,
                expected_saving, actual_saving, upload_date, created_date, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const projectValues = [
            projectId,
            projectData.projectName || '',
            projectData.region || '',
            projectData.unit || '',
            projectData.projectLeader || '',
            projectData.process || '',
            projectData.projectDescription || '',
            projectData.currentStatus || '',
            projectData.expectedBenefit || '',
            projectData.capexNeeded || null,
            projectData.approvedCapexValue || null,
            projectData.keyMetric || '',
            projectData.secondaryMetric || '',
            projectData.businessCase || '',
            projectData.problemStatement || '',
            projectData.goalStatement || '',
            projectData.teamMembers || '',
            projectData.projectStartDate || null,
            projectData.plannedCompletionDate || null,
            projectData.actualCompletionDate || null,
            projectData.expectedSaving || null,
            projectData.actualSaving || null,
            projectData.uploadDate || currentDate,
            currentDate,
            currentDate
        ];
        
        await executeQuery(insertProjectQuery, projectValues);
        
        // Insert milestones if provided
        if (projectData.milestones) {
            const insertMilestonesQuery = `
                INSERT INTO milestones (
                    project_id, define_date, measure_date, analyze_date, 
                    improve_date, control_date
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const milestoneValues = [
                projectId,
                projectData.milestones.define || null,
                projectData.milestones.measure || null,
                projectData.milestones.analyze || null,
                projectData.milestones.improve || null,
                projectData.milestones.control || null
            ];
            
            await executeQuery(insertMilestonesQuery, milestoneValues);
        }
        
        res.json({ 
            success: true, 
            message: 'Project created successfully', 
            projectId: projectId 
        });
        
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const projectData = req.body;
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Update project
        const updateProjectQuery = `
            UPDATE projects SET 
                project_name = ?, region = ?, unit = ?, project_leader = ?, 
                process = ?, project_description = ?, current_status = ?, 
                expected_benefit = ?, capex_needed = ?, approved_capex_value = ?, 
                key_metric = ?, secondary_metric = ?, business_case = ?, 
                problem_statement = ?, goal_statement = ?, team_members = ?,
                project_start_date = ?, planned_completion_date = ?, 
                actual_completion_date = ?, expected_saving = ?, actual_saving = ?, 
                upload_date = ?, last_updated = ?
            WHERE id = ?
        `;
        
        const projectValues = [
            projectData.projectName || '',
            projectData.region || '',
            projectData.unit || '',
            projectData.projectLeader || '',
            projectData.process || '',
            projectData.projectDescription || '',
            projectData.currentStatus || '',
            projectData.expectedBenefit || '',
            projectData.capexNeeded || null,
            projectData.approvedCapexValue || null,
            projectData.keyMetric || '',
            projectData.secondaryMetric || '',
            projectData.businessCase || '',
            projectData.problemStatement || '',
            projectData.goalStatement || '',
            projectData.teamMembers || '',
            projectData.projectStartDate || null,
            projectData.plannedCompletionDate || null,
            projectData.actualCompletionDate || null,
            projectData.expectedSaving || null,
            projectData.actualSaving || null,
            projectData.uploadDate || currentDate,
            currentDate,
            projectId
        ];
        
        const projectResult = await executeQuery(updateProjectQuery, projectValues);
        
        if (projectResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Update milestones
        if (projectData.milestones) {
            // Check if milestones exist
            const existingMilestones = await executeQuery(
                'SELECT * FROM milestones WHERE project_id = ?',
                [projectId]
            );
            
            if (existingMilestones.length > 0) {
                // Update existing milestones
                const updateMilestonesQuery = `
                    UPDATE milestones SET 
                        define_date = ?, measure_date = ?, analyze_date = ?, 
                        improve_date = ?, control_date = ?
                    WHERE project_id = ?
                `;
                
                const milestoneValues = [
                    projectData.milestones.define || null,
                    projectData.milestones.measure || null,
                    projectData.milestones.analyze || null,
                    projectData.milestones.improve || null,
                    projectData.milestones.control || null,
                    projectId
                ];
                
                await executeQuery(updateMilestonesQuery, milestoneValues);
            } else {
                // Insert new milestones
                const insertMilestonesQuery = `
                    INSERT INTO milestones (
                        project_id, define_date, measure_date, analyze_date, 
                        improve_date, control_date
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                const milestoneValues = [
                    projectId,
                    projectData.milestones.define || null,
                    projectData.milestones.measure || null,
                    projectData.milestones.analyze || null,
                    projectData.milestones.improve || null,
                    projectData.milestones.control || null
                ];
                
                await executeQuery(insertMilestonesQuery, milestoneValues);
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Project updated successfully' 
        });
        
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        
        // Delete project (milestones will be deleted automatically due to foreign key constraint)
        const deleteProjectQuery = 'DELETE FROM projects WHERE id = ?';
        const result = await executeQuery(deleteProjectQuery, [projectId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Project deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search projects
app.get('/api/projects/search/:term', async (req, res) => {
    try {
        const searchTerm = `%${req.params.term}%`;
        const searchQuery = `
            SELECT p.*, 
                   m.define_date, m.measure_date, m.analyze_date, 
                   m.improve_date, m.control_date
            FROM projects p 
            LEFT JOIN milestones m ON p.id = m.project_id 
            WHERE p.id LIKE ? OR p.project_name LIKE ? OR p.region LIKE ? OR 
                  p.unit LIKE ? OR p.project_leader LIKE ? OR p.process LIKE ? OR
                  p.project_description LIKE ? OR p.current_status LIKE ?
            ORDER BY p.created_at DESC
        `;
        
        const projects = await executeQuery(searchQuery, [
            searchTerm, searchTerm, searchTerm, searchTerm, 
            searchTerm, searchTerm, searchTerm, searchTerm
        ]);
        
        // Format the response to match frontend expectations
        const formattedProjects = projects.map(project => ({
            id: project.id,
            projectName: project.project_name,
            region: project.region,
            unit: project.unit,
            projectLeader: project.project_leader,
            process: project.process,
            projectDescription: project.project_description,
            currentStatus: project.current_status,
            expectedBenefit: project.expected_benefit,
            capexNeeded: project.capex_needed,
            approvedCapexValue: project.approved_capex_value,
            keyMetric: project.key_metric,
            secondaryMetric: project.secondary_metric,
            businessCase: project.business_case,
            problemStatement: project.problem_statement,
            goalStatement: project.goal_statement,
            teamMembers: project.team_members,
            projectStartDate: formatDate(project.project_start_date),
            plannedCompletionDate: formatDate(project.planned_completion_date),
            actualCompletionDate: formatDate(project.actual_completion_date),
            expectedSaving: project.expected_saving,
            actualSaving: project.actual_saving,
            uploadDate: formatDate(project.upload_date),
            createdDate: formatDate(project.created_date),
            lastUpdated: formatDate(project.last_updated),
            milestones: {
                define: formatDate(project.define_date),
                measure: formatDate(project.measure_date),
                analyze: formatDate(project.analyze_date),
                improve: formatDate(project.improve_date),
                control: formatDate(project.control_date)
            }
        }));
        
        res.json(formattedProjects);
    } catch (error) {
        console.error('Error searching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files (HTML, CSS, JS)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'new_req.html'));
});

// Alternative route for new_req.html
app.get('/new_req.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'new_req.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`NPD Tracking System server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});