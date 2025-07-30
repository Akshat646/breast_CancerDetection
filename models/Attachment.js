const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class Attachment {
    // Save attachment information to database
    static async create(projectId, fileInfo) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO attachments (
                    n_project_id, s_filename, s_original_name, s_file_path, 
                    s_file_type, n_file_size
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    projectId,
                    fileInfo.filename,
                    fileInfo.originalname,
                    fileInfo.path,
                    fileInfo.mimetype,
                    fileInfo.size
                ]
            );
            
            return result.insertId;
        } catch (error) {
            throw new Error(`Error saving attachment: ${error.message}`);
        }
    }
    
    // Get all attachments for a project
    static async getByProjectId(projectId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM attachments WHERE n_project_id = ? ORDER BY created_at DESC',
                [projectId]
            );
            
            return rows;
        } catch (error) {
            throw new Error(`Error fetching attachments: ${error.message}`);
        }
    }
    
    // Get attachment by ID
    static async getById(attachmentId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM attachments WHERE n_attachment_id = ?',
                [attachmentId]
            );
            
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Error fetching attachment: ${error.message}`);
        }
    }
    
    // Delete attachment
    static async delete(attachmentId) {
        try {
            // First get the file path
            const attachment = await this.getById(attachmentId);
            if (!attachment) {
                return false;
            }
            
            // Delete from database
            const [result] = await pool.execute(
                'DELETE FROM attachments WHERE n_attachment_id = ?',
                [attachmentId]
            );
            
            // Delete physical file
            if (result.affectedRows > 0) {
                try {
                    await fs.unlink(attachment.s_file_path);
                } catch (fileError) {
                    console.warn('Could not delete physical file:', fileError.message);
                    // Continue even if file deletion fails
                }
            }
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting attachment: ${error.message}`);
        }
    }
    
    // Delete all attachments for a project
    static async deleteByProjectId(projectId) {
        try {
            // Get all attachments for the project
            const attachments = await this.getByProjectId(projectId);
            
            // Delete database records
            const [result] = await pool.execute(
                'DELETE FROM attachments WHERE n_project_id = ?',
                [projectId]
            );
            
            // Delete physical files
            for (const attachment of attachments) {
                try {
                    await fs.unlink(attachment.s_file_path);
                } catch (fileError) {
                    console.warn('Could not delete physical file:', fileError.message);
                }
            }
            
            return result.affectedRows;
        } catch (error) {
            throw new Error(`Error deleting project attachments: ${error.message}`);
        }
    }
    
    // Get file stats and validation
    static async validateFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                exists: true,
                size: stats.size,
                modified: stats.mtime
            };
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }
    
    // Clean up orphaned files (files not in database)
    static async cleanupOrphanedFiles(uploadDir) {
        try {
            const files = await fs.readdir(uploadDir);
            const orphanedFiles = [];
            
            for (const file of files) {
                const filePath = path.join(uploadDir, file);
                const [rows] = await pool.execute(
                    'SELECT n_attachment_id FROM attachments WHERE s_filename = ?',
                    [file]
                );
                
                if (rows.length === 0) {
                    orphanedFiles.push(filePath);
                    try {
                        await fs.unlink(filePath);
                    } catch (error) {
                        console.warn('Could not delete orphaned file:', error.message);
                    }
                }
            }
            
            return orphanedFiles;
        } catch (error) {
            throw new Error(`Error cleaning up orphaned files: ${error.message}`);
        }
    }
}

module.exports = Attachment;