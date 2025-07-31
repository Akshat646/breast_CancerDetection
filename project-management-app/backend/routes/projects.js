const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.getAll();
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
});

// GET /api/projects/search?q=term - Search projects
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    const projects = await Project.search(q);
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching projects',
      error: error.message
    });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.getById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Basic validation
    if (!projectData.s_project_name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }
    
    const newProject = await Project.create(projectData);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;
    
    // Check if project exists
    const existingProject = await Project.getById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const updated = await Project.update(id, projectData);
    
    if (updated) {
      const updatedProject = await Project.getById(id);
      res.json({
        success: true,
        message: 'Project updated successfully',
        data: updatedProject
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update project'
      });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const existingProject = await Project.getById(id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const deleted = await Project.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete project'
      });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
});

module.exports = router;