const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Office documents are allowed!'));
        }
    }
});

// GET /api/projects - Get all projects with pagination and search
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        
        const result = await Project.getAll(page, limit, search);
        
        res.json({
            success: true,
            data: result.projects,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.getById(req.params.id);
        
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
            message: error.message
        });
    }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
    try {
        const projectData = req.body;
        
        // Process milestones if they exist
        if (req.body.milestone) {
            projectData.milestones = req.body.milestone;
        }
        
        const projectId = await Project.create(projectData);
        
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { id: projectId }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
    try {
        const projectData = req.body;
        
        // Process milestones if they exist
        if (req.body.milestone) {
            projectData.milestones = req.body.milestone;
        }
        
        const success = await Project.update(req.params.id, projectData);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
    try {
        const success = await Project.delete(req.params.id);
        
        if (!success) {
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
            message: error.message
        });
    }
});

// GET /api/projects/units/:region - Get units by region
router.get('/units/:region', async (req, res) => {
    try {
        const units = await Project.getUnitsByRegion(req.params.region);
        
        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// POST /api/projects/:id/upload - Upload files for project
router.post('/:id/upload', upload.array('s_attachment'), async (req, res) => {
    try {
        const projectId = req.params.id;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        
        const Attachment = require('../models/Attachment');
        const savedFiles = [];
        
        // Save each file to database
        for (const file of files) {
            try {
                const attachmentId = await Attachment.create(projectId, file);
                savedFiles.push({
                    id: attachmentId,
                    filename: file.filename,
                    originalname: file.originalname,
                    size: file.size,
                    type: file.mimetype
                });
            } catch (error) {
                console.error('Error saving file to database:', error);
                // Continue with other files even if one fails
            }
        }
        
        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
                files: savedFiles
            }
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/projects/:id/attachments - Get attachments for project
router.get('/:id/attachments', async (req, res) => {
    try {
        const Attachment = require('../models/Attachment');
        const attachments = await Attachment.getByProjectId(req.params.id);
        
        res.json({
            success: true,
            data: attachments
        });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/attachments/:id - Delete specific attachment
router.delete('/attachments/:id', async (req, res) => {
    try {
        const Attachment = require('../models/Attachment');
        const success = await Attachment.delete(req.params.id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Attachment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Attachment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/attachments/:id/download - Download attachment
router.get('/attachments/:id/download', async (req, res) => {
    try {
        const Attachment = require('../models/Attachment');
        const attachment = await Attachment.getById(req.params.id);
        
        if (!attachment) {
            return res.status(404).json({
                success: false,
                message: 'Attachment not found'
            });
        }
        
        // Validate file exists
        const validation = await Attachment.validateFile(attachment.s_file_path);
        if (!validation.exists) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }
        
        res.download(attachment.s_file_path, attachment.s_original_name);
    } catch (error) {
        console.error('Error downloading attachment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;