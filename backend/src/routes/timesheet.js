const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all timesheets for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 ORDER BY start_time DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new timesheet entry
router.post('/', async (req, res) => {
    const { id, userId, projectId, description, startTime } = req.body;

    if (!id || !userId || !projectId || !description || !startTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO timesheet_entries 
       (id, user_id, project_id, description, start_time) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [id, userId, projectId, description, startTime]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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

        // Remove trailing comma and space
        query = query.slice(0, -2);
        query += ` WHERE id = $${paramIndex} RETURNING *`;
        queryParams.push(id);

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timesheet entry not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete timesheet entry
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM timesheet_entries WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Timesheet entry not found' });
        }
        res.json({ message: 'Entry deleted successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
