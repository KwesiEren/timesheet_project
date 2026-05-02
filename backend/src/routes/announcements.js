const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');
const NotificationService = require('../services/notificationService');

router.use(requireAuth);

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('announcements')
            .select('*')
            .eq('organization_id', req.orgId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Fetch Announcements Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create an announcement (Manager/Owner only)
router.post('/', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { id, title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const sb = adminClient;

        // 1. Create the Announcement record
        const { data: announcement, error: insErr } = await sb
            .from('announcements')
            .insert({
                id: id || `ann_${require('crypto').randomUUID()}`,
                organization_id: req.orgId,
                title,
                content,
                author_id: req.auth.userId
            })
            .select()
            .single();

        if (insErr) return res.status(500).json({ error: insErr.message });

        // 2. Notify all users in the organization (except author)
        const { data: users, error: userErr } = await sb
            .from('user_roles')
            .select('user_id')
            .eq('organization_id', req.orgId)
            .neq('user_id', req.auth.userId);
        
        if (userErr) {
            console.error('Fetch Users for Notification Error:', userErr.message);
        } else {
            const userIds = users.map(u => u.user_id);
            if (userIds.length > 0) {
                await NotificationService.notify({
                    userIds,
                    organizationId: req.orgId,
                    title: 'New Company Announcement',
                    message: title
                });
            }
        }

        return res.status(201).json(announcement);
    } catch (error) {
        console.error('Create Announcement Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
