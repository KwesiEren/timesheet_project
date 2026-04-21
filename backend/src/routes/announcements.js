const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const { authorize } = require('../middleware/rbac');
const NotificationService = require('../services/notificationService');

router.use(authenticateToken);

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM announcements WHERE organization_id = $1 ORDER BY created_at DESC',
            [req.user.organizationId]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create an announcement (Manager/Owner only)
router.post('/', authorize(['Owner', 'Manager']), async (req, res) => {
    const { id, title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        // 1. Create the Announcement record
        const result = await pool.query(
            'INSERT INTO announcements (id, organization_id, title, content, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id || `ann_\${require('crypto').randomUUID()}`, req.user.organizationId, title, content, req.user.id]
        );
        const announcement = result.rows[0];

        // 2. Notify all employees in the organization
        const usersResult = await pool.query(
            'SELECT id FROM users WHERE organization_id = $1 AND id != $2',
            [req.user.organizationId, req.user.id]
        );
        
        const userIds = usersResult.rows.map(u => u.id);
        if (userIds.length > 0) {
            await NotificationService.notify({
                userIds,
                organizationId: req.user.organizationId,
                title: 'New Company Announcement',
                message: title // Use the announcement title as the notification message
            });
        }

        return res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
