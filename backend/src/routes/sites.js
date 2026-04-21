const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { randomUUID } = require('crypto');

router.use(authenticateToken);

// 1. Get all sites for the organization
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM sites WHERE organization_id = $1 AND is_active = true ORDER BY name ASC',
            [req.user.organizationId]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Create a new site (Manager/Owner only)
router.post('/', authorize(['Owner', 'Manager']), async (req, res) => {
    const { name, projectId, latitude, longitude, radiusMeters, photoRequired } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required fields (name, latitude, longitude)' });
    }

    try {
        const id = `site_\${randomUUID()}`;
        const result = await pool.query(
            `INSERT INTO sites (id, organization_id, project_id, name, latitude, longitude, radius_meters, photo_required)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                id, 
                req.user.organizationId, 
                projectId || null, 
                name, 
                latitude, 
                longitude, 
                radiusMeters || 100, 
                photoRequired || false
            ]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Update a site (Manager/Owner only)
router.put('/:id', authorize(['Owner', 'Manager']), async (req, res) => {
    const { id } = req.params;
    const { name, projectId, latitude, longitude, radiusMeters, photoRequired, isActive } = req.body;

    try {
        const result = await pool.query(
            `UPDATE sites 
             SET name = COALESCE($1, name),
                 project_id = COALESCE($2, project_id),
                 latitude = COALESCE($3, latitude),
                 longitude = COALESCE($4, longitude),
                 radius_meters = COALESCE($5, radius_meters),
                 photo_required = COALESCE($6, photo_required),
                 is_active = COALESCE($7, is_active)
             WHERE id = $8 AND organization_id = $9
             RETURNING *`,
            [name, projectId, latitude, longitude, radiusMeters, photoRequired, isActive, id, req.user.organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Archive a site (Soft Delete)
router.delete('/:id', authorize(['Owner', 'Manager']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE sites SET is_active = false WHERE id = $1 AND organization_id = $2 RETURNING id',
            [id, req.user.organizationId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }
        return res.json({ message: 'Site archived successfully', id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
