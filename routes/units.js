const express = require('express');
const { executeQuery } = require('../config/database');

const router = express.Router();

// GET /api/units - Get all units
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM units ORDER BY region, unit_name';
        const units = await executeQuery(sql);
        
        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch units',
            error: error.message
        });
    }
});

// GET /api/units/by-region/:region - Get units by region
router.get('/by-region/:region', async (req, res) => {
    try {
        const { region } = req.params;
        
        if (!['AMESA', 'AMERICAS', 'EU', 'EAP'].includes(region)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid region'
            });
        }
        
        const sql = 'SELECT * FROM units WHERE region = ? ORDER BY unit_name';
        const units = await executeQuery(sql, [region]);
        
        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        console.error('Error fetching units by region:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch units by region',
            error: error.message
        });
    }
});

// GET /api/units/regions - Get all available regions
router.get('/regions', async (req, res) => {
    try {
        const sql = 'SELECT DISTINCT region FROM units ORDER BY region';
        const regions = await executeQuery(sql);
        
        res.json({
            success: true,
            data: regions.map(r => r.region)
        });
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch regions',
            error: error.message
        });
    }
});

module.exports = router;