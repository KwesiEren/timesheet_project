const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');
const NotificationService = require('../services/notificationService');

router.use(requireAuth);

// Get all notifications for the authenticated user
router.get('/', async (req, res) => {
    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('notifications')
            .select('*')
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// TRIGGER: Missing Logs Notification (Manager only)
router.post('/missing-logs', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        const sb = adminClient;

        // 1. Find employees who DON'T have a daily_log for the target date
        // This is a complex query, we can use a subquery or RPC.
        // For now, let's use a two-step approach or a raw filter if possible.
        
        // Better: Fetch all employees and all logs for today, then diff in JS
        const { data: employees, error: e1 } = await sb
            .from('user_roles')
            .select('user_id, profiles(name)')
            .eq('organization_id', req.orgId)
            .eq('role', 'employee');

        if (e1) return res.status(500).json({ error: e1.message });

        const { data: logs, error: e2 } = await sb
            .from('daily_logs')
            .select('user_id')
            .eq('organization_id', req.orgId)
            .eq('date', targetDate);

        if (e2) return res.status(500).json({ error: e2.message });

        const loggedUserIds = new Set(logs.map(l => l.user_id));
        const missingUserIds = employees
            .filter(e => !loggedUserIds.has(e.user_id))
            .map(e => e.user_id);

        if (missingUserIds.length > 0) {
            await NotificationService.notify({
                userIds: missingUserIds,
                organizationId: req.orgId,
                title: 'Missing Timesheet Log',
                message: `You forgot to log your attendance for ${targetDate}. Please update it now.`,
            });
        }

        return res.json({ 
            message: `Scanned for missing logs. Notified ${missingUserIds.length} employees.`,
            notifiedUserIds: missingUserIds
        });
    } catch (error) {
        console.error('Missing Logs Notification Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Notification not found' });
            return res.status(500).json({ error: error.message });
        }
        return res.json(data);
    } catch (error) {
        console.error('Mark Read Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sb = userClient(req.auth.token);
        const { error } = await sb
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId);

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ message: 'Notification deleted', id });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
