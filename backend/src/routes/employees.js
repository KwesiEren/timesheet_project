const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(authenticateToken);

/**
 * Get employee daily logs (for the EmployeeDay model)
 * This aggregates arrival, departure, breaks, and activities for each day.
 */
router.get('/', async (req, res) => {
    try {
        // 1. Fetch daily logs (arrival/departure)
        const dailyLogsResult = await pool.query(
            'SELECT * FROM daily_logs WHERE user_id = $1 AND organization_id = $2 ORDER BY date DESC',
            [req.user.id, req.user.organizationId]
        );

        // 2. Fetch all timesheet entries (activities)
        const activitiesResult = await pool.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 AND organization_id = $2 ORDER BY start_time DESC',
            [req.user.id, req.user.organizationId]
        );

        // 3. Fetch all breaks
        const breaksResult = await pool.query(
            'SELECT * FROM breaks WHERE user_id = $1 AND organization_id = $2 ORDER BY start_time DESC',
            [req.user.id, req.user.organizationId]
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
                id: log.id,
                date: dateStr,
                status: log.status,
                approvedBy: log.approved_by,
                approvedAt: log.approved_at,
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
                    isCompleted: a.is_completed,
                    isFlagged: a.is_flagged,
                    originalData: a.original_data
                }))
            };
        });

        return res.json(days);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Haversine Formula for distance calculation
 * @returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dPhi = (lat2 - lat1) * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Check-in (Arrival)
router.post('/check-in', async (req, res) => {
    const { id, arrivalTime, lat, lng, siteId, photoUrl } = req.body;
    
    try {
        let isWithinGeofence = null;
        
        // 1. If siteId is provided, validate geofence
        if (siteId && lat && lng) {
            const siteResult = await pool.query('SELECT * FROM sites WHERE id = $1', [siteId]);
            if (siteResult.rows.length > 0) {
                const site = siteResult.rows[0];
                
                // Photo requirement check
                if (site.photo_required && !photoUrl) {
                    return res.status(400).json({ error: 'Photo proof is required for this site' });
                }

                const distance = calculateDistance(lat, lng, site.latitude, site.longitude);
                isWithinGeofence = distance <= site.radius_meters;
            }
        }

        const result = await pool.query(
            `INSERT INTO daily_logs (id, user_id, organization_id, date, arrival_time, site_id, check_in_lat, check_in_lng, check_in_photo_url, is_within_geofence) 
             VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9) 
             ON CONFLICT (user_id, date) DO UPDATE SET 
                arrival_time = EXCLUDED.arrival_time, 
                site_id = EXCLUDED.site_id,
                check_in_lat = EXCLUDED.check_in_lat,
                check_in_lng = EXCLUDED.check_in_lng,
                check_in_photo_url = EXCLUDED.check_in_photo_url,
                is_within_geofence = EXCLUDED.is_within_geofence
             RETURNING *`,
            [
                id || `log_${require('crypto').randomUUID()}`, 
                req.user.id, 
                req.user.organizationId, 
                arrivalTime || new Date(),
                siteId || null,
                lat || null,
                lng || null,
                photoUrl || null,
                isWithinGeofence
            ]
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
             WHERE user_id = $2 AND organization_id = $3 AND date = CURRENT_DATE 
             RETURNING *`,
            [departureTime || new Date(), req.user.id, req.user.organizationId]
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

// --- Managerial Routes ---

// Bulk Approve Logs
router.post('/approve', authorize(['Owner', 'Manager']), async (req, res) => {
    const { ids, userId, startDate, endDate } = req.body;

    if (!ids && (!userId || !startDate || !endDate)) {
        return res.status(400).json({ error: 'Provide ids[] OR userId + startDate + endDate' });
    }

    try {
        let query;
        let params;

        if (ids && ids.length > 0) {
            query = `
                UPDATE daily_logs 
                SET status = 'approved', approved_by = $1, approved_at = NOW() 
                WHERE id = ANY($2) AND organization_id = $3
                RETURNING id`;
            params = [req.user.id, ids, req.user.organizationId];
        } else {
            query = `
                UPDATE daily_logs 
                SET status = 'approved', approved_by = $1, approved_at = NOW() 
                WHERE user_id = $2 AND date BETWEEN $3 AND $4 AND organization_id = $5
                RETURNING id`;
            params = [req.user.id, userId, startDate, endDate, req.user.organizationId];
        }

        const result = await pool.query(query, params);
        return res.json({ 
            message: `Successfully approved \${result.rows.length} logs`,
            approvedIds: result.rows.map(r => r.id)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Log Status (Manual Late/Absent marking)
router.patch('/status/:id', authorize(['Owner', 'Manager']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'present', 'late', 'absent'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            `UPDATE daily_logs 
             SET status = $1 
             WHERE id = $2 AND organization_id = $3 
             RETURNING *`,
            [status, id, req.user.organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Log not found' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
