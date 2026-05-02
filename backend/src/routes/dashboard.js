const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');

router.use(requireAuth);

/**
 * GET /dashboard/kpis
 * Returns Today's KPIs for the organization dashboard.
 */
router.get('/kpis', requireOrgRole(['owner', 'manager']), async (req, res) => {
    try {
        const sb = adminClient;
        
        // We use a custom RPC function for efficient aggregation
        const { data, error } = await sb.rpc('get_org_dashboard_stats', { 
            _org_id: req.orgId 
        });

        if (error) {
            console.error('KPI RPC Error:', error.message);
            // Fallback to manual counts if RPC is missing or fails
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Dashboard KPIs Error:', err);
        res.status(500).json({ error: 'Failed to aggregate dashboard KPIs' });
    }
});

/**
 * GET /dashboard/employees
 * Returns a real-time list of all employees and their current status.
 */
router.get('/employees', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    try {
        const sb = adminClient;

        // Fetch employees and their current day's log
        const { data, error } = await sb
            .from('user_roles')
            .select(`
                user_id,
                profiles (
                    id,
                    name,
                    email
                ),
                daily_logs (
                    status,
                    arrival_time,
                    departure_time,
                    site_id,
                    sites (
                        name
                    )
                )
            `)
            .eq('organization_id', req.orgId)
            .eq('role', 'employee')
            .eq('daily_logs.date', today);

        if (error) return res.status(500).json({ error: error.message });

        const mapped = data.map(row => {
            const profile = row.profiles;
            const log = row.daily_logs?.[0] || null;

            let displayStatus = 'clocked_out';
            if (log) {
                if (log.status === 'present' || log.status === 'late') {
                    displayStatus = 'clocked_in';
                } else if (log.status === 'approved') {
                    displayStatus = 'approved';
                } else if (log.status === 'absent') {
                    displayStatus = 'absent';
                }
            }

            return {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                status: displayStatus,
                clocked_in_at: log?.arrival_time || null,
                current_site_id: log?.site_id || null,
                site_name: log?.sites?.name || null
            };
        });

        res.json(mapped);
    } catch (err) {
        console.error('Dashboard Employees Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard employee list' });
    }
});

module.exports = router;
