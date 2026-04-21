const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { randomUUID } = require('crypto');

const { authorize } = require('../middleware/rbac');
const NotificationService = require('../services/notificationService');

router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 AND organization_id = $2 ORDER BY created_at DESC',
            [req.user.id, req.user.organizationId]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// TRIGGER: Missing Logs Notification (Manager only)
router.post('/missing-logs', authorize(['Owner', 'Manager']), async (req, res) => {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        // Find employees in this org who DON'T have a daily_log for the target date
        const query = `
            SELECT u.id, u.name 
            FROM users u
            LEFT JOIN daily_logs dl ON u.id = dl.user_id AND dl.date = $1
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.organization_id = $2 
              AND r.name = 'Employee'
              AND dl.id IS NULL
        `;
        
        const result = await pool.query(query, [targetDate, req.user.organizationId]);
        const userIds = result.rows.map(u => u.id);

        if (userIds.length > 0) {
            await NotificationService.notify({
                userIds,
                organizationId: req.user.organizationId,
                title: 'Missing Timesheet Log',
                message: `You forgot to log your attendance for \${targetDate}. Please update it now.`
            });
        }

        return res.json({ 
            message: `Scanned for missing logs. Notified \${userIds.length} employees.`,
            notifiedUserIds: userIds
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 AND organization_id = $3 RETURNING *',
            [id, req.user.id, req.user.organizationId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 AND organization_id = $3 RETURNING id',
            [id, req.user.id, req.user.organizationId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        return res.json({ message: 'Notification deleted', id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
