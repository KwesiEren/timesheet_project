const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Get all timesheets for authenticated user
router.get('/', async (req, res) => {
    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('timesheet_entries')
            .select('*')
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId)
            .order('start_time', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Fetch Timesheets Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new timesheet entry (Activity)
router.post('/', async (req, res) => {
    const { id, projectId, title, details, notes, startTime, isCompleted } = req.body;

    if (!id || !startTime) {
        return res.status(400).json({ error: 'Missing required fields (id, startTime)' });
    }

    try {
        const sb = userClient(req.auth.token);
        const { data, error } = await sb
            .from('timesheet_entries')
            .insert({
                id,
                user_id: req.auth.userId,
                organization_id: req.orgId,
                project_id: projectId || null,
                title: title || req.body.description || null,
                details: details || null,
                notes: notes || null,
                start_time: startTime,
                is_completed: isCompleted || false
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    } catch (error) {
        console.error('Create Timesheet Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update timesheet entry / Stop timer
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { endTime, totalDurationSeconds, title, details, notes, isCompleted } = req.body;

    try {
        const sb = adminClient; // Use admin client to handle potential cross-user edits by managers

        // 1. Fetch current entry
        const { data: currentEntry, error: fetchErr } = await sb
            .from('timesheet_entries')
            .select('*')
            .eq('id', id)
            .eq('organization_id', req.orgId)
            .single();

        if (fetchErr) {
            if (fetchErr.code === 'PGRST116') return res.status(404).json({ error: 'Timesheet entry not found' });
            return res.status(500).json({ error: fetchErr.message });
        }

        const isManagerEditing = currentEntry.user_id !== req.auth.userId;
        const updateData = {};

        if (endTime) updateData.end_time = endTime;
        if (totalDurationSeconds !== undefined) updateData.total_duration_seconds = totalDurationSeconds;
        if (title) updateData.title = title;
        if (details) updateData.details = details;
        if (notes) updateData.notes = notes;
        if (isCompleted !== undefined) updateData.is_completed = isCompleted;

        // Audit Trail Logic for Manager Edits
        if (isManagerEditing) {
            updateData.is_flagged = true;
            updateData.last_edited_by = req.auth.userId;

            // Only snapshot original_data if it hasn't been done yet
            if (!currentEntry.original_data) {
                updateData.original_data = {
                    title: currentEntry.title,
                    details: currentEntry.details,
                    notes: currentEntry.notes,
                    start_time: currentEntry.start_time,
                    end_time: currentEntry.end_time,
                    total_duration_seconds: currentEntry.total_duration_seconds
                };
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }

        const { data, error } = await sb
            .from('timesheet_entries')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', req.orgId)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (error) {
        console.error('Update Timesheet Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete timesheet entry
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sb = userClient(req.auth.token);
        const { error } = await sb
            .from('timesheet_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', req.auth.userId)
            .eq('organization_id', req.orgId);

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ message: 'Entry deleted successfully', id });
    } catch (error) {
        console.error('Delete Timesheet Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
