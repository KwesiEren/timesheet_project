const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
// Expecting 'npm install pdfkit'
const PDFDocument = require('pdfkit'); 

router.use(authenticateToken);

/**
 * Generate Payroll Report PDF
 * GET /reports/payroll?userId=...&startDate=...&endDate=...
 */
router.get('/payroll', authorize(['Owner', 'Manager']), async (req, res) => {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing userId, startDate, or endDate' });
    }

    try {
        // 1. Fetch User and Organization Details
        const userResult = await pool.query('SELECT u.name, u.email, o.name as org_name FROM users u JOIN organizations o ON u.organization_id = o.id WHERE u.id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const userInfo = userResult.rows[0];

        // 2. Fetch Timesheet and Break Data
        const logsResult = await pool.query(
            `SELECT date, status, arrival_time, departure_time 
             FROM daily_logs 
             WHERE user_id = $1 AND date BETWEEN $2 AND $3 
             ORDER BY date ASC`,
            [userId, startDate, endDate]
        );

        const activitiesResult = await pool.query(
            `SELECT title, start_time, end_time, total_duration_seconds, is_flagged 
             FROM timesheet_entries 
             WHERE user_id = $1 AND start_time::date BETWEEN $2 AND $3 
             ORDER BY start_time ASC`,
            [userId, startDate, endDate]
        );

        // 3. Create PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=payroll_\${userId}_\${startDate}.pdf`);
        
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Payroll Work Summary', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Organization: \${userInfo.org_name}`);
        doc.text(`Employee: \${userInfo.name} (\${userInfo.email})`);
        doc.text(`Period: \${startDate} to \${endDate}`);
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
        logsResult.rows.forEach(log => {
            const dateStr = new Date(log.date).toLocaleDateString();
            const arrStr = log.arrival_time ? new Date(log.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            const depStr = log.departure_time ? new Date(log.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            
            // Calculate Day Total (Simplified for report)
            const dayActivities = activitiesResult.rows.filter(a => new Date(a.start_time).toISOString().split('T')[0] === new Date(log.date).toISOString().split('T')[0]);
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
        doc.text(`Total Period Hours: \${(totalSeconds / 3600).toFixed(2)}`, { align: 'right' });
        
        // Audit Notes
        const flaggedCount = activitiesResult.rows.filter(a => a.is_flagged).length;
        if (flaggedCount > 0) {
            doc.moveDown();
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('red');
            doc.text(`* Note: \${flaggedCount} entry(s) have been flagged for manager corrections.`);
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
