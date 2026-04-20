const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

/**
 * Get employee daily logs (for the EmployeeDay model)
 * This aggregates arrival, departure, breaks, and activities for each day.
 */
router.get('/', async (req, res) => {
    try {
        // 1. Fetch daily logs (arrival/departure)
        const dailyLogsResult = await pool.query(
            'SELECT * FROM daily_logs WHERE user_id = $1 ORDER BY date DESC',
            [req.user.id]
        );

        // 2. Fetch all timesheet entries (activities)
        const activitiesResult = await pool.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 ORDER BY start_time DESC',
            [req.user.id]
        );

        // 3. Fetch all breaks
        const breaksResult = await pool.query(
            'SELECT * FROM breaks WHERE user_id = $1 ORDER BY start_time DESC',
            [req.user.id]
        );

        // Group everything by day
        const days = dailyLogsResult.rows.map(log => {
            const dateStr = new Date(log.date).toISOString().split('T')[0];
            
            const dayActivities = activitiesResult.rows.filter(a => 
                new Date(a.start_time).toISOString().split('T')[0] === dateStr
            );

            const dayBreaks = breaksResult.rows.filter(b => 
                new Date(b.start_time).toISOString().split('T')[0] === dateStr
            );

            return {
                arrivalTime: log.arrival_time,
                departureTime: log.departure_time,
                breaks: dayBreaks.map(b => ({
                    startTime: b.start_time,
                    endTime: b.end_time
                })),
                numberOfActivities: dayActivities.length,
                activities: dayActivities.map(a => ({
                    id: a.id,
                    title: a.title,
                    details: a.details,
                    notes: a.notes,
                    startTime: a.start_time,
                    endTime: a.end_time,
                    isCompleted: a.is_completed
                }))
            };
        });

        return res.json(days);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Check-in (Arrival)
router.post('/check-in', async (req, res) => {
    const { id, arrivalTime } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO daily_logs (id, user_id, date, arrival_time) 
             VALUES ($1, $2, CURRENT_DATE, $3) 
             ON CONFLICT (user_id, date) DO UPDATE SET arrival_time = EXCLUDED.arrival_time
             RETURNING *`,
            [id || `log_${require('crypto').randomUUID()}`, req.user.id, arrivalTime || new Date()]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Check-out (Departure)
router.post('/check-out', async (req, res) => {
    const { departureTime } = req.body;
    try {
        const result = await pool.query(
            `UPDATE daily_logs SET departure_time = $1 
             WHERE user_id = $2 AND date = CURRENT_DATE 
             RETURNING *`,
            [departureTime || new Date(), req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Daily log not found for today. Did you check in?' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
