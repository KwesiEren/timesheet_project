const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheet');
const notificationRoutes = require('./routes/notifications');
const announcementRoutes = require('./routes/announcements');
const employeeRoutes = require('./routes/employees');
const sitesRoutes = require('./routes/sites');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3000;

const requiredEnvVars = [
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY', 
    'SUPABASE_JWT_SECRET'
];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
    console.warn(`⚠️  Missing Supabase environment variables: ${missingEnvVars.join(', ')}`);
    console.warn(`The API may fail to authenticate users or access the database.`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// Serve Web Portal (Vite Build)
const portalPath = path.join(__dirname, '../public/worktivo-manager-hub/dist');
app.use('/app/assets', express.static(path.join(portalPath, 'assets'), { fallthrough: false }));
app.use('/app', express.static(portalPath));

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/timesheets', timesheetRoutes);
app.use('/activities', timesheetRoutes); // Alias for Flutter APIServices
app.use('/notifications', notificationRoutes);
app.use('/announcements', announcementRoutes);
app.use('/employees', employeeRoutes);
app.use('/sites', sitesRoutes);
app.use('/reports', reportsRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Timesheet API is running' });
});

app.get('/', (req, res) => {
    res.redirect('/app/');
});

// SPA fallback for non-file app routes only (Express 5 compatible)
app.get(/^\/app(?:\/.*)?$/, (req, res, next) => {
    if (path.extname(req.path)) return next();
    return res.sendFile(path.join(portalPath, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
