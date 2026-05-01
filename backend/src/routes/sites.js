const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');
const { randomUUID } = require('crypto');

router.use(requireAuth);

// 1. Get all sites for the organization
router.get('/', async (req, res) => {
    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('sites')
            .select(`
                id, organization_id, project_id, name, 
                lat:latitude, lng:longitude, radius:radius_meters, 
                photo_required, is_active, created_at
            `)
            .eq('organization_id', req.orgId)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Fetch Sites Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Create a new site (Manager/Owner only)
router.post('/', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { name, projectId, lat, lng, radius, photo_required } = req.body;

    if (!name || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Missing required fields (name, lat, lng)' });
    }

    try {
        const sb = adminClient;
        const id = `site_${randomUUID()}`;
        const { data, error } = await sb
            .from('sites')
            .insert({
                id,
                organization_id: req.orgId,
                project_id: projectId || null,
                name,
                latitude: lat,
                longitude: lng,
                radius_meters: radius || 100,
                photo_required: photo_required || false
            })
            .select(`
                id, organization_id, project_id, name, 
                lat:latitude, lng:longitude, radius:radius_meters, 
                photo_required
            `)
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    } catch (error) {
        console.error('Create Site Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Update a site (Manager/Owner only)
router.put('/:id', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { name, projectId, lat, lng, radius, photo_required, isActive } = req.body;

    try {
        const sb = adminClient;
        const { data, error } = await sb
            .from('sites')
            .update({
                name,
                project_id: projectId,
                latitude: lat,
                longitude: lng,
                radius_meters: radius,
                photo_required: photo_required,
                is_active: isActive
            })
            .eq('id', id)
            .eq('organization_id', req.orgId)
            .select(`
                id, organization_id, project_id, name, 
                lat:latitude, lng:longitude, radius:radius_meters, 
                photo_required
            `)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Site not found' });
            return res.status(500).json({ error: error.message });
        }

        return res.json(data);
    } catch (error) {
        console.error('Update Site Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. Archive a site (Soft Delete)
router.delete('/:id', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    try {
        const sb = adminClient;
        const { data, error } = await sb
            .from('sites')
            .update({ is_active: false })
            .eq('id', id)
            .eq('organization_id', req.orgId)
            .select('id')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Site not found' });
            return res.status(500).json({ error: error.message });
        }
        return res.json({ message: 'Site archived successfully', id });
    } catch (error) {
        console.error('Delete Site Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
