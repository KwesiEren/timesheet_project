const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { randomUUID } = require('crypto');

/**
 * GET /auth/me
 * Returns current user profile and organization details
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        const sb = adminClient; // Use adminClient to fetch combined profile/org data
        const { data, error } = await sb
            .from('users')
            .select('id, name, email, avatar_url, organization_id, organizations(name), user_roles(role)')
            .eq('id', req.auth.userId)
            .single();

        if (error) return res.status(500).json({ error: error.message });
        if (!data) return res.status(404).json({ error: 'User profile not found' });

        return res.json({
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatar_url,
            organizationId: data.organization_id,
            organizationName: data.organizations?.name,
            role: data.user_roles?.[0]?.role
        });
    } catch (error) {
        console.error('Fetch Me Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /auth/onboarding/create-org
 * Creates a new organization and assigns the current user as Owner.
 */
router.post('/onboarding/create-org', requireAuth, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Organization name is required' });

    try {
        const sb = adminClient;

        // 1. Create Organization
        const { data: org, error: orgErr } = await sb
            .from('organizations')
            .insert({ name })
            .select()
            .single();

        if (orgErr) return res.status(500).json({ error: orgErr.message });

        // 2. Link User to Organization and assign Owner role
        const { error: roleErr } = await sb
            .from('user_roles')
            .insert({
                user_id: req.auth.userId,
                organization_id: org.id,
                role: 'owner',
                is_default: true
            });

        if (roleErr) return res.status(500).json({ error: roleErr.message });

        // 3. Update User's profile organization_id (optional, depends on schema)
        await sb.from('users').update({ organization_id: org.id }).eq('id', req.auth.userId);

        return res.status(201).json({
            message: 'Organization created successfully',
            organization: org
        });
    } catch (error) {
        console.error('Onboarding Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Invitation Routes

/**
 * POST /auth/invite
 */
router.post('/invite', requireAuth, async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Email and role are required' });

    try {
        const sb = adminClient;
        const token = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data, error } = await sb
            .from('invites')
            .insert({
                organization_id: req.orgId,
                inviter_id: req.auth.userId,
                email,
                role,
                token,
                expires_at: expiresAt,
                status: 'pending'
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        return res.status(201).json({
            message: 'Invite generated successfully',
            invite: data,
            token
        });
    } catch (error) {
        console.error('Invite Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /auth/accept-invite
 */
router.post('/accept-invite', requireAuth, async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        const sb = adminClient;

        // 1. Verify invite
        const { data: invite, error: inviteErr } = await sb
            .from('invites')
            .select('*')
            .eq('token', token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteErr || !invite) return res.status(400).json({ error: 'Invalid or expired invite' });

        // 2. Link user to organization
        const { error: roleErr } = await sb
            .from('user_roles')
            .insert({
                user_id: req.auth.userId,
                organization_id: invite.organization_id,
                role: invite.role,
                is_default: true
            });

        if (roleErr) return res.status(500).json({ error: roleErr.message });

        // 3. Update invite status
        await sb.from('invites').update({ status: 'accepted' }).eq('id', invite.id);

        return res.json({ message: 'Invite accepted successfully' });
    } catch (error) {
        console.error('Accept Invite Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
