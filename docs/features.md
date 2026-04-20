# Project Features

This document provides a comprehensive overview of the features implemented in the Timesheet Application, categorized by their completion status.

## 🚀 Completed Features

### 1. Authentication System
- **Secure Registration**: Users can create accounts with name, email, password, and optional avatar.
- **JWT-Based Login**: Token-based authentication for secure session management.
- **Persistent Sessions**: User remains logged in across app launches using local storage.
- **Password Reset**: Support for password reset workflow.

### 2. Daily Time Tracking (Check-In/Out)
- **Attendance Logging**: Manual arrival and departure tracking.
- **Real-time Status**: Dashboard updates immediately when the user is "On Duty".
- **History**: Weekly view of check-in and check-out times.

### 3. Activity & Timesheet Management
- **Detailed Activities**: Log specific tasks with title, details, and notes.
- **Timer Integration**: Start and stop activity timers to calculate duration.
- **Completion Tracking**: Mark activities as completed for reporting.
- **Project Association**: Categorize activities under specific project IDs.

### 4. Announcements & Notifications
- **System Announcements**: View company-wide news and updates with rich text content.
- **User Notifications**: Real-time alerts for system events or reminders.
- **Read Status**: Track which notifications have been viewed.

### 5. Dashboard & Analytics
- **Summary Widgets**: Interactive cards showing daily totals, active tasks, and recent announcements.
- **Dynamic Charts**: Visual representation of weekly effort and activities.
- **Weekly Overview**: Calendar-based view of overall performance.

---

### 🌗 Partial / In-Progress Features

### 1. PDF Report Generation
- **Status**: Backend ready for data extraction; Frontend integration with `pdfx` library started.
- **Goal**: Allow users to export weekly/monthly timesheets as formatted PDF documents.

### 2. Location Tracking
- **Status**: `geolocator` and `flutter_map` dependencies integrated.
- **Goal**: Verify arrival/departure locations to ensure compliance with site-based work.

### 3. Calendar View Enhancements
- **Status**: `table_calendar` integration complete.
- **Goal**: Add rich event details and historical data navigation directly from the calendar interface.

### 4. Profile Management
- **Status**: Backend `/auth/me` endpoint ready.
- **Goal**: Full UI for updating name, email, and uploading/changing profile avatars.
