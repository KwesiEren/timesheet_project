const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');

router.use(requireAuth);

/**
 * Get employee daily logs (for the EmployeeDay model)
 * This aggregates arrival, departure, breaks, and activities for each day.
 */
router.get('/', async (req, res) => {
    try {
        const sb = userClient(req.auth.token);

        // 1. Fetch daily logs
        const { data: logs, error: e1 } = await sb
            .from('daily_logs')
            .select('*')
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .order('date', { ascending: false });

        if (e1) return res.status(500).json({ error: e1.message });

        // 2. Fetch all activities
        const { data: activities, error: e2 } = await sb
            .from('timesheet_entries')
            .select('*')
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .order('start_time', { ascending: false });

        if (e2) return res.status(500).json({ error: e2.message });

        // 3. Fetch all breaks
        const { data: breaks, error: e3 } = await sb
            .from('breaks')
            .select('*')
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .order('start_time', { ascending: false });

        if (e3) return res.status(500).json({ error: e3.message });

        // Group everything by day
        const days = logs.map(log => {
            const dateStr = log.date;
            
            const dayActivities = activities.filter(a => 
                new Date(a.start_time).toISOString().split('T')[0] === dateStr
            );

            const dayBreaks = breaks.filter(b => 
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
        console.error('Fetch Logs Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper for geofence check
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
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
    const sb = userClient(req.auth.token);
    
    try {
        let isWithinGeofence = null;
        
        if (siteId && lat && lng) {
            const { data: site, error: siteErr } = await sb
                .from('sites')
                .select('*')
                .eq('id', siteId)
                .single();

            if (siteErr) return res.status(500).json({ error: siteErr.message });
            if (site) {
                if (site.photo_required && !photoUrl) {
                    return res.status(400).json({ error: 'Photo proof is required for this site' });
                }
                const distance = calculateDistance(lat, lng, site.latitude, site.longitude);
                isWithinGeofence = distance <= site.radius_meters;
            }
        }

        const { data, error } = await sb
            .from('daily_logs')
            .upsert({
                id: id || `log_${require('crypto').randomUUID()}`,
                user_id: req.auth.userId,
                organization_id: req.orgId,
                date: new Date().toISOString().split('T')[0],
                arrival_time: arrivalTime || new Date(),
                site_id: siteId || null,
                check_in_lat: lat || null,
                check_in_lng: lng || null,
                check_in_photo_url: photoUrl || null,
                is_within_geofence: isWithinGeofence
            }, { onConflict: 'user_id, date' })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    } catch (error) {
        console.error('Check-in Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Check-out (Departure)
router.post('/check-out', async (req, res) => {
    const { departureTime } = req.body;
    const sb = userClient(req.auth.token);
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await sb
            .from('daily_logs')
            .update({ departure_time: departureTime || new Date() })
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .eq('date', today)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Daily log not found for today' });
            return res.status(500).json({ error: error.message });
        }
        return res.json(data);
    } catch (error) {
        console.error('Check-out Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Managerial Routes ---

/**
 * GET /employees/history
 */
router.get('/history', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { from, to, site_id, status } = req.query;
    const sb = userClient(req.auth.token);

    try {
        let query = sb
            .from('daily_logs')
            .select(`
                *,
                profiles ( name ),
                sites ( name )
            `)
            .eq('organization_id', req.orgId);

        if (from) query = query.gte('date', from);
        if (to) query = query.lte('date', to);
        if (site_id) query = query.eq('site_id', site_id);
        if (status) query = query.eq('status', status);

        const { data, error } = await query.order('date', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        
        const mappedRows = data.map(row => ({
            ...row,
            employee_name: row.profiles?.name,
            site_name: row.sites?.name,
            clock_in: row.arrival_time,
            clock_out: row.departure_time,
            status: row.status ? row.status.toLowerCase() : 'pending',
            geofence_violation: row.is_within_geofence === false
        }));

        res.json(mappedRows);
    } catch (err) {
        console.error('History Fetch Error:', err);
        res.status(500).json({ error: 'Failed to fetch log history' });
    }
});

/**
 * POST /employees/approve
 */
router.post('/approve', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { ids } = req.body;
    const sb = adminClient; // Use adminClient for bulk updates to ensure override if needed

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No IDs provided' });
    }

    try {
        const { data, error, count } = await sb
            .from('daily_logs')
            .update({
                status: 'approved',
                approved_by: req.auth.userId,
                approved_at: new Date(),
            })
            .in('id', ids)
            .eq('organization_id', req.orgId)
            .select('id');

        if (error) return res.status(500).json({ error: error.message });

        res.json({ 
            success: true, 
            message: `Successfully approved ${data.length} logs`,
            updatedCount: data.length 
        });
    } catch (err) {
        console.error('Bulk Approve Error:', err);
        res.status(500).json({ error: 'Failed to bulk approve logs' });
    }
});

/**
 * PATCH /employees/status/:id
 */
router.patch('/status/:id', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sb = adminClient;

    try {
        const { data, error } = await sb
            .from('daily_logs')
            .update({ status })
            .eq('id', id)
            .eq('organization_id', req.orgId)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Status Update Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
