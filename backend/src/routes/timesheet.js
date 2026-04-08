const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all timesheets for authenticated user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 ORDER BY start_time DESC',
            [req.user.id]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new timesheet entry
router.post('/', async (req, res) => {
    const { id, projectId, description, startTime } = req.body;

    if (!id || !projectId || !description || !startTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO timesheet_entries 
       (id, user_id, project_id, description, start_time) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [id, req.user.id, projectId, description, startTime]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Stop timer / Update end time and duration
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { endTime, totalDurationSeconds, description } = req.body;

    try {
        let query = 'UPDATE timesheet_entries SET ';
        const queryParams = [];
        let paramIndex = 1;

        if (endTime) {
            query += `end_time = $${paramIndex}, `;
            queryParams.push(endTime);
            paramIndex++;
        }

        if (totalDurationSeconds !== undefined) {
            query += `total_duration_seconds = $${paramIndex}, `;
            queryParams.push(totalDurationSeconds);
            paramIndex++;
        }

        if (description) {
            query += `description = $${paramIndex}, `;
            queryParams.push(description);
            paramIndex++;
        }

        if (queryParams.length === 0) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
        queryParams.push(id, req.user.id);

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timesheet entry not found' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete timesheet entry
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM timesheet_entries WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timesheet entry not found' });
        }
        return res.json({ message: 'Entry deleted successfully', id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
