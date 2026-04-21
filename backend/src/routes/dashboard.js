const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

/**
 * GET /dashboard/kpis
 * Returns Today's KPIs and Monthly Trends for the organization dashboard.
 */
router.get('/kpis', authenticateToken, authorize(['Owner', 'Manager']), async (req, res) => {
    const { organization_id } = req.user;
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    try {
        // 1. Total Employees in Org
        const totalEmployeesRes = await pool.query(
            'SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role = $2',
            [organization_id, 'Employee']
        );

        // 2. Clocked In Today
        const clockedInTodayRes = await pool.query(
            'SELECT COUNT(*) FROM daily_logs WHERE organization_id = $1 AND date = $2 AND arrival_time IS NOT NULL AND status != $3',
            [organization_id, today, 'Absent']
        );

        // 3. Late Flags Today
        const lateTodayRes = await pool.query(
            'SELECT COUNT(*) FROM daily_logs WHERE organization_id = $1 AND date = $2 AND status = $3',
            [organization_id, today, 'Late']
        );

        // 4. Monthly Trend Data (Last 30 Days)
        const monthlyTrendRes = await pool.query(
            `SELECT date, COUNT(*) as count 
             FROM daily_logs 
             WHERE organization_id = $1 AND date >= $2 
             GROUP BY date ORDER BY date ASC`,
            [organization_id, firstDayOfMonth]
        );

        res.json({
            today: {
                totalEmployees: parseInt(totalEmployeesRes.rows[0].count),
                clockedIn: parseInt(clockedInTodayRes.rows[0].count),
                late: parseInt(lateTodayRes.rows[0].count),
                presentPercentage: totalEmployeesRes.rows[0].count > 0 
                    ? Math.round((clockedInTodayRes.rows[0].count / totalEmployeesRes.rows[0].count) * 100) 
                    : 0
            },
            monthlyTrend: monthlyTrendRes.rows.map(row => ({
                date: row.date.toISOString().split('T')[0],
                count: parseInt(row.count)
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to aggregate dashboard KPIs' });
    }
});

/**
 * GET /dashboard/employees
 * Returns a real-time list of all employees and their current status.
 */
router.get('/employees', authenticateToken, authorize(['Owner', 'Manager']), async (req, res) => {
    const { organization_id } = req.user;
    const today = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, 
                    dl.status as current_status, 
                    dl.arrival_time, dl.departure_time,
                    s.name as current_site
             FROM users u
             LEFT JOIN daily_logs dl ON u.id = dl.user_id AND dl.date = $1
             LEFT JOIN sites s ON dl.site_id = s.id
             WHERE u.organization_id = $2 AND u.role = $3
             ORDER BY u.name ASC`,
            [today, organization_id, 'Employee']
        );

        res.json(result.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            status: row.current_status || 'Offline',
            arrivalTime: row.arrival_time,
            departureTime: row.departure_time,
            site: row.current_site || 'N/A'
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard employee list' });
    }
});

module.exports = router;
