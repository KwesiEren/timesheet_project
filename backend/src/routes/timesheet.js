const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all timesheets for authenticated user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 AND organization_id = $2 ORDER BY start_time DESC',
            [req.user.id, req.user.organizationId]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new timesheet entry (Activity)
router.post('/', async (req, res) => {
    const { id, projectId, title, details, notes, startTime, isCompleted } = req.body;

    // Use title as fallback for description logic if needed, but schema now has title
    if (!id || !startTime) {
        return res.status(400).json({ error: 'Missing required fields (id, startTime)' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO timesheet_entries 
       (id, user_id, organization_id, project_id, title, details, notes, start_time, is_completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
            [id, req.user.id, req.user.organizationId, projectId || null, title || req.body.description || null, details || null, notes || null, startTime, isCompleted || false]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update timesheet entry / Stop timer
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { endTime, totalDurationSeconds, title, details, notes, isCompleted } = req.body;

    try {
        // Fetch current entry to check ownership and for audit trail
        const currentResult = await pool.query(
            'SELECT * FROM timesheet_entries WHERE id = $1 AND organization_id = $2',
            [id, req.user.organizationId]
        );

        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Timesheet entry not found' });
        }

        const currentEntry = currentResult.rows[0];
        const isManagerEditing = currentEntry.user_id !== req.user.id;

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

        if (title) {
            query += `title = $${paramIndex}, `;
            queryParams.push(title);
            paramIndex++;
        }

        if (details) {
            query += `details = $${paramIndex}, `;
            queryParams.push(details);
            paramIndex++;
        }

        if (notes) {
            query += `notes = $${paramIndex}, `;
            queryParams.push(notes);
            paramIndex++;
        }

        if (isCompleted !== undefined) {
            query += `is_completed = $${paramIndex}, `;
            queryParams.push(isCompleted);
            paramIndex++;
        }

        // Audit Trail Logic for Manager Edits
        if (isManagerEditing) {
            query += `is_flagged = true, last_edited_by = $${paramIndex}, `;
            queryParams.push(req.user.id);
            paramIndex++;

            // Only snapshot original_data if it hasn't been done yet
            if (!currentEntry.original_data) {
                const originalData = {
                    title: currentEntry.title,
                    details: currentEntry.details,
                    notes: currentEntry.notes,
                    start_time: currentEntry.start_time,
                    end_time: currentEntry.end_time,
                    total_duration_seconds: currentEntry.total_duration_seconds
                };
                query += `original_data = $${paramIndex}, `;
                queryParams.push(JSON.stringify(originalData));
                paramIndex++;
            }
        }

        if (queryParams.length === 0) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }

        query = query.slice(0, -2);
        query += ` WHERE id = $${paramIndex} AND organization_id = $${paramIndex + 1} RETURNING *`;
        queryParams.push(id, req.user.organizationId);

        const result = await pool.query(query, queryParams);

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
            'DELETE FROM timesheet_entries WHERE id = $1 AND user_id = $2 AND organization_id = $3 RETURNING id',
            [id, req.user.id, req.user.organizationId]
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
