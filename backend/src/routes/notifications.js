const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { randomUUID } = require('crypto');

router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        return res.json(result.rows);
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
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
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
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
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
