const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM announcements ORDER BY created_at DESC'
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create an announcement (Admin only - though we don't have roles implemented yet, 
// we'll just allow any authenticated user for now or keep it for future expansion)
router.post('/', async (req, res) => {
    const { id, title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO announcements (id, title, content, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [id || `ann_${require('crypto').randomUUID()}`, title, content, req.user.id]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
