const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const timesheetRoutes = require('./routes/timesheet');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/timesheets', timesheetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Timesheet API is running' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
