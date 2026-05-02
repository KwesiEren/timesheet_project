const express = require('express');
const router = express.Router();
const { userClient, adminClient } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { requireOrgRole } = require('../middleware/rbac');
const PDFDocument = require('pdfkit'); 

router.use(requireAuth);

/**
 * Generate Payroll Report PDF
 * GET /reports/payroll?userId=...&startDate=...&endDate=...
 */
router.get('/payroll', requireOrgRole(['owner', 'manager']), async (req, res) => {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing userId, startDate, or endDate' });
    }

    try {
        const sb = adminClient;

        // 1. Fetch User and Organization Details
        const { data: userData, error: userErr } = await sb
            .from('profiles')
            .select('name, email, organizations(name)')
            .eq('id', userId)
            .single();

        if (userErr || !userData) return res.status(404).json({ error: 'User not found' });
        
        const userInfo = {
            name: userData.name,
            email: userData.email,
            org_name: userData.organizations?.name
        };

        // 2. Fetch Daily Logs
        const { data: logs, error: logsErr } = await sb
            .from('daily_logs')
            .select('date, status, arrival_time, departure_time')
            .eq('user_id', userId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (logsErr) throw logsErr;

        // 3. Fetch Activities for flagging and duration
        const { data: activities, error: actErr } = await sb
            .from('timesheet_entries')
            .select('title, start_time, end_time, total_duration_seconds, is_flagged')
            .eq('user_id', userId)
            .gte('start_time', `${startDate}T00:00:00Z`)
            .lte('start_time', `${endDate}T23:59:59Z`)
            .order('start_time', { ascending: true });

        if (actErr) throw actErr;

        // 4. Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payroll_${userId}_${startDate}.pdf`);
        
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Payroll Work Summary', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Organization: ${userInfo.org_name}`);
        doc.text(`Employee: ${userInfo.name} (${userInfo.email})`);
        doc.text(`Period: ${startDate} to ${endDate}`);
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Table Header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, doc.y, { continued: true, width: 80 });
        doc.text('Status', 130, doc.y, { continued: true, width: 80 });
        doc.text('Arrival', 210, doc.y, { continued: true, width: 80 });
        doc.text('Departure', 290, doc.y, { continued: true, width: 80 });
        doc.text('Total Hrs', 370, doc.y);
        doc.moveDown(0.5);
        doc.font('Helvetica');

        let totalSeconds = 0;

        // Daily Rows
        logs.forEach(log => {
            const dateStr = new Date(log.date).toLocaleDateString();
            const arrStr = log.arrival_time ? new Date(log.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            const depStr = log.departure_time ? new Date(log.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            
            const dayActivities = activities.filter(a => new Date(a.start_time).toISOString().split('T')[0] === log.date);
            const daySeconds = dayActivities.reduce((acc, curr) => acc + (curr.total_duration_seconds || 0), 0);
            totalSeconds += daySeconds;
            const hrs = (daySeconds / 3600).toFixed(2);

            doc.text(dateStr, 50, doc.y, { continued: true, width: 80 });
            doc.text(log.status, 130, doc.y, { continued: true, width: 80});
            doc.text(arrStr, 210, doc.y, { continued: true, width: 80});
            doc.text(depStr, 290, doc.y, { continued: true, width: 80});
            doc.text(hrs, 370, doc.y);
            doc.moveDown(0.3);
        });

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Summary
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(`Total Period Hours: ${(totalSeconds / 3600).toFixed(2)}`, { align: 'right' });
        
        const flaggedCount = activities.filter(a => a.is_flagged).length;
        if (flaggedCount > 0) {
            doc.moveDown();
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('red');
            doc.text(`* Note: ${flaggedCount} entry(s) have been flagged for manager corrections.`);
        }

        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to generate PDF' });
        }
    }
});

module.exports = router;
