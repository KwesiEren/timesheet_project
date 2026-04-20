const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheet');
const notificationRoutes = require('./routes/notifications');
const announcementRoutes = require('./routes/announcements');
const employeeRoutes = require('./routes/employees');

const app = express();
const port = process.env.PORT || 3000;

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/timesheets', timesheetRoutes);
app.use('/activities', timesheetRoutes); // Alias for Flutter APIServices
app.use('/notifications', notificationRoutes);
app.use('/announcements', announcementRoutes);
app.use('/employees', employeeRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Timesheet API is running' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
